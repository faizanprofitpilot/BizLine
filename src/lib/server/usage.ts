import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  includedSecondsForPlan,
  isPaidSubscriptionStatus,
  MAX_CALL_SECONDS,
  normalizePlanId,
  type PlanId,
} from "@/lib/server/plans";
import { DEMO_PHONE_E164 } from "@/lib/demo-phone";

export type UsageSnapshot = {
  plan: PlanId | null;
  status: string | null;
  includedSeconds: number;
  usedSeconds: number;
  reservedSeconds: number;
  remainingSeconds: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  isDemo: boolean;
};

export function normalizePhoneE164(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return input.startsWith("+") ? `+${digits}` : `+${digits}`;
}

export function isDemoPhoneNumber(phone: string | null | undefined): boolean {
  return normalizePhoneE164(phone) === DEMO_PHONE_E164;
}

export async function getUsageSnapshot(userId: string): Promise<UsageSnapshot> {
  const admin = createSupabaseAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select(
      "status, plan, included_seconds, used_seconds, reserved_seconds, current_period_start, current_period_end"
    )
    .eq("user_id", userId)
    .maybeSingle();

  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let isDemo = false;
  if (business?.id) {
    const { data: assistant } = await admin
      .from("assistants")
      .select("is_demo, twilio_phone_number")
      .eq("business_id", business.id)
      .maybeSingle();
    isDemo = Boolean(assistant?.is_demo) || isDemoPhoneNumber(assistant?.twilio_phone_number);
  }

  const plan = normalizePlanId(sub?.plan);
  const included =
    typeof sub?.included_seconds === "number" && sub.included_seconds > 0
      ? sub.included_seconds
      : includedSecondsForPlan(plan);
  const used = sub?.used_seconds ?? 0;
  const reserved = sub?.reserved_seconds ?? 0;

  return {
    plan,
    status: sub?.status ?? null,
    includedSeconds: included,
    usedSeconds: used,
    reservedSeconds: reserved,
    remainingSeconds: Math.max(0, included - used - reserved),
    currentPeriodStart: sub?.current_period_start ?? null,
    currentPeriodEnd: sub?.current_period_end ?? null,
    isDemo,
  };
}

export async function reserveCallUsage(params: {
  userId: string;
  businessId: string;
  vapiCallId: string;
  requestedSeconds?: number;
}): Promise<{
  allowed: boolean;
  reservedSeconds: number;
  remainingSeconds: number;
  reason: string;
}> {
  const admin = createSupabaseAdminClient();
  const requested = Math.min(
    Math.max(1, params.requestedSeconds ?? MAX_CALL_SECONDS),
    MAX_CALL_SECONDS
  );

  const { data, error } = await admin.rpc("reserve_call_usage", {
    p_user_id: params.userId,
    p_business_id: params.businessId,
    p_vapi_call_id: params.vapiCallId,
    p_requested_seconds: requested,
  });

  if (error) {
    return {
      allowed: false,
      reservedSeconds: 0,
      remainingSeconds: 0,
      reason: error.message,
    };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(row?.allowed),
    reservedSeconds: Number(row?.reserved_seconds ?? 0),
    remainingSeconds: Number(row?.remaining_seconds ?? 0),
    reason: String(row?.reason ?? "unknown"),
  };
}

export async function commitCallUsage(params: {
  vapiCallId: string;
  billedSeconds: number;
  callId?: string | null;
}) {
  const admin = createSupabaseAdminClient();
  await admin.rpc("commit_call_usage", {
    p_vapi_call_id: params.vapiCallId,
    p_billed_seconds: Math.max(0, Math.floor(params.billedSeconds)),
    p_call_id: params.callId ?? null,
  });
}

export async function releaseCallUsage(vapiCallId: string) {
  const admin = createSupabaseAdminClient();
  await admin.rpc("release_call_usage", { p_vapi_call_id: vapiCallId });
}

export function canAcceptCalls(snapshot: UsageSnapshot): boolean {
  if (snapshot.isDemo) return true;
  if (!isPaidSubscriptionStatus(snapshot.status)) return false;
  return snapshot.remainingSeconds > 0;
}
