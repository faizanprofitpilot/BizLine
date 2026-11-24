-- Usage metering + billing security
-- Do not edit 0001_init.sql; this migration is additive.

-- ---------------------------------------------------------------------------
-- Subscriptions: period + usage counters (authoritative for entitlements)
-- ---------------------------------------------------------------------------
alter table public.subscriptions
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists included_seconds integer not null default 0,
  add column if not exists used_seconds integer not null default 0,
  add column if not exists reserved_seconds integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- Assistants: optional demo flag + Vapi phone number id for routing updates
-- ---------------------------------------------------------------------------
alter table public.assistants
  add column if not exists is_demo boolean not null default false,
  add column if not exists vapi_phone_number_id text;

-- ---------------------------------------------------------------------------
-- Call usage ledger (dedupe by Vapi call id)
-- ---------------------------------------------------------------------------
create table if not exists public.call_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  call_id uuid references public.calls(id) on delete set null,
  vapi_call_id text not null,
  reserved_seconds integer not null default 0,
  billed_seconds integer not null default 0,
  status text not null default 'reserved'
    check (status in ('reserved', 'committed', 'released', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vapi_call_id)
);

create index if not exists call_usage_user_id_idx on public.call_usage (user_id);
create index if not exists call_usage_business_id_idx on public.call_usage (business_id);

-- ---------------------------------------------------------------------------
-- Stripe webhook idempotency
-- ---------------------------------------------------------------------------
create table if not exists public.stripe_webhook_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Calls: store Vapi call id for reconciliation
-- ---------------------------------------------------------------------------
alter table public.calls
  add column if not exists vapi_call_id text;

create unique index if not exists calls_vapi_call_id_uidx
  on public.calls (vapi_call_id)
  where vapi_call_id is not null;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select on public.call_usage to authenticated;
grant select, insert, update, delete on public.call_usage to service_role;

grant select, insert, update, delete on public.stripe_webhook_events to service_role;

-- ---------------------------------------------------------------------------
-- RLS: customers may SELECT their subscription / usage, never mutate billing
-- ---------------------------------------------------------------------------
drop policy if exists subscriptions_insert_own on public.subscriptions;
drop policy if exists subscriptions_update_own on public.subscriptions;

-- Keep select-own; no insert/update for authenticated on subscriptions.
-- Service role bypasses RLS for webhook/admin writes.

alter table public.call_usage enable row level security;
alter table public.stripe_webhook_events enable row level security;

drop policy if exists call_usage_select_own on public.call_usage;
create policy call_usage_select_own
on public.call_usage
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

-- No authenticated writes on call_usage or stripe_webhook_events.

-- Also prevent authenticated clients from forging call rows that inflate history
-- via arbitrary inserts is still allowed for own business; metering is server-side.
-- Tighten assistants: users should not flip is_demo.
-- (Application uses service role for provisioning; keep existing assistants policies.)

-- ---------------------------------------------------------------------------
-- Atomic usage functions
-- ---------------------------------------------------------------------------
create or replace function public.reserve_call_usage(
  p_user_id uuid,
  p_business_id uuid,
  p_vapi_call_id text,
  p_requested_seconds integer
)
returns table (
  allowed boolean,
  reserved_seconds integer,
  remaining_seconds integer,
  reason text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  sub public.subscriptions%rowtype;
  remaining integer;
  to_reserve integer;
  existing public.call_usage%rowtype;
begin
  if p_requested_seconds is null or p_requested_seconds <= 0 then
    return query select false, 0, 0, 'invalid_request';
    return;
  end if;

  select * into existing from public.call_usage cu where cu.vapi_call_id = p_vapi_call_id;
  if found then
    if existing.status = 'reserved' then
      return query select true, existing.reserved_seconds,
        greatest(
          0,
          (select s.included_seconds - s.used_seconds - s.reserved_seconds
           from public.subscriptions s where s.user_id = p_user_id)
        ),
        'already_reserved';
      return;
    elsif existing.status = 'committed' then
      return query select true, existing.billed_seconds, 0, 'already_committed';
      return;
    end if;
  end if;

  select * into sub
  from public.subscriptions s
  where s.user_id = p_user_id
  for update;

  if not found then
    return query select false, 0, 0, 'no_subscription';
    return;
  end if;

  if coalesce(sub.status, '') not in ('active', 'trialing') then
    return query select false, 0, 0, 'subscription_inactive';
    return;
  end if;

  remaining := greatest(
    0,
    coalesce(sub.included_seconds, 0) - coalesce(sub.used_seconds, 0) - coalesce(sub.reserved_seconds, 0)
  );
  if remaining <= 0 then
    return query select false, 0, 0, 'quota_exhausted';
    return;
  end if;

  to_reserve := least(p_requested_seconds, remaining);

  insert into public.call_usage (
    user_id, business_id, vapi_call_id, reserved_seconds, status
  ) values (
    p_user_id, p_business_id, p_vapi_call_id, to_reserve, 'reserved'
  );

  update public.subscriptions s
  set reserved_seconds = coalesce(s.reserved_seconds, 0) + to_reserve,
      updated_at = now()
  where s.user_id = p_user_id;

  return query select true, to_reserve, remaining - to_reserve, 'ok';
end;
$$;

create or replace function public.commit_call_usage(
  p_vapi_call_id text,
  p_billed_seconds integer,
  p_call_id uuid default null
)
returns table (
  ok boolean,
  billed_seconds integer,
  reason text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  usage public.call_usage%rowtype;
  billed integer;
begin
  billed := greatest(0, coalesce(p_billed_seconds, 0));

  select * into usage
  from public.call_usage cu
  where cu.vapi_call_id = p_vapi_call_id
  for update;

  if not found then
    -- Late commit without prior reserve: create committed row and bill if possible.
    -- Prefer idempotent no-op for unknown calls from other systems.
    return query select false, 0, 'not_found';
    return;
  end if;

  if usage.status = 'committed' then
    return query select true, usage.billed_seconds, 'already_committed';
    return;
  end if;

  if usage.status = 'released' then
    return query select false, 0, 'already_released';
    return;
  end if;

  -- Cap billed to what was reserved for this call (prevents over-billing one reservation)
  billed := least(billed, usage.reserved_seconds);

  update public.call_usage cu
  set status = 'committed',
      billed_seconds = billed,
      call_id = coalesce(p_call_id, cu.call_id),
      updated_at = now()
  where cu.vapi_call_id = p_vapi_call_id;

  update public.subscriptions s
  set reserved_seconds = greatest(0, coalesce(s.reserved_seconds, 0) - usage.reserved_seconds),
      used_seconds = coalesce(s.used_seconds, 0) + billed,
      updated_at = now()
  where s.user_id = usage.user_id;

  return query select true, billed, 'ok';
end;
$$;

create or replace function public.release_call_usage(
  p_vapi_call_id text
)
returns table (
  ok boolean,
  reason text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  usage public.call_usage%rowtype;
begin
  select * into usage
  from public.call_usage cu
  where cu.vapi_call_id = p_vapi_call_id
  for update;

  if not found then
    return query select false, 'not_found';
    return;
  end if;

  if usage.status <> 'reserved' then
    return query select true, 'noop_' || usage.status;
    return;
  end if;

  update public.call_usage cu
  set status = 'released', updated_at = now()
  where cu.vapi_call_id = p_vapi_call_id;

  update public.subscriptions s
  set reserved_seconds = greatest(0, coalesce(s.reserved_seconds, 0) - usage.reserved_seconds),
      updated_at = now()
  where s.user_id = usage.user_id;

  return query select true, 'released';
end;
$$;

revoke all on function public.reserve_call_usage(uuid, uuid, text, integer) from public;
revoke all on function public.commit_call_usage(text, integer, uuid) from public;
revoke all on function public.release_call_usage(text) from public;
grant execute on function public.reserve_call_usage(uuid, uuid, text, integer) to service_role;
grant execute on function public.commit_call_usage(text, integer, uuid) to service_role;
grant execute on function public.release_call_usage(text) to service_role;
