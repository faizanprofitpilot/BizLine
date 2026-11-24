# BizLine Sale-Readiness Report

**Audit / implementation update:** 24 Nov 2026  
**Production URL:** https://getbizline.xyz  

---

## Verdict

**GO WITH DISCLOSURES** (improved commercial controls; live Stripe cutover still needs seller approval)

Code now enforces:

- Server-side Stripe price allowlisting
- Subscription rows not writable by authenticated clients (RLS)
- Stripe webhook idempotency + period/plan sync
- Atomic call-minute reservations via `assistant-request`
- Dashboard usage meter

Remaining seller actions before treating live payments as fully verified:

1. Create **live-mode** BizLine prices ($49 / $149 / $399) — CLI restricted key lacked `product_write`
2. Set Vercel Production `STRIPE_SECRET_KEY` to `sk_live_…` and live price IDs + live webhook secret
3. Confirm Resend domain `getbizline.xyz` and set `RESEND_FROM_EMAIL` to a verified sender (API listing was blocked from this environment with Cloudflare 1010)

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

---

## Testing

- Unit tests: `npm test` (plan allowlist, remaining seconds, Stripe shape helpers) — pass
- Lint / `tsc` / `next build` — pass
- Live card charge — **not run** (requires your approval)
- Physical inbound quota rejection — **not claimed** without a controlled test call after live deploy + phone routing sync

---

## Five buyer diligence risks (updated)

1. Live Stripe keys / prices must be set under the **buyer’s** Stripe account after transfer  
2. Voice COGS vs included minutes  
3. Twilio numbers not auto-released on cancel  
4. Resend domain must be verified under buyer’s Resend account  
5. Demo line isolation must remain correctly flagged  
