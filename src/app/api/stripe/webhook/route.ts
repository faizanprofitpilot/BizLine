import Stripe from "stripe";
import { NextResponse } from "next/server";

import { getStripe } from "@/lib/server/stripe";
import { env } from "@/lib/server/env";
import {
  recordStripeEventOnce,
  subscriptionIdFromInvoice,
  syncSubscriptionFromStripe,
} from "@/lib/server/stripe-billing";

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

  const isNew = await recordStripeEventOnce(event.id, event.type);
  if (!isNew) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customer = session.customer;
      const subscriptionId = session.subscription;

      if (typeof customer === "string") {
        let subscription: Stripe.Subscription | null = null;
        if (typeof subscriptionId === "string") {
          subscription = await stripe.subscriptions.retrieve(subscriptionId);
        }
        await syncSubscriptionFromStripe({
          stripeCustomerId: customer,
          subscription,
          statusOverride: subscription?.status ?? "active",
        });
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customer = invoice.customer;
      const subscriptionId = subscriptionIdFromInvoice(invoice);

      if (typeof customer === "string") {
        let subscription: Stripe.Subscription | null = null;
        if (subscriptionId) {
          subscription = await stripe.subscriptions.retrieve(subscriptionId);
        }
        await syncSubscriptionFromStripe({
          stripeCustomerId: customer,
          subscription,
          statusOverride: subscription?.status ?? "active",
        });
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customer = invoice.customer;
      const subscriptionId = subscriptionIdFromInvoice(invoice);

      if (typeof customer === "string") {
        let subscription: Stripe.Subscription | null = null;
        if (subscriptionId) {
          subscription = await stripe.subscriptions.retrieve(subscriptionId);
        }
        await syncSubscriptionFromStripe({
          stripeCustomerId: customer,
          subscription,
          statusOverride: subscription?.status ?? "past_due",
        });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      if (typeof sub.customer === "string") {
        await syncSubscriptionFromStripe({
          stripeCustomerId: sub.customer,
          subscription: sub,
          statusOverride: sub.status,
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
