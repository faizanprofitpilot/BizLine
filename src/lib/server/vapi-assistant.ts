import "server-only";

import { getVapi } from "@/lib/server/vapi";
import {
  getPlatformWebhookCredentialIdFromEnv,
  inlineWebhookCredential,
  vapiWebhookServerConfig,
  vapiWebhookUrl,
} from "@/lib/server/vapi-webhook";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type BusinessRow = {
  id: string;
  business_name: string | null;
  services: string[] | null;
  hours: string | null;
  phone: string | null;
  address: string | null;
  additional_context: string | null;
  first_message: string | null;
  system_prompt: string | null;
};

type AssistantPayload = Parameters<
  ReturnType<typeof getVapi>["assistants"]["create"]
>[0];

function buildAssistantCore(business: BusinessRow): AssistantPayload {
  return {
    name: business.business_name || "AI Receptionist",
    firstMessage:
      business.first_message ||
      `Thank you for calling ${business.business_name || "our business"}. How can I help you today?`,
    model: {
      provider: "openai",
      model: "gpt-4o",
      messages: [
        {
          role: "system" as const,
          content:
            business.system_prompt ||
            [
              `You are an AI phone receptionist for ${business.business_name || "a small business"}.`,
              "Be concise, friendly, and action-oriented.",
            ].join("\n"),
        },
      ],
    },
  };
}

function buildAssistantPayload(
  business: BusinessRow,
  webhookCredentialId: string | null
): AssistantPayload {
  const core = buildAssistantCore(business);

  if (webhookCredentialId) {
    return {
      ...core,
      server: vapiWebhookServerConfig(webhookCredentialId),
    };
  }

  return {
    ...core,
    credentials: [inlineWebhookCredential()],
    server: { url: vapiWebhookUrl() },
  };
}

async function linkServerCredentialAfterCreate(
  vapi: ReturnType<typeof getVapi>,
  assistantId: string,
  credentialIds: string[] | undefined
) {
  const credentialId = credentialIds?.[0];
  if (!credentialId) return;

  await vapi.assistants.update({
    id: assistantId,
    server: vapiWebhookServerConfig(credentialId),
  });
}

export async function ensureVapiAssistantForUser(userId: string) {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select(
      "id, business_name, services, hours, phone, address, additional_context, first_message, system_prompt"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (!business?.id) throw new Error("Business not found");

  const { data: assistantRow } = await supabaseAdmin
    .from("assistants")
    .select("id, vapi_assistant_id")
    .eq("business_id", business.id)
    .maybeSingle();

  const vapi = getVapi();
  const webhookCredentialId = getPlatformWebhookCredentialIdFromEnv();
  const assistantPayload = buildAssistantPayload(business, webhookCredentialId);

  if (assistantRow?.vapi_assistant_id) {
    await vapi.assistants.update({
      id: assistantRow.vapi_assistant_id,
      name: assistantPayload.name,
      firstMessage: assistantPayload.firstMessage,
      model: assistantPayload.model,
      server: assistantPayload.server,
      ...(assistantPayload.credentials
        ? { credentials: assistantPayload.credentials }
        : {}),
    });
    return assistantRow.vapi_assistant_id;
  }

  const created = await vapi.assistants.create(assistantPayload);

  if (!webhookCredentialId && created.credentialIds?.length) {
    await linkServerCredentialAfterCreate(vapi, created.id, created.credentialIds);
  }

  await supabaseAdmin.from("assistants").upsert(
    {
      business_id: business.id,
      vapi_assistant_id: created.id,
      active: false,
    },
    { onConflict: "business_id" }
  );

  return created.id;
}
