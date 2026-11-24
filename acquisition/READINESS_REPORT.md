# BizLine Sale-Readiness Report

**Audit / verification update:** 24 Nov 2026  
**Production URL:** https://getbizline.xyz  
**Production deploy:** `dpl_8y6TzaJNMw1QAC3Q6Y7czVcn2TNR` (aliased)

---

## Verdict

**GO WITH DISCLOSURES** — live Stripe, Resend, and minute enforcement are verified in Production. Flippa listing still needs Loom URL + auction field entry (seller).

### Verified 24 Nov 2026 (live cutover)

| Integration | Result | Notes |
|-------------|--------|-------|
| Resend domain `getbizline.xyz` | **PASS** | status=`verified` |
| `RESEND_FROM_EMAIL` | **PASS** | `BizLine <notifications@getbizline.xyz>` |
| Resend delivery (external Gmail) | **PASS** | API `last_event=delivered` |
| Live Stripe account | **PASS** | PROFITPILOT LLC; charges/payouts enabled |
| Live Stripe Starter $49 | **PASS** | product `BizLine Starter`, monthly USD |
| Live Stripe Growth $149 | **PASS** | product `BizLine Growth`, monthly USD |
| Live Stripe Pro $399 | **PASS** | product `BizLine Pro`, monthly USD (not BizDial) |
| `STRIPE_SECRET_KEY` live | **PASS** | `sk_live_…` in `.env.local` + Vercel Production |
| `STRIPE_WEBHOOK_SECRET` | **PASS** | signed `ping` → Production `/api/stripe/webhook` returned 200; bad sig → 400 |
| Live webhook endpoint | **PASS** | `https://getbizline.xyz/api/stripe/webhook` enabled; required events present |
| Stripe env sync → Vercel Production | **PASS** | secret + 3 price IDs + webhook secret updated; redeployed |
| Live Checkout session create | **PASS** | `cs_live_…` for $49 / $149 / $399; sessions expired (no card charge) |
| Billing portal session | **PASS** | `bps_…` livemode URL created |
| Subscription cancel path | **PASS** | 1-day trial sub created + canceled (`trialing` → `canceled`); no card charged |
| Webhook processing | **PASS** | `customer.subscription.created` / `deleted`, `invoice.paid` ($0 trial), and verify `ping` recorded in `stripe_webhook_events` |
| Minute enforcement RPCs | **PASS** | `reserve` / `commit` / `release` + `quota_exhausted` verified after `0003` fix |
| Demo `+15513105356` | **PASS** | `assistants.is_demo=true`, active |

**Card charges:** not run (no approval). Verification used Checkout session create/expire, portal sessions, and a no-PM trial cancel only.

---

## Plan minutes (enforced)

Safer defaults shipped (override with `PLAN_MINUTES_*`):

| Plan | Price | Included minutes |
|------|------:|-----------------:|
| Starter | $49 | 100 |
| Growth | $149 | 300 |
| Pro | $399 | 1,000 |

**Economics:** Original 500 / 2,000 allotments are likely uneconomic with the current gpt-4o voice stack (~$0.20–$0.35 fully loaded / min). Approve changing defaults via env if desired.

---

## Usage enforcement

1. Phone numbers are provisioned **without** a static Vapi `assistantId`.
2. Inbound calls hit `/api/vapi/webhook` as `assistant-request`.
3. Server loads business + subscription, reserves seconds atomically (`reserve_call_usage`).
4. Response returns `assistantId` + `maxDurationSeconds` capped to remaining allowance.
5. Exhausted quota → spoken/error rejection (no AI connect).
6. `end-of-call-report` commits actual duration once (`commit_call_usage`) and emails summary.

**Demo line** `+15513105356` is flagged `is_demo=true` and bypasses paid quota (does not grant Pro to other accounts).

**Fix applied 24 Nov 2026:** `0003_fix_usage_rpc_ambiguity.sql` — PL/pgSQL out-param vs column ambiguity on `reserved_seconds` broke live `reserve_call_usage`; patched in Production.

**Limitation:** Hard mid-call disconnect beyond `maxDurationSeconds` depends on Vapi honoring `assistantOverrides.maxDurationSeconds`. Overages within that cap are still billed against reserved seconds.

---

## Billing security

- Dropped authenticated `INSERT`/`UPDATE` RLS on `subscriptions`
- Checkout / webhook write via service role only
- Price IDs must match `STRIPE_PRICE_*` allowlist
- Stripe event IDs stored in `stripe_webhook_events` for dedupe

---

## Migrations applied

- `0001_init.sql` (existing)
- `0002_usage_billing_security.sql` (**applied** to production Supabase `awvthjselptzvatfisus`)
- `0003_fix_usage_rpc_ambiguity.sql` (**applied** 24 Nov 2026)

---

## Testing

- Unit tests: `npm test` (plan allowlist, remaining seconds, Stripe shape helpers) — pass
- Lint / `tsc` / `next build` — pass (prior)
- Live Checkout URL creation — **PASS** (no payment completed)
- Live portal + trial cancel — **PASS** (no card charged)
- Webhook signature + event ingest — **PASS**
- Resend external delivery — **PASS**
- Live card charge — **not run** (requires approval)
- Physical inbound quota rejection call — **not claimed** without a controlled test call

---

## Five buyer diligence risks (updated)

1. Live Stripe keys / prices must be set under the **buyer’s** Stripe account after transfer  
2. Voice COGS vs included minutes  
3. Twilio numbers not auto-released on cancel  
4. Resend domain must be verified under buyer’s Resend account  
5. Demo line isolation must remain correctly flagged  
