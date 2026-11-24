# BizLine Sale-Readiness Report

**Audit date:** 24 Nov 2026  
**Production URL:** https://getbizline.xyz  
**Auditor scope:** Independent Flippa auction readiness (no feature development)

---

## Verdict

**GO WITH DISCLOSURES**

BizLine is a working, deployable multi-tenant SaaS with a coherent product loop (onboard → voice line → dashboard). It is sellable as a **pre-revenue / starter SaaS** if Flippa pricing rules are respected and marketing claims are corrected or disclosed. It is **not** ready to accept real card payments from end customers until Stripe is switched to live mode and Resend has a verified sending domain.

---

## Phase 1: Production functionality matrix

| # | Check | Result | Evidence class |
|---|--------|--------|----------------|
| 1 | Homepage desktop | **Pass** | Physically verified (browser + HTTP 200) |
| 1b | Homepage mobile layout | **Pass (HTTP)** | Code/browser desktop verified; mobile UA not fully re-screenshoted this audit |
| 2 | Signup / login / logout / password recovery pages | **Partial** | Login physically verified; signup & forgot-password HTTP 200; logout UI present; full password-recovery email loop **Not verified** |
| 3 | Supabase auth + tenant isolation | **Pass (API + code)** | RLS policies in `0001_init.sql`; dashboard requires session; tables queried only via user/business ownership |
| 4 | Subscription gating | **Pass** | Middleware redirects non-`active` users to `/dashboard/billing`; unauth `/dashboard` → 307 login |
| 5–8 | Website scrape → OpenAI structure → review/edit | **Pass (prior physical + DB)** | Live business row “Sam's Air Control” with scraped fields; assistant exists. Re-run not repeated this audit |
| 9 | Vapi assistant create/config | **Pass (API)** | Assistant `c3b87b1c-…` present; `artifactPlan` + webhook URL on `getbizline.xyz` confirmed via Vapi API earlier in recovery |
| 10 | Twilio provision + Vapi connect | **Pass (API + UI)** | Dashboard shows Live `+1 (551) 310-5356`; Twilio account has that Incoming Number; Vapi phone linked to assistant |
| 11–12 | Incoming call reaches assistant; business-specific answers | **Not verified** | No completed `calls` rows in production DB (`calls` count = 0) |
| 13 | Transcripts, recordings, summaries | **Code + webhook ready; not verified end-to-end** | Webhook extracts recording URL + OpenAI classify; zero stored calls |
| 14 | Dashboard call list | **Pass (empty state)** | Physically verified Calls/Overview show 0 |
| 15 | Resend call-summary email | **Failed for general recipients** | Resend domains list empty; `onboarding@resend.dev` only delivers to account owner email |
| 16 | Settings persist + Vapi sync | **Code inspection** | `saveSettingsAction` + `ensureVapiAssistantForUser`; not re-tested this audit |

### Evidence notes (this audit)

- HTTP: `/` `/login` `/signup` `/forgot-password` → 200; `/dashboard*` unauthenticated → 307  
- Webhooks: Vapi without secret → 401; Stripe without signature → 400  
- Integrations alive: OpenAI, Firecrawl, Vapi, Twilio, Stripe **test** keys respond  
- Production DB: 1 user, 1 business, 1 assistant (active + number), **0 calls**, 1 subscription  

---

## Phase 2: Billing and production readiness

| Item | Finding |
|------|---------|
| Stripe mode | **Test mode** (`sk_test_…` in production env) |
| Listed prices | Landing/Billing: $49 / $149 / $399 |
| Stripe prices | Matching test prices: 4900 / 14900 / 39900 USD monthly (BizLine products) |
| Checkout | Session creation works in test (API verified earlier) |
| Webhook endpoint | `https://getbizline.xyz/api/stripe/webhook` enabled with required events |
| Signature validation | Present (`constructEvent`) |
| Customer portal | Implemented (`/api/stripe/portal` + billing page) |
| Cancellation | Via Stripe Customer Portal (code); number release on cancel **not implemented** |
| Minute entitlements | Advertised (100 / 500 / 2000) but **not enforced** in application code |
| Real paying customer path | **Blocked** until live Stripe keys + live prices + live webhook secret |

**Resend:** No verified domain. Production email to arbitrary customer inboxes will fail until a domain is verified and `RESEND_FROM_EMAIL` uses it.

---

## Phase 3: Security and operational risks (buyer-relevant)

| Risk | Severity | Notes |
|------|----------|-------|
| Secrets in Git | Low (good) | `.env*` gitignored; only `.env.example` placeholders tracked |
| Webhook auth | OK | Vapi query secret; Stripe signature |
| RLS | OK baseline | Per-user policies on core tables |
| Service role on server | Expected | Admin client for webhooks/provision |
| Duplicate Twilio purchase | Medium | Provision buys a new number if SID empty; no inventory reuse UX |
| Orphan Twilio numbers after cancel | Medium | Cancel does not release Twilio number → ongoing $1.15/mo risk |
| Call recording consent disclosure | Legal review | Recording enabled; no in-product consent/notice flow |
| Recording retention | Medium | Relies on Vapi retention (~14 days pay-as-you-go per Vapi docs) unless buyer stores copies |
| False social proof on auth UI | High for Flippa trust | “Trusted by thousands of small businesses” with no evidence |
| Call-forwarding marketing claim | High for Flippa trust | Hero says “Simply forward your calls” with **no product UI/docs/automation** |

---

## Phase 4: Transferability (summary)

Buyer **can** recreate the product from the repo + README + this handoff **using their own third-party accounts**. Most vendors do **not** transfer accounts; they recreate.

| Asset | Transfer vs recreate |
|-------|----------------------|
| GitHub repo | Transfer or hand off access |
| Domain `getbizline.xyz` | Transfer at registrar (GoDaddy nameservers observed) |
| Vercel project | Recreate under buyer team; reattach domain |
| Supabase project | Recreate + run `0001_init.sql` (no customer data dump expected for pre-revenue) |
| Stripe | Recreate products/prices in **buyer** Stripe; switch to live |
| Twilio / Vapi / OpenAI / Firecrawl / Resend | Buyer creates own keys; Twilio numbers usually re-provisioned |
| Env vars / webhooks | Buyer configures from `.env.example` |

---

## Phase 5: Marketing accuracy

### Supported by product (with caveats)

- Website paste → scrape → editable profile → Vapi receptionist  
- Dedicated Twilio number generation  
- 24/7 answering **capability** (assistant always on when number connected; not an SLA)  
- Transcripts / summaries / recordings **when calls complete and webhooks succeed**  
- Email notifications **when Resend can deliver**  
- Stripe subscriptions **in test**; live not configured  

### Overstated / unsupported

| Claim | Issue |
|-------|--------|
| “Trusted by thousands of small businesses” | No evidence; remove before listing |
| “Simply forward your calls” | No forwarding setup, SIP/BYO guide, or carrier instructions in-app |
| “under 2 minutes” (meta description) | Plausible for happy path; network/API latency can exceed |
| Plan minute buckets | Display-only; not metered/enforced |
| Lead & booking capture | Classification labels only; **no calendar booking integration** |

### Explicitly missing (confirmed not implemented)

- Automated after-hours routing (distinct schedule engine)  
- Direct number porting  
- Calendar booking integration  
- Multi-location / franchise management  
- Website AI chatbot  

---

## Phase 6: Cost sketch (public list prices, Nov 2026)

Assumptions: ~1 active demo tenant, ~100 answered minutes/month, US local number, Vercel Hobby or Pro, Supabase free/Pro, Resend free, Firecrawl free/hobby.

| Vendor | Fixed-ish | Variable |
|--------|-----------|----------|
| Vercel | $0 Hobby / $20 Pro | Bandwidth overages |
| Supabase | $0 free / $25 Pro | DB/auth beyond free |
| Twilio number | ~$1.15 / number / mo | ~$0.0085 / min inbound |
| Vapi | Usage; ~$0.05 / min hosting + model/voice pass-through | Scales with minutes |
| OpenAI | — | Onboarding + per-call classify (gpt-4o-mini class) |
| Firecrawl | $0–$19 | Per scrape credits |
| Resend | $0 free tier | Volume |
| Stripe | — | ~2.9% + $0.30 / successful charge |

**Ballpark operating floor for a quiet demo:** roughly **$0–$50/mo** on free tiers + Twilio number + light usage.  
**Ballpark for small production traffic (hundreds of minutes):** often **$50–$200+/mo** depending on Vapi voice stack and plan choices.

Sources: Twilio Voice US pricing, Vapi pricing page, OpenAI pricing, Firecrawl pricing, Resend pricing, Vercel/Supabase public plans (checked Nov 2026).

---

## Critical issues before accepting a buyer’s money as *operator of a live SaaS*

1. Stripe still in **test mode** in production.  
2. Resend **domain not verified**.  
3. Hero/auth marketing contains **non-transferable trust / forwarding claims**.  
4. **No production call artifacts** in DB at audit time (end-to-end voice proof incomplete for this audit).  
5. Plan **minutes not enforced**.

---

## Honest limitations (disclose on Flippa)

- Pre-revenue; no paying customers claimed.  
- Seller-operated demo accounts / manual Pro grants may exist.  
- Voice quality and costs depend on Vapi + Twilio + model choices.  
- Buyer must stand up their own cloud/vendor accounts.  
- Recording/privacy compliance is buyer’s responsibility.  

---

## Five biggest due-diligence risks for a buyer

1. **Stripe live cutover** surprises (tax, portal, webhook, failed first charge).  
2. **COGS** on Vapi minutes erodes Starter $49 margins if voice stack is expensive.  
3. **Twilio number sprawl** if churned tenants aren’t cleaned up.  
4. **Marketing vs product gaps** (forwarding, minute caps, “thousands of businesses”).  
5. **Email deliverability** until domain authentication (SPF/DKIM) is done.  

---

## Minimum work to publish the auction listing

See [`FINAL_ACTION_ITEMS.md`](./FINAL_ACTION_ITEMS.md). Short version: fix false claims, add Flippa potential-revenue boilerplate, set auction reserve ≤ $9,999 (or use Projects & Concepts rules), attach Loom URL, disclose Stripe test / Resend / no enforced minutes, and optionally complete one recorded live call for proof.
