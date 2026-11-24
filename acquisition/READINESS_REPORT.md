# BizLine Sale-Readiness Report

**Audit / implementation update:** 24 Nov 2026  
**Production URL:** https://getbizline.xyz  

---

## Verdict

**GO WITH DISCLOSURES** — product/usage controls are live; **Stripe live cutover is not complete**

### Verified 24 Nov 2026 (post seller credential update)

| Integration | Result | Notes |
|-------------|--------|-------|
| Resend domain `getbizline.xyz` | **PASS** | status=`verified` |
| `RESEND_FROM_EMAIL` | **PASS** | `BizLine <notifications@getbizline.xyz>` |
| Resend delivery (external Gmail) | **PASS** | API `last_event=delivered` |
| Live Stripe products Starter $49 / Growth $149 | **PASS** | Live prices exist and match |
| Live Stripe Pro $399 | **FAIL in `.env.local`** | `STRIPE_PRICE_PRO` points to **BizDial Pro $999**, not BizLine Pro $399 |
| `STRIPE_SECRET_KEY` live | **FAIL in `.env.local`** | Still `sk_test_…` (no `sk_live_` present) |
| Live webhook `getbizline.xyz/api/stripe/webhook` | **PASS** | enabled in live mode with required events |
| Stripe env sync to Vercel Production | **BLOCKED** | Would not publish `sk_test_` or wrong Pro price as “live” |
| Minute enforcement RPCs | **PASS** | `reserve/commit/release_call_usage` present |
| Demo `+15513105356` | **PASS** | `is_demo=true`, active, still on homepage |

**Required before live Checkout:** put `sk_live_…` in `.env.local`, set `STRIPE_PRICE_PRO` to the live BizLine Pro **$399** price (not BizDial), put the live webhook signing secret in `STRIPE_WEBHOOK_SECRET`, then re-run Production env sync.

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
