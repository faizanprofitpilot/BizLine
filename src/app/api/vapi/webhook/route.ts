import { NextRequest, NextResponse } from "next/server";
import { zodTextFormat } from "openai/helpers/zod";

import { formatPhoneNumber } from "@/lib/format-phone";
import { DEMO_PHONE_E164 } from "@/lib/demo-phone";
import { env } from "@/lib/server/env";
import { MAX_CALL_SECONDS } from "@/lib/server/plans";
import {
  canAcceptCalls,
  commitCallUsage,
  getUsageSnapshot,
  isDemoPhoneNumber,
  normalizePhoneE164,
  releaseCallUsage,
  reserveCallUsage,
} from "@/lib/server/usage";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOpenAI } from "@/lib/server/openai";
import { getResend } from "@/lib/server/resend";
import {
  computeCallDurationSeconds,
  extractRecordingUrl,
} from "@/lib/server/vapi-recording";
import { callClassifySchema } from "@/lib/shared/call-classify-schema";

type VapiMessage = {
  type?: string;
  call?: {
    id?: string;
    assistantId?: string;
    phoneNumber?: { number?: string; id?: string };
    customer?: { number?: string };
    startedAt?: string;
    endedAt?: string;
  };
  phoneNumber?: { number?: string; id?: string };
  artifact?: {
    transcript?: string;
    recordingUrl?: string;
    stereoUrl?: string;
    mono?: { combinedUrl?: string };
  };
};

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== env.vapi.webhookSecret()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text();
  const payload = JSON.parse(rawBody) as { message?: VapiMessage };
  const message = payload.message;
  if (!message?.type) return NextResponse.json({ ok: true });

  if (message.type === "assistant-request") {
    return handleAssistantRequest(message);
  }

  if (message.type === "status-update") {
    // Best-effort release if call never connects after reservation.
    return NextResponse.json({ ok: true });
  }

  if (message.type !== "end-of-call-report") {
    return NextResponse.json({ ok: true });
  }

  return handleEndOfCallReport(message);
}

async function resolveAssistantContext(message: VapiMessage) {
  const supabaseAdmin = createSupabaseAdminClient();
  const phone =
    normalizePhoneE164(message.call?.phoneNumber?.number) ??
    normalizePhoneE164(message.phoneNumber?.number);

  if (phone) {
    const { data: byPhone } = await supabaseAdmin
      .from("assistants")
      .select("business_id, vapi_assistant_id, is_demo, twilio_phone_number")
      .eq("twilio_phone_number", phone)
      .maybeSingle();
    if (byPhone?.business_id) return { ...byPhone, phone };
  }

  const vapiAssistantId = message.call?.assistantId;
  if (vapiAssistantId) {
    const { data: byAssistant } = await supabaseAdmin
      .from("assistants")
      .select("business_id, vapi_assistant_id, is_demo, twilio_phone_number")
      .eq("vapi_assistant_id", vapiAssistantId)
      .maybeSingle();
    if (byAssistant?.business_id) {
      return {
        ...byAssistant,
        phone: normalizePhoneE164(byAssistant.twilio_phone_number),
      };
    }
  }

  return null;
}

async function handleAssistantRequest(message: VapiMessage) {
  const ctx = await resolveAssistantContext(message);
  if (!ctx?.business_id || !ctx.vapi_assistant_id) {
    return NextResponse.json({
      error: "This line is not configured yet. Please try again later.",
    });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("user_id, business_name")
    .eq("id", ctx.business_id)
    .single();

  if (!business?.user_id) {
    return NextResponse.json({
      error: "This line is not configured yet. Please try again later.",
    });
  }

  const isDemo =
    Boolean(ctx.is_demo) ||
    isDemoPhoneNumber(ctx.phone) ||
    isDemoPhoneNumber(ctx.twilio_phone_number) ||
    ctx.phone === DEMO_PHONE_E164;

  const snapshot = await getUsageSnapshot(business.user_id);
  if (!isDemo && !canAcceptCalls(snapshot)) {
    return NextResponse.json({
      error:
        "Thanks for calling. This business has reached its included call minutes for this billing period. Please try again after the plan renews, or ask them to upgrade.",
    });
  }

  const vapiCallId = message.call?.id;
  let maxDurationSeconds = Math.min(
    MAX_CALL_SECONDS,
    isDemo ? MAX_CALL_SECONDS : Math.max(1, snapshot.remainingSeconds)
  );

  if (!isDemo && vapiCallId) {
    const reservation = await reserveCallUsage({
      userId: business.user_id,
      businessId: ctx.business_id,
      vapiCallId,
      requestedSeconds: maxDurationSeconds,
    });

    if (!reservation.allowed || reservation.reservedSeconds <= 0) {
      return NextResponse.json({
        error:
          "Thanks for calling. This business has reached its included call minutes for this billing period.",
      });
    }
    maxDurationSeconds = reservation.reservedSeconds;
  }

  return NextResponse.json({
    assistantId: ctx.vapi_assistant_id,
    assistantOverrides: {
      maxDurationSeconds,
    },
  });
}

async function handleEndOfCallReport(message: VapiMessage) {
  const vapiAssistantId = message.call?.assistantId;
  const vapiCallId = message.call?.id ?? null;
  const ctx = await resolveAssistantContext(message);

  if (!ctx?.business_id && !vapiAssistantId) {
    return NextResponse.json({ error: "Missing assistantId" }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const businessId = ctx?.business_id;
  if (!businessId) {
    return NextResponse.json({ error: "Unknown assistant" }, { status: 404 });
  }

  const transcript = message.artifact?.transcript ?? "";
  const recordingUrl = extractRecordingUrl(message.artifact);
  const duration = computeCallDurationSeconds(
    message.call?.startedAt,
    message.call?.endedAt
  );

  // Idempotent insert by vapi_call_id when present
  let insertedCallId: string | null = null;
  if (vapiCallId) {
    const { data: existing } = await supabaseAdmin
      .from("calls")
      .select("id")
      .eq("vapi_call_id", vapiCallId)
      .maybeSingle();
    if (existing?.id) {
      insertedCallId = existing.id;
    }
  }

  if (!insertedCallId) {
    const { data: insertedCall, error: insertError } = await supabaseAdmin
      .from("calls")
      .insert({
        business_id: businessId,
        caller_number: message.call?.customer?.number ?? null,
        transcript,
        recording_url: recordingUrl,
        duration,
        vapi_call_id: vapiCallId,
      })
      .select("id")
      .single();

    if (insertError || !insertedCall?.id) {
      // Unique race: fetch existing
      if (vapiCallId && insertError?.code === "23505") {
        const { data: existing } = await supabaseAdmin
          .from("calls")
          .select("id")
          .eq("vapi_call_id", vapiCallId)
          .maybeSingle();
        insertedCallId = existing?.id ?? null;
      } else {
        return NextResponse.json(
          { error: insertError?.message ?? "Insert failed" },
          { status: 500 }
        );
      }
    } else {
      insertedCallId = insertedCall.id;
    }
  }

  const isDemo =
    Boolean(ctx.is_demo) ||
    isDemoPhoneNumber(ctx.phone) ||
    isDemoPhoneNumber(ctx.twilio_phone_number);

  if (!isDemo && vapiCallId) {
    if (typeof duration === "number" && duration > 0) {
      await commitCallUsage({
        vapiCallId,
        billedSeconds: duration,
        callId: insertedCallId,
      });
    } else {
      await releaseCallUsage(vapiCallId);
    }
  }

  // Classification + email only once per call row when summary missing
  const { data: callRow } = await supabaseAdmin
    .from("calls")
    .select("summary")
    .eq("id", insertedCallId!)
    .maybeSingle();

  if (callRow?.summary) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const openai = getOpenAI();
  const classify = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content:
          "You summarize phone calls for a small business. Return JSON matching the schema.",
      },
      {
        role: "user",
        content: `Transcript:\n\n${transcript}`,
      },
    ],
    text: { format: zodTextFormat(callClassifySchema, "call_classify") },
  });

  const parsed =
    (classify as unknown as { output_parsed?: unknown }).output_parsed ??
    callClassifySchema.parse(
      JSON.parse((classify as unknown as { output_text?: string }).output_text ?? "{}")
    );

  const classification = callClassifySchema.parse(parsed);

  await supabaseAdmin
    .from("calls")
    .update({
      summary: classification.summary,
      outcome: classification.outcome,
      urgency: classification.urgency,
      sentiment: classification.sentiment,
    })
    .eq("id", insertedCallId!);

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("business_name, user_id")
    .eq("id", businessId)
    .single();

  if (!business?.user_id) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const { data: userRow } = await supabaseAdmin
    .from("users")
    .select("email")
    .eq("id", business.user_id)
    .single();

  if (!userRow?.email) {
    return NextResponse.json({ error: "User email not found" }, { status: 404 });
  }

  try {
    const resend = getResend();
    const subject = `New Call Summary - ${business.business_name ?? "Your Business"}`;

    await resend.emails.send({
      from: env.resend.fromEmail(),
      to: [userRow.email],
      subject,
      html: [
        `<h2>${subject}</h2>`,
        `<p><strong>Caller:</strong> ${
          message.call?.customer?.number
            ? formatPhoneNumber(message.call.customer.number)
            : "Unknown"
        }</p>`,
        `<p><strong>Summary:</strong> ${classification.summary}</p>`,
        `<p><strong>Outcome:</strong> ${classification.outcome}</p>`,
        `<p><strong>Urgency:</strong> ${classification.urgency}</p>`,
        `<p><strong>Sentiment:</strong> ${classification.sentiment}</p>`,
        recordingUrl ? `<p><strong>Recording:</strong> ${recordingUrl}</p>` : "",
        `<hr />`,
        `<pre style="white-space:pre-wrap;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">${escapeHtml(
          transcript
        )}</pre>`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("Resend email failed", err);
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
