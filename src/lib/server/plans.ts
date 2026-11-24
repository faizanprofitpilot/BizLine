import "server-only";

import { env } from "@/lib/server/env";
import {
  DEFAULT_PLAN_MINUTES,
  MAX_CALL_SECONDS,
  normalizePlanId,
  resolveIncludedMinutes,
  validatePriceAllowlist,
  type PlanId,
  isPaidSubscriptionStatus,
} from "@/lib/shared/plans-config";

export type { PlanId };
export {
  MAX_CALL_SECONDS,
  normalizePlanId,
  isPaidSubscriptionStatus,
};

function envMinutes(): Partial<Record<PlanId, number>> {
  return {
    starter: process.env.PLAN_MINUTES_STARTER
      ? Number(process.env.PLAN_MINUTES_STARTER)
      : undefined,
    growth: process.env.PLAN_MINUTES_GROWTH
      ? Number(process.env.PLAN_MINUTES_GROWTH)
      : undefined,
    pro: process.env.PLAN_MINUTES_PRO
      ? Number(process.env.PLAN_MINUTES_PRO)
      : undefined,
  };
}

export const PLAN_CATALOG: Record<
  PlanId,
  { id: PlanId; name: string; priceLabel: string; includedMinutes: number }
> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceLabel: "$49",
    includedMinutes: resolveIncludedMinutes("starter", envMinutes()),
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceLabel: "$149",
    includedMinutes: resolveIncludedMinutes("growth", envMinutes()),
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceLabel: "$399",
    includedMinutes: resolveIncludedMinutes("pro", envMinutes()),
  },
};

export function includedSecondsForPlan(plan: PlanId | string | null | undefined): number {
  const id = normalizePlanId(plan);
  if (!id) return 0;
  return resolveIncludedMinutes(id, envMinutes()) * 60;
}

export function planIdFromPriceId(priceId: string): PlanId | null {
  return validatePriceAllowlist(priceId, allowedPriceMap());
}

export function allowedPriceMap(): Record<string, PlanId> {
  return {
    [env.stripe.priceStarter()]: "starter",
    [env.stripe.priceGrowth()]: "growth",
    [env.stripe.pricePro()]: "pro",
  };
}

export function assertAllowedPriceId(priceId: string): PlanId {
  const plan = planIdFromPriceId(priceId);
  if (!plan) {
    throw new Error("Invalid or unauthorized Stripe price ID");
  }
  return plan;
}

export { DEFAULT_PLAN_MINUTES };
