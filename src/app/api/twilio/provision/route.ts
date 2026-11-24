import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTwilio } from "@/lib/server/twilio";
import { getVapi } from "@/lib/server/vapi";
import { env } from "@/lib/server/env";
import { isPaidSubscriptionStatus } from "@/lib/server/plans";
import { ensurePhoneNumberUsesAssistantRequest } from "@/lib/server/phone-routing";
import { isDemoPhoneNumber } from "@/lib/server/usage";
import { vapiWebhookServerConfig } from "@/lib/server/vapi-webhook";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: subRow } = await supabaseAdmin
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!isPaidSubscriptionStatus(subRow?.status)) {
    return NextResponse.json({ error: "Subscription inactive" }, { status: 402 });
  }

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!business?.id) {
    return NextResponse.json({ error: "Business not found" }, { status: 400 });
  }

  const { data: assistantRow } = await supabaseAdmin
    .from("assistants")
    .select(
      "id, vapi_assistant_id, twilio_sid, twilio_phone_number, vapi_phone_number_id"
    )
    .eq("business_id", business.id)
    .maybeSingle();

  if (!assistantRow?.vapi_assistant_id) {
    return NextResponse.json({ error: "Vapi assistant not created yet" }, { status: 400 });
  }

  if (assistantRow.twilio_sid && assistantRow.twilio_phone_number) {
    try {
      await ensurePhoneNumberUsesAssistantRequest({
        businessId: business.id,
        vapiPhoneNumberId: assistantRow.vapi_phone_number_id,
        twilioPhoneNumber: assistantRow.twilio_phone_number,
      });
    } catch (err) {
      console.error("Failed to sync phone routing", err);
    }

    return NextResponse.json({
      phoneNumber: assistantRow.twilio_phone_number,
      status: "already_provisioned",
    });
  }

  const twilioClient = getTwilio();
  const locals = await twilioClient.availablePhoneNumbers("US").local.list({
    voiceEnabled: true,
    limit: 1,
  });

  const candidate = locals[0];
  if (!candidate?.phoneNumber) {
    return NextResponse.json({ error: "No numbers available" }, { status: 503 });
  }

  const purchased = await twilioClient.incomingPhoneNumbers.create({
    phoneNumber: candidate.phoneNumber,
  });

  const vapi = getVapi();
  const server = vapiWebhookServerConfig();

  // Do not bind assistantId statically — entitlements checked via assistant-request.
  const phoneNumber = await vapi.phoneNumbers.create({
    provider: "twilio",
    number: candidate.phoneNumber,
    twilioAccountSid: env.twilio.accountSid(),
    twilioAuthToken: env.twilio.authToken(),
    name: business.business_name ? `${business.business_name} Line` : "Business Line",
    server,
  });

  await ensurePhoneNumberUsesAssistantRequest({
    businessId: business.id,
    vapiPhoneNumberId: phoneNumber.id,
    twilioPhoneNumber: candidate.phoneNumber,
  });

  await supabaseAdmin.from("assistants").upsert(
    {
      business_id: business.id,
      vapi_assistant_id: assistantRow.vapi_assistant_id,
      twilio_phone_number: candidate.phoneNumber,
      twilio_sid: purchased.sid,
      vapi_phone_number_id: phoneNumber.id,
      active: true,
      is_demo: isDemoPhoneNumber(candidate.phoneNumber),
    },
    { onConflict: "business_id" }
  );

  return NextResponse.json({
    phoneNumber: candidate.phoneNumber,
    twilioSid: purchased.sid,
    vapiPhoneNumberId: phoneNumber.id,
    status: "provisioned",
  });
}
