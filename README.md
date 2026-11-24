# BizLine

AI phone receptionist SaaS for small businesses.

Paste a website URL → scrape + structure business context → create a Vapi voice assistant → provision a Twilio number → start answering calls. Call transcripts, summaries, recordings, and email notifications are handled automatically.

**Production:** [https://getbizline.xyz](https://getbizline.xyz)

---

## What you get

- Next.js App Router SaaS (auth, billing gate, onboarding, dashboard)
- Supabase Auth + Postgres + RLS
- Stripe subscriptions (Starter / Growth / Pro)
- Firecrawl website scrape + OpenAI structured business profile
- Vapi AI voice receptionist (auto-created/updated)
- Twilio number search/purchase + Vapi import
- End-of-call webhook → classify → store → email (Resend)
- Call recordings in the dashboard when Vapi provides a URL

---

## Stack

| Layer | Service |
|-------|---------|
| App / hosting | Next.js on Vercel |
| Auth + DB | Supabase |
| Billing | Stripe |
| Scrape | Firecrawl |
| LLM | OpenAI |
| Voice | Vapi |
| Phone numbers | Twilio |
| Email | Resend |

---

## Quick start (local)

1. Clone the repo and install:

```bash
npm install
cp .env.example .env.local
```

2. Fill `.env.local` using [`.env.example`](.env.example). Required keys:

- `APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + three `STRIPE_PRICE_*`
- `OPENAI_API_KEY`
- `FIRECRAWL_API_KEY`
- `VAPI_API_KEY` (**private** key only) + `VAPI_WEBHOOK_SECRET`
- `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN`
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL`

3. Create a Supabase project and run the schema:

```bash
# Supabase Dashboard → SQL Editor, or:
npx supabase link --project-ref <your-ref>
npx supabase db push --remote --yes
```

Migrations:

- [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
- [`supabase/migrations/0002_usage_billing_security.sql`](supabase/migrations/0002_usage_billing_security.sql) (usage metering + subscription RLS hardening)

4. Auth URL config (Supabase → Authentication → URL Configuration):

- Site URL: `http://localhost:3000` (local) or your production domain
- Redirect URLs: include `/auth/confirm` for local and production

5. Run:

```bash
npm run dev
```

6. Optional: grant yourself Pro without Stripe (SQL Editor):

[`supabase/scripts/grant-pro-plan.sql`](supabase/scripts/grant-pro-plan.sql)

---

## Production deploy (Vercel)

1. Create a Vercel project from this GitHub repo.
2. Set **all** env vars from `.env.example` (Production).
3. Set `APP_URL` to your production domain (e.g. `https://getbizline.xyz`).
4. Deploy.
5. Point DNS at Vercel (A/CNAME as shown in the Vercel domain UI).
6. Update Supabase Auth Site URL + redirect allow list to the production domain.
7. Stripe Dashboard → Webhooks → endpoint:

   `https://<your-domain>/api/stripe/webhook`

   Events used by the app:

   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

   Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

8. Vapi assistants get their server URL from `APP_URL` automatically:

   `{APP_URL}/api/vapi/webhook?secret={VAPI_WEBHOOK_SECRET}`

   No manual `/credential` setup. Use the **private** Vapi API key.

9. Resend: verify a sending domain and set `RESEND_FROM_EMAIL` accordingly  
   (e.g. `BizLine <notifications@yourdomain.com>`).  
   For smoke tests only, `onboarding@resend.dev` can send to the Resend account owner.

10. Included minutes default to **100 / 300 / 1,000** (Starter / Growth / Pro) and are
    enforced on inbound calls via Vapi `assistant-request`. Override with
    `PLAN_MINUTES_STARTER` / `PLAN_MINUTES_GROWTH` / `PLAN_MINUTES_PRO`.

---

## Product flow (demo script)

1. Sign up → subscribe (or grant Pro via SQL).
2. Onboarding: paste website URL.
3. Review structured business profile → **Launch receptionist** (creates/updates Vapi assistant).
4. **Generate phone number** (Twilio purchase + Vapi import).
5. Call the number → talk to the receptionist.
6. Dashboard → Calls: transcript, summary, classification, recording.
7. Email summary delivered to the account email.

---

## Buyer / ownership transfer

To run BizLine under your own accounts:

1. **Transfer or fork** this GitHub repository.
2. Create your own:
   - Supabase project (run `0001_init.sql`)
   - Vercel project (import repo, set env vars, attach domain)
   - Stripe products/prices (map Price IDs into env)
   - Vapi, Twilio, Firecrawl, OpenAI, Resend accounts/keys
3. Replace every value in `.env.local` / Vercel Production env. **Do not reuse seller secrets**.
4. Recreate the Stripe webhook against your production URL.
5. Confirm Supabase Auth redirect URLs for your domain.
6. Smoke-test: signup → paywall → onboarding → provision → call → dashboard + email.

### Recurring cost drivers (approx.; check each vendor)

| Vendor | Typical cost driver |
|--------|---------------------|
| Vercel | Hosting / bandwidth |
| Supabase | Free tier or Pro plan |
| Stripe | Transaction fees |
| Twilio | Per-number monthly + per-minute |
| Vapi | Per-minute voice usage |
| OpenAI | Tokens (onboarding + call classify) |
| Firecrawl | Scrape credits |
| Resend | Email volume / domain |

Phone numbers left in Twilio after a reset still bill monthly until released in the Twilio console.

---

## Known limitations

- One business per user.
- Hard paywall: dashboard requires `subscriptions.status = 'active'`.
- Call recordings depend on Vapi `artifactPlan` + webhook payload; older calls without a URL cannot be backfilled without a stored Vapi call ID.
- Resend requires a verified domain for reliable production delivery to arbitrary recipients.
- Do not use Vapi public keys in `VAPI_API_KEY`.

---

## Scripts

| Path | Purpose |
|------|---------|
| `supabase/migrations/0001_init.sql` | Full schema + RLS |
| `supabase/scripts/grant-pro-plan.sql` | Manually activate Pro for a user UUID |

---

## License / sale notes

Source in this repository is the product. Third-party accounts, API keys, phone numbers, and customer data are **not** included unless separately transferred.
