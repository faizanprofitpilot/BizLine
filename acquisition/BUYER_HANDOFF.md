# BizLine Buyer Handoff

Step-by-step guide for a buyer to operate BizLine under **their own** accounts. Do not reuse seller API keys in production.

**Repo:** this GitHub repository  
**Reference production:** https://getbizline.xyz (until domain transfer)  
**Schema:** [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql)  
**Env template:** [`.env.example`](../.env.example)  
**Root README:** [`README.md`](../README.md)

---

## 1. Ownership transfer checklist

| # | Asset | Action | Who |
|---|--------|--------|-----|
| 1 | GitHub repository | Transfer ownership or add buyer as owner; revoke seller | GitHub |
| 2 | Domain `getbizline.xyz` | Unlock + transfer at registrar (currently third-party DNS / GoDaddy NS observed) | Registrar |
| 3 | Vercel project | Buyer creates new project from repo; seller removes domain from old project after cutover | Vercel |
| 4 | Supabase project | Buyer creates new project; run migration; seller archives old project after export (if any) | Supabase |
| 5 | Stripe | Buyer creates products/prices in **their** Stripe (prefer **live**); new webhook | Stripe |
| 6 | Twilio | Buyer account; re-provision numbers (numbers rarely “move” between accounts without porting) | Twilio |
| 7 | Vapi | Buyer private API key; assistants recreated by app onboarding | Vapi |
| 8 | OpenAI | Buyer API key | OpenAI |
| 9 | Firecrawl | Buyer API key | Firecrawl |
| 10 | Resend | Buyer API key + **verified domain** | Resend |
| 11 | Secrets | New `VAPI_WEBHOOK_SECRET`, Stripe webhook secret, Supabase keys | Buyer |
| 12 | Demo/test users | Delete seller demo accounts before or after transfer | Either |

**Cannot simply transfer:** most API accounts, historical Stripe customers (none expected), Vapi assistants bound to seller org, Twilio numbers without porting paperwork.

---

## 2. Infrastructure setup (greenfield)

### 2.1 Supabase

1. Create a Free or Pro project.  
2. Run [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql) in SQL Editor (or `supabase db push --remote`).  
3. Auth → URL Configuration:  
   - Site URL = `https://YOUR_DOMAIN`  
   - Redirect allow list includes `https://YOUR_DOMAIN/auth/confirm` and local if needed  
4. Copy Project URL, anon key, service role key into env.

Optional: [`supabase/scripts/grant-pro-plan.sql`](../supabase/scripts/grant-pro-plan.sql) for comps only.

### 2.2 Vercel

1. Import the GitHub repo.  
2. Framework: Next.js.  
3. Set **all** variables from `.env.example` for Production.  
4. Set `APP_URL=https://YOUR_DOMAIN`.  
5. Deploy; attach custom domain; fix DNS.

### 2.3 Stripe (buyer’s own account — not transferable)

1. Create three live recurring monthly Prices: Starter $49, Growth $149, Pro $399.  
2. Put Price IDs in `STRIPE_PRICE_STARTER` / `_GROWTH` / `_PRO` (server allowlists these).  
3. Webhook endpoint: `https://YOUR_DOMAIN/api/stripe/webhook`  
4. Events:  
   - `checkout.session.completed`  
   - `customer.subscription.created`  
   - `customer.subscription.updated`  
   - `customer.subscription.deleted`  
   - `invoice.paid`  
   - `invoice.payment_failed`  
5. Put signing secret in `STRIPE_WEBHOOK_SECRET`.  
6. Use **live** secret key (`sk_live_…`) for real customers; keep `sk_test_…` for local.  
7. Optional minute overrides: `PLAN_MINUTES_STARTER`, `PLAN_MINUTES_GROWTH`, `PLAN_MINUTES_PRO` (defaults 100 / 300 / 1000).  

Run migrations including `0002_usage_billing_security.sql` so usage RPCs and subscription RLS hardening exist.

### 2.4 Voice stack

1. **Vapi:** private API key only → `VAPI_API_KEY`. Generate a long random `VAPI_WEBHOOK_SECRET`.  
2. Assistants are created by the app (`ensureVapiAssistantForUser`) with `server.url = {APP_URL}/api/vapi/webhook?secret=…`.  
3. **Twilio:** Account SID + Auth Token. App searches/purchases a US local number and imports it into Vapi.  
4. Expect ~$1.15/mo per local number + per-minute voice charges.

### 2.5 Ancillary

- OpenAI key (onboarding + call classification)  
- Firecrawl key (website scrape)  
- Resend key + **verified domain** FROM address (e.g. `BizLine <notifications@yourdomain.com>`)  

### 2.6 Usage enforcement

Inbound numbers must use Vapi **assistant-request** (no static assistant on the phone number). Provisioning does this automatically. After cutover, re-save / re-provision existing numbers so routing hits `/api/vapi/webhook`.  

---

## 3. Environment variables

Copy from [`.env.example`](../.env.example):

```
APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_STARTER
STRIPE_PRICE_GROWTH
STRIPE_PRICE_PRO
OPENAI_API_KEY
FIRECRAWL_API_KEY
VAPI_API_KEY
VAPI_WEBHOOK_SECRET
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
RESEND_API_KEY
RESEND_FROM_EMAIL
```

Never commit `.env.local`.

---

## 4. Smoke-test after cutover

1. Sign up a fresh user.  
2. Complete Stripe Checkout (live or test intentionally).  
3. Confirm `subscriptions.status = active` and dashboard unlocks.  
4. Onboard with a real website URL.  
5. Launch receptionist → Generate phone number.  
6. Place a real inbound call.  
7. Confirm Calls detail: transcript, summary, badges, recording if provided.  
8. Confirm email arrives.  
9. Edit Settings → Save → confirm Vapi still answers with new copy.  
10. Open Customer Portal → cancel/reactivate path.

---

## 5. Estimated recurring costs

See [`READINESS_REPORT.md`](./READINESS_REPORT.md) Phase 6.  

**Buyer takeaway:** SaaS subscription revenue must cover **Twilio + Vapi minute COGS** first; Starter pricing can be tight depending on voice provider mix.

---

## 6. Operational gotchas

- Canceling a subscription does **not** automatically release the Twilio number.  
- Plan “minutes” on the marketing page are **not** enforced in code.  
- Recording URLs may expire per Vapi retention; download/archive if needed.  
- Changing `APP_URL` or `VAPI_WEBHOOK_SECRET` requires re-saving Settings (or re-running assistant sync) so Vapi webhooks keep working.  

---

## 7. What the seller should deliver at closing

1. GitHub access / transfer confirmation  
2. Domain transfer auth code  
3. List of current env var **names** (not values) and which vendor each maps to  
4. This `acquisition/` folder + root README  
5. Loom demo URL  
6. Confirmation that seller keys will be rotated/revoked after cutover  
