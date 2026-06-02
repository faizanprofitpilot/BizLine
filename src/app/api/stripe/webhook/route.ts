import Stripe from "stripe";
import { NextResponse } from "next/server";

import { getStripe } from "@/lib/server/stripe";
import { env } from "@/lib/server/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const stripe = getStripe();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, env.stripe.webhookSecret());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  async function upsertSubscriptionByCustomer(params: {
    stripeCustomerId: string;
    stripeSubscriptionId?: string | null;
    status?: string | null;
    plan?: string | null;
  }) {
    const { data: existing } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", params.stripeCustomerId)
      .maybeSingle();

    if (!existing?.user_id) return;

    await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: existing.user_id,
        stripe_customer_id: params.stripeCustomerId,
        stripe_subscription_id: params.stripeSubscriptionId ?? undefined,
        status: params.status ?? undefined,
        plan: params.plan ?? undefined,
      },
      { onConflict: "user_id" }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customer = session.customer;
      const subscription = session.subscription;

      if (typeof customer === "string") {
        await upsertSubscriptionByCustomer({
          stripeCustomerId: customer,
          stripeSubscriptionId: typeof subscription === "string" ? subscription : null,
          status: "active",
        });
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      if (typeof invoice.customer === "string") {
        await upsertSubscriptionByCustomer({
          stripeCustomerId: invoice.customer,
          status: "active",
        });
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (typeof invoice.customer === "string") {
        await upsertSubscriptionByCustomer({
          stripeCustomerId: invoice.customer,
          status: "past_due",
        });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;

      if (typeof sub.customer === "string") {
        await upsertSubscriptionByCustomer({
          stripeCustomerId: sub.customer,
          stripeSubscriptionId: sub.id,
          status: sub.status,
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

