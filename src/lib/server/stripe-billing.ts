import "server-only";

import type Stripe from "stripe";

import { includedSecondsForPlan, planIdFromPriceId } from "@/lib/server/plans";
import {
  periodFromSubscription,
  planFromSubscriptionWithMap,
  priceIdFromSubscription,
  subscriptionIdFromInvoice,
} from "@/lib/shared/stripe-shapes";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export {
  periodFromSubscription,
  priceIdFromSubscription,
  subscriptionIdFromInvoice,
};

export function planFromSubscription(sub: Stripe.Subscription) {
  const priceId = priceIdFromSubscription(sub);
  if (priceId) {
    const mapped = planIdFromPriceId(priceId);
    if (mapped) return mapped;
  }
  return planFromSubscriptionWithMap(sub, {});
}

export async function syncSubscriptionFromStripe(params: {
  stripeCustomerId: string;
  subscription?: Stripe.Subscription | null;
  statusOverride?: string | null;
}) {
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", params.stripeCustomerId)
    .maybeSingle();

  if (!existing?.user_id) return;

  const sub = params.subscription ?? null;
  const plan = sub ? planFromSubscription(sub) : null;
  const status = params.statusOverride ?? sub?.status ?? null;
  const period = sub ? periodFromSubscription(sub) : { start: null, end: null };

  const periodStart = period.start
    ? new Date(period.start * 1000).toISOString()
    : undefined;
  const periodEnd = period.end ? new Date(period.end * 1000).toISOString() : undefined;

  const patch: Record<string, unknown> = {
    user_id: existing.user_id,
    stripe_customer_id: params.stripeCustomerId,
    updated_at: new Date().toISOString(),
  };

  if (sub?.id) patch.stripe_subscription_id = sub.id;
  if (status) patch.status = status;
  if (plan) {
    patch.plan = plan;
    patch.included_seconds = includedSecondsForPlan(plan);
  }
  if (periodStart) patch.current_period_start = periodStart;
  if (periodEnd) patch.current_period_end = periodEnd;

  if (periodStart) {
    const { data: current } = await admin
      .from("subscriptions")
      .select("current_period_start")
      .eq("user_id", existing.user_id)
      .maybeSingle();

    if (!current?.current_period_start || current.current_period_start !== periodStart) {
      patch.used_seconds = 0;
      patch.reserved_seconds = 0;
    }
  }

  await admin.from("subscriptions").upsert(patch, { onConflict: "user_id" });
}

export async function recordStripeEventOnce(eventId: string, type: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("stripe_webhook_events").insert({
    id: eventId,
    type,
  });
  if (error) {
    if (error.code === "23505") return false;
    throw error;
  }
  return true;
}
