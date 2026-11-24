# Final Action Items — Before Flippa Auction

Only tasks that matter for listing honestly and transferring cleanly. No product redesign.

| # | Task | Priority | Mandatory? | Effort | Notes |
|---|------|----------|------------|--------|-------|
| 1 | Paste existing Loom URL into [`FLIPPA_LISTING.md`](./FLIPPA_LISTING.md) and Flippa form | P0 | **Mandatory** | 5 min | Recording already exists |
| 2 | Remove or rewrite homepage “Trusted by thousands” (and any similar unverified social proof) before listing goes live | P0 | **Done** | — | Removed from auth shell; no invented stats |
| 3 | Soften or clarify “forward your existing number” claim if carrier forwarding is not a built product feature | P0 | **Done** | — | Hero now states customer-managed forwarding via phone provider |
| 4 | Disclose Stripe **test** mode + Resend domain limits in Flippa listing (use Disclosures section) | P0 | **Mandatory** | 10 min | Docs ready; copy into Flippa UI |
| 5 | Confirm Flippa auction settings: starting bid, reserve (if any), duration, category = SaaS / pre-revenue | P0 | **Mandatory** | 30 min | Follow current Flippa pre-revenue rules |
| 6 | Prepare closing packet: GitHub transfer plan, domain auth code process, env **names** list, revoke seller keys after cutover | P1 | **Mandatory** for closing | 1–2 hr | See [`BUYER_HANDOFF.md`](./BUYER_HANDOFF.md) |
| 7 | Optional: one inbound diligence call recording (transcript + dashboard screenshot) if Loom omits live call artifacts | P1 | Optional | 20 min | Strengthens trust; not required if Loom covers it |
| 8 | Optional: verify Resend domain so demo emails work for any buyer email during diligence | P2 | Optional | 30–60 min | Improves demo; not required to list if disclosed |
| 9 | Create live Stripe BizLine prices + set Vercel `sk_live_` + live webhook secret | P0 | **Mandatory for live payments** | 30–60 min | CLI key lacked `product_write`; needs Dashboard or key permission |
| 10 | Confirm Resend domain + set `RESEND_FROM_EMAIL=BizLine <notifications@getbizline.xyz>` | P0 | **Mandatory for customer email** | 15–30 min | Prior audit may be stale; verify in Resend Dashboard |
| 11 | Approve minute allotments (defaults 100/300/1000) or set `PLAN_MINUTES_*` | P1 | Recommended | 10 min | Original 500/2000 likely uneconomic |
| 12 | Optional: release Twilio number on cancel | P3 | Optional | 2–4 hr | Still not automated |
| 11 | Optional: commit `acquisition/` docs to GitHub so they travel with the repo | P1 | Recommended | 5 min | Seller decision; not a Flippa UI blocker |

---

## Minimum work to publish the auction

1. ~~Fix misleading marketing lines on the live site (#2, #3).~~ Done.  
2. Fill Loom URL + Flippa auction fields (#1, #5).  
3. Paste disclosures (#4).  
4. Publish.

Everything else can wait until diligence or post-sale under the buyer.

---

## Do **not** do before listing (unless you choose to)

- Redesign UI or add calendar / porting / franchise / chatbot features  
- Rotate production secrets mid-demo without a cutover plan  
- Buy extra Twilio numbers or run paid load tests without approval  
- Invent revenue, traffic, or customer counts  
