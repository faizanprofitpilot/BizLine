import type Stripe from "stripe";

import { normalizePlanId, type PlanId } from "@/lib/shared/plans-config";

export function priceIdFromSubscription(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0];
  const price = item?.price;
  if (!price) return null;
  return typeof price === "string" ? price : price.id;
}

export function periodFromSubscription(sub: Stripe.Subscription): {
  start: number | null;
  end: number | null;
} {
  const item = sub.items?.data?.[0];
  return {
    start: item?.current_period_start ?? null,
    end: item?.current_period_end ?? null,
  };
}

export function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent as
    | {
        type?: string | null;
        subscription_details?: { subscription?: string | Stripe.Subscription | null } | null;
      }
    | null
    | undefined;

  const fromParent = parent?.subscription_details?.subscription;
  if (typeof fromParent === "string") return fromParent;
  if (fromParent && typeof fromParent === "object" && "id" in fromParent) {
    return fromParent.id;
  }

  const legacy = (invoice as unknown as { subscription?: string | Stripe.Subscription | null })
    .subscription;
  if (typeof legacy === "string") return legacy;
  if (legacy && typeof legacy === "object" && "id" in legacy) return legacy.id;
  return null;
}

export function planFromSubscriptionWithMap(
  sub: Stripe.Subscription,
  priceMap: Record<string, PlanId>
): PlanId | null {
  const priceId = priceIdFromSubscription(sub);
  if (priceId && priceMap[priceId]) return priceMap[priceId];
  return normalizePlanId(sub.metadata?.plan);
}
