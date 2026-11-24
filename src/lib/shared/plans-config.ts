export type PlanId = "starter" | "growth" | "pro";

/** Safer included-minute defaults (see acquisition docs for economics). */
export const DEFAULT_PLAN_MINUTES: Record<PlanId, number> = {
  starter: 100,
  growth: 300,
  pro: 1000,
};

export const MAX_CALL_SECONDS = 30 * 60;

export function normalizePlanId(plan: string | null | undefined): PlanId | null {
  if (!plan) return null;
  const p = plan.trim().toLowerCase();
  if (p === "starter" || p === "growth" || p === "pro") return p;
  return null;
}

export function isPaidSubscriptionStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

export function resolveIncludedMinutes(
  plan: PlanId,
  envMinutes?: Partial<Record<PlanId, number>>
): number {
  const override = envMinutes?.[plan];
  if (override && Number.isFinite(override) && override > 0) {
    return Math.floor(override);
  }
  return DEFAULT_PLAN_MINUTES[plan];
}

export function remainingSeconds(params: {
  includedSeconds: number;
  usedSeconds: number;
  reservedSeconds: number;
}): number {
  return Math.max(
    0,
    params.includedSeconds - params.usedSeconds - params.reservedSeconds
  );
}

export function validatePriceAllowlist(
  priceId: string,
  allowed: Record<string, PlanId>
): PlanId | null {
  return allowed[priceId] ?? null;
}
