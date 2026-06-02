-- CursorHackathon.xyz initial schema
-- RLS is enabled on all public tables.

create extension if not exists pgcrypto;

-- USERS
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- BUSINESSES (1 per user)
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade unique,

  business_name text,
  website text,
  google_business_url text,
  services jsonb not null default '[]'::jsonb,
  hours text,
  phone text,
  address text,
  additional_context text,
  first_message text,
  system_prompt text,

  created_at timestamptz not null default now()
);

create index if not exists businesses_user_id_idx on public.businesses (user_id);

-- ASSISTANTS (1 per business)
create table if not exists public.assistants (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade unique,

  vapi_assistant_id text,
  twilio_phone_number text,
  twilio_sid text,
  active boolean not null default false
);

create index if not exists assistants_business_id_idx on public.assistants (business_id);

-- CALLS
create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,

  caller_number text,
  duration integer,
  transcript text,
  summary text,
  outcome text,
  urgency text,
  sentiment text,
  recording_url text,

  created_at timestamptz not null default now()
);

create index if not exists calls_business_id_idx on public.calls (business_id);
create index if not exists calls_created_at_idx on public.calls (created_at desc);

-- SUBSCRIPTIONS (1 per user)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade unique,

  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  plan text
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- Grants (per Supabase RLS docs)
grant select on public.users to anon;
grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.users to service_role;

grant select on public.businesses to anon;
grant select, insert, update, delete on public.businesses to authenticated;
grant select, insert, update, delete on public.businesses to service_role;

grant select on public.assistants to anon;
grant select, insert, update, delete on public.assistants to authenticated;
grant select, insert, update, delete on public.assistants to service_role;

grant select on public.calls to anon;
grant select, insert, update, delete on public.calls to authenticated;
grant select, insert, update, delete on public.calls to service_role;

grant select on public.subscriptions to anon;
grant select, insert, update, delete on public.subscriptions to authenticated;
grant select, insert, update, delete on public.subscriptions to service_role;

-- Enable RLS
alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.assistants enable row level security;
alter table public.calls enable row level security;
alter table public.subscriptions enable row level security;

-- Policies

-- users: user can manage own user row
drop policy if exists users_select_own on public.users;
create policy users_select_own
on public.users
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists users_insert_own on public.users;
create policy users_insert_own
on public.users
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own
on public.users
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id)
with check ((select auth.uid()) is not null and (select auth.uid()) = id);

-- businesses: user can manage own business
drop policy if exists businesses_select_own on public.businesses;
create policy businesses_select_own
on public.businesses
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists businesses_insert_own on public.businesses;
create policy businesses_insert_own
on public.businesses
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists businesses_update_own on public.businesses;
create policy businesses_update_own
on public.businesses
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

-- assistants: access controlled via owned business
drop policy if exists assistants_select_own_business on public.assistants;
create policy assistants_select_own_business
on public.assistants
for select
to authenticated
using (
  exists (
    select 1
    from public.businesses b
    where b.id = assistants.business_id
      and (select auth.uid()) is not null
      and b.user_id = (select auth.uid())
  )
);

drop policy if exists assistants_insert_own_business on public.assistants;
create policy assistants_insert_own_business
on public.assistants
for insert
to authenticated
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = assistants.business_id
      and (select auth.uid()) is not null
      and b.user_id = (select auth.uid())
  )
);

drop policy if exists assistants_update_own_business on public.assistants;
create policy assistants_update_own_business
on public.assistants
for update
to authenticated
using (
  exists (
    select 1
    from public.businesses b
    where b.id = assistants.business_id
      and (select auth.uid()) is not null
      and b.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = assistants.business_id
      and (select auth.uid()) is not null
      and b.user_id = (select auth.uid())
  )
);

-- calls: access controlled via owned business
drop policy if exists calls_select_own_business on public.calls;
create policy calls_select_own_business
on public.calls
for select
to authenticated
using (
  exists (
    select 1
    from public.businesses b
    where b.id = calls.business_id
      and (select auth.uid()) is not null
      and b.user_id = (select auth.uid())
  )
);

drop policy if exists calls_insert_own_business on public.calls;
create policy calls_insert_own_business
on public.calls
for insert
to authenticated
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = calls.business_id
      and (select auth.uid()) is not null
      and b.user_id = (select auth.uid())
  )
);

drop policy if exists calls_update_own_business on public.calls;
create policy calls_update_own_business
on public.calls
for update
to authenticated
using (
  exists (
    select 1
    from public.businesses b
    where b.id = calls.business_id
      and (select auth.uid()) is not null
      and b.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = calls.business_id
      and (select auth.uid()) is not null
      and b.user_id = (select auth.uid())
  )
);

-- subscriptions: user can manage own subscription row
drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own
on public.subscriptions
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists subscriptions_insert_own on public.subscriptions;
create policy subscriptions_insert_own
on public.subscriptions
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists subscriptions_update_own on public.subscriptions;
create policy subscriptions_update_own
on public.subscriptions
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

