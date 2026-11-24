import "server-only";

import { getVapi } from "@/lib/server/vapi";
import { vapiWebhookServerConfig } from "@/lib/server/vapi-webhook";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isDemoPhoneNumber } from "@/lib/server/usage";

/**
 * Configure a Vapi phone number for assistant-request entitlement checks.
 * Clears a static assistantId so inbound calls hit our webhook first.
 */
export async function ensurePhoneNumberUsesAssistantRequest(params: {
  businessId: string;
  vapiPhoneNumberId?: string | null;
  twilioPhoneNumber?: string | null;
}) {
  const admin = createSupabaseAdminClient();
  const vapi = getVapi();
  const server = vapiWebhookServerConfig();

  let phoneNumberId = params.vapiPhoneNumberId ?? null;

  if (!phoneNumberId && params.twilioPhoneNumber) {
    const listed = await vapi.phoneNumbers.list();
    const match = listed.find((p) => {
      const number = (p as { number?: string }).number;
      return number === params.twilioPhoneNumber;
    });
    phoneNumberId = match?.id ?? null;
  }

  if (!phoneNumberId) {
    throw new Error("Vapi phone number id not found for routing update");
  }

  await vapi.phoneNumbers.update({
    id: phoneNumberId,
    body: {
      provider: "twilio",
      server,
      // Clearing static assistant forces assistant-request to phoneNumber.server
      assistantId: undefined,
      squadId: undefined,
      workflowId: undefined,
    },
  });

  // Explicit PATCH to clear assistantId when SDK omits undefined fields
  const apiKey = process.env.VAPI_API_KEY;
  if (apiKey) {
    await fetch(`https://api.vapi.ai/phone-number/${phoneNumberId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistantId: null,
        squadId: null,
        workflowId: null,
        server,
      }),
    });
  }

  const isDemo = isDemoPhoneNumber(params.twilioPhoneNumber);
  await admin
    .from("assistants")
    .update({
      vapi_phone_number_id: phoneNumberId,
      is_demo: isDemo,
    })
    .eq("business_id", params.businessId);

  return phoneNumberId;
}
