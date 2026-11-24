# Flippa Listing Draft — BizLine

Use with Flippa’s **Auction** format for a pre-revenue SaaS. Keep claims aligned with [`READINESS_REPORT.md`](./READINESS_REPORT.md). Do not invent traction.

---

## Suggested listing title

**BizLine — AI Phone Receptionist SaaS (Next.js + Supabase + Twilio + Vapi) | Pre-Revenue**

Alternate (shorter):  
**BizLine | AI Business Phone Line SaaS | Full Source + Docs | Pre-Revenue Auction**

---

## Short description

BizLine is a multi-tenant SaaS that gives small businesses an AI phone receptionist: scrape their website, build business knowledge with AI, provision a dedicated Twilio number via Vapi, answer calls 24/7, and deliver transcripts, recordings, summaries, and email notifications. Built with Next.js, Supabase, Stripe, Twilio, Vapi, OpenAI, Firecrawl, and Resend. Live demo at getbizline.xyz. Pre-revenue; sold as a complete product + codebase ready for a buyer to operate under their own accounts.

---

## Full description

### Overview

BizLine helps local and service businesses answer the phone when they cannot. A business owner signs up, pays for a plan, submits their website, reviews AI-generated knowledge (hours, services, FAQs), launches an AI receptionist, and gets a dedicated US phone number. Callers reach the AI assistant; owners see call history in a dashboard and can receive summary emails.

The product is deployed and usable end-to-end for signup → subscription (seller Production uses Stripe **live** mode with BizLine $49 / $149 / $399 prices) → onboarding → number provisioning → inbound AI answering → post-call artifacts. Buyer should still recreate Stripe under their own account after purchase.

### What is included

- Full source code (Next.js App Router)
- Supabase schema + RLS migration
- Stripe Checkout, Customer Portal, and webhook handlers
- Vapi assistant lifecycle + Twilio number provisioning
- Firecrawl + OpenAI onboarding pipeline
- Resend call-summary emails
- Marketing site + authenticated dashboard
- Buyer handoff docs (`acquisition/`)
- Product Loom walkthrough (see URL below)

### What is NOT included / not claimed

- No guaranteed paying customers or MRR
- No proven market traction or fabricated social proof
- No calendar booking, number porting, multi-location franchise console, or website chatbot
- Automated after-hours routing is **not** a separate product feature beyond “AI always answers the BizLine number”
- Seller Production Stripe is **live** (BizLine prices); buyer must still configure **their own** live Stripe products, prices, and webhooks after transfer
- Seller Production Resend domain `getbizline.xyz` is verified; buyer must verify sending under their own Resend account / domain after transfer

### Live marketing site (aligned Nov 2026)

Public copy on https://getbizline.xyz now matches product reality:

- Dedicated Twilio number + AI receptionist is the hero value prop
- Existing-number use is described as **customer-managed forwarding** via their phone provider (not porting or in-app forwarding setup)
- Plans are $49 / $149 / $399 monthly positioned by call-volume guidance — **no advertised included-minute allotments**
- Lead/inquiry classification is claimed; calendar booking is not
- No “trusted by thousands” or similar social proof

### Monetization model

Three monthly SaaS plans (Starter $49 / Growth $149 / Pro $399) billed via Stripe Checkout + Customer Portal. Included AI call minutes are enforced server-side (defaults 100 / 300 / 1,000). Usage costs (Twilio + Vapi + OpenAI) are the buyer’s COGS.

### Current revenue and customers

**$0 revenue. Pre-revenue. No paying customers.**  
Any accounts on the live demo are seller/demo accounts for verification.

### Why sell

Seller is listing as a complete pre-revenue SaaS asset for a buyer who wants to own and grow an AI telephony product without building the stack from scratch. (Customize personal reason as needed.)

### Tech stack

Next.js · Supabase (Auth, Postgres, RLS) · Vercel · Stripe · Twilio · Vapi · OpenAI · Firecrawl · Resend

### Key features (honest)

- Email/password auth with tenant isolation (Supabase RLS)
- Stripe subscription gating for dashboard access
- Website URL → Firecrawl scrape → OpenAI structured business knowledge
- Editable business profile / knowledge before and after launch
- Vapi AI receptionist + Twilio dedicated local number
- Inbound calls answered with business-specific context
- Call list + detail: transcript, summary, classification badges, recording when available
- Email notifications for call summaries (production-ready with verified Resend domain)
- Settings persistence with assistant re-sync

### Demo

**Loom URL:** `[PASTE EXISTING LOOM URL HERE]`  
**Live site:** https://getbizline.xyz  

Buyer due diligence tip: create your own trial account after purchase under your keys; do not rely on seller demo credentials long-term.

---

## Suggested Flippa fields

| Field | Suggested value |
|--------|------------------|
| Listing type | Auction |
| Asset type | SaaS / Software |
| Monetization | Subscription |
| Revenue | $0 / Pre-revenue |
| Profit | $0 |
| Traffic | Disclose honestly (likely low; do not fabricate) |
| Age | Per actual first launch / Flippa history |
| Exclusive | Yes (if true) |
| Reason for sale | Customize |
| Multiple | N/A (pre-revenue) |
| Reserve | Per Flippa pre-revenue guidance (often ≤ $9,999 class — confirm current Flippa rules) |

---

## Disclosures (copy into listing)

1. **Pre-revenue.** No paying customers or MRR.  
2. **Stripe:** Seller Production is on **live** mode with BizLine Starter/Growth/Pro prices; buyer must recreate products, prices, webhook, and keys under **their** Stripe account (seller keys will be revoked).  
3. **Email:** Seller Production uses verified Resend domain `getbizline.xyz`; buyer must verify their own sending domain after transfer.  
4. **Minutes / usage:** Included minutes are enforced via Vapi `assistant-request` + atomic DB reservations. Defaults are 100 / 300 / 1,000 (safer than the original 100 / 500 / 2,000 marketing proposal).  
5. **Number lifecycle:** Canceling a subscription does not auto-release Twilio numbers.  
6. **Transfer model:** Most vendor accounts are **recreated** under the buyer, not “handed over” as shared logins. Domain + GitHub transfer as agreed.  
7. **Missing features** vs some market expectations: no calendar booking, no carrier number porting UI, no multi-location franchise management, no website chatbot, no dedicated “after-hours only” routing product.  
8. **Legal:** Call recording / consent / retention practices should be reviewed by buyer’s counsel for their markets.  
9. **Forwarding:** Keeping an existing business number requires the customer to set call forwarding with their phone provider; BizLine does not configure that automatically.

---

## Likely buyer Q&A

**Q: Does it actually answer calls?**  
A: Yes — the product provisions a Twilio number via Vapi and serves a business-specific assistant. Verify with a live test call during diligence; ask seller for a recorded Loom of an inbound call if needed.

**Q: Can I keep getbizline.xyz?**  
A: Domain transfer is part of the negotiated closing deliverables.

**Q: Will existing phone numbers move to me?**  
A: Typically no without Twilio porting / account transfer paperwork. Plan to provision new numbers under your Twilio account; migrate any must-keep numbers separately.

**Q: Is Stripe live?**  
A: Yes on the seller’s current Production demo (live prices + webhook verified). After purchase, configure live mode under **your** Stripe account — do not reuse seller keys.

**Q: What’s the monthly burn with zero users?**  
A: Mostly fixed/platform minimums (domain, optional Supabase Pro, idle Vercel). With users, Twilio number rental + per-minute voice dominate. See `acquisition/READINESS_REPORT.md` Phase 6.

**Q: Can I white-label?**  
A: Source is included; branding and domain are yours after transfer. No formal white-label multi-tenant agency layer is built.

**Q: Any tech debt that blocks launch?**  
A: Core path works on Production (live Stripe, verified Resend, minute enforcement). Remaining disclosed gaps: Twilio release-on-cancel not automated; buyer must recreate vendor accounts after transfer.

---

## Assets to attach on Flippa

- [ ] Loom demo link  
- [ ] Screenshots: homepage, onboarding, dashboard, call detail  
- [ ] This listing draft (edited)  
- [ ] Optional: `READINESS_REPORT.md` / `BUYER_HANDOFF.md` as private diligence docs after NDAs / serious bids per Flippa norms  
