import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTwilio } from "@/lib/server/twilio";
import { getVapi } from "@/lib/server/vapi";
import { env } from "@/lib/server/env";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Enforce hard paywall server-side as well.
  const { data: subRow } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (subRow?.status !== "active") {
    return NextResponse.json({ error: "Subscription inactive" }, { status: 402 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
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
    .select("id, vapi_assistant_id, twilio_sid, twilio_phone_number")
    .eq("business_id", business.id)
    .maybeSingle();

  if (!assistantRow?.vapi_assistant_id) {
    return NextResponse.json({ error: "Vapi assistant not created yet" }, { status: 400 });
  }

  if (assistantRow.twilio_sid && assistantRow.twilio_phone_number) {
    return NextResponse.json({
      phoneNumber: assistantRow.twilio_phone_number,
      status: "already_provisioned",
    });
  }

  const twilioClient = getTwilio();

  // Twilio docs (AvailablePhoneNumber Local): client.availablePhoneNumbers("US").local.list(...)
  const locals = await twilioClient.availablePhoneNumbers("US").local.list({
    voiceEnabled: true,
    limit: 1,
  });

  const candidate = locals[0];
  if (!candidate?.phoneNumber) {
    return NextResponse.json({ error: "No numbers available" }, { status: 503 });
  }

  // Twilio docs (IncomingPhoneNumbers): client.incomingPhoneNumbers.create({ phoneNumber })
  const purchased = await twilioClient.incomingPhoneNumbers.create({
    phoneNumber: candidate.phoneNumber,
  });

  const vapi = getVapi();

  // Vapi phone number create (Twilio import): POST /phone-number
  const phoneNumber = await vapi.phoneNumbers.create({
    provider: "twilio",
    number: candidate.phoneNumber,
    twilioAccountSid: env.twilio.accountSid(),
    twilioAuthToken: env.twilio.authToken(),
    assistantId: assistantRow.vapi_assistant_id,
    name: business.business_name ? `${business.business_name} Line` : "Business Line",
  });

  await supabaseAdmin.from("assistants").upsert(
    {
      business_id: business.id,
      vapi_assistant_id: assistantRow.vapi_assistant_id,
      twilio_phone_number: candidate.phoneNumber,
      twilio_sid: purchased.sid,
      active: true,
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

