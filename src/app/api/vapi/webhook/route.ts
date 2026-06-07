import { NextRequest, NextResponse } from "next/server";
import { zodTextFormat } from "openai/helpers/zod";

import { formatPhoneNumber } from "@/lib/format-phone";
import { env } from "@/lib/server/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOpenAI } from "@/lib/server/openai";
import { getResend } from "@/lib/server/resend";
import { callClassifySchema } from "@/lib/shared/call-classify-schema";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== env.vapi.webhookSecret()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text();

  const payload = JSON.parse(rawBody) as {
    message?: {
      type?: string;
      call?: { id?: string; assistantId?: string; customer?: { number?: string } };
      artifact?: {
        transcript?: string;
        recording?: { url?: string };
      };
    };
  };

  const message = payload.message;
  if (!message?.type) return NextResponse.json({ ok: true });

  if (message.type !== "end-of-call-report") {
    return NextResponse.json({ ok: true });
  }

  const vapiAssistantId = message.call?.assistantId;
  if (!vapiAssistantId) {
    return NextResponse.json({ error: "Missing assistantId" }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: assistantRow } = await supabaseAdmin
    .from("assistants")
    .select("business_id")
    .eq("vapi_assistant_id", vapiAssistantId)
    .maybeSingle();

  if (!assistantRow?.business_id) {
    return NextResponse.json({ error: "Unknown assistant" }, { status: 404 });
  }

  const transcript = message.artifact?.transcript ?? "";
  const recordingUrl = message.artifact?.recording?.url ?? null;

  const { data: insertedCall, error: insertError } = await supabaseAdmin
    .from("calls")
    .insert({
      business_id: assistantRow.business_id,
      caller_number: message.call?.customer?.number ?? null,
      transcript,
      recording_url: recordingUrl,
    })
    .select("id")
    .single();

  if (insertError || !insertedCall?.id) {
    return NextResponse.json({ error: insertError?.message ?? "Insert failed" }, { status: 500 });
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
    .eq("id", insertedCall.id);

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("business_name, user_id")
    .eq("id", assistantRow.business_id)
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

