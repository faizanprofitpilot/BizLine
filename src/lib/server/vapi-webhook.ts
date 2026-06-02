import "server-only";

import type { VapiClient } from "@vapi-ai/server-sdk";

import { env } from "@/lib/server/env";

const PLATFORM_WEBHOOK_CREDENTIAL_NAME = "CursorHackathon Platform Webhook";

let cachedWebhookCredentialId: string | null = null;

/** Public webhook endpoint for Vapi server messages (end-of-call-report, etc.). */
export function vapiWebhookUrl(): string {
  const base = env.appUrl().replace(/\/$/, "");
  return `${base}/api/vapi/webhook`;
}

function webhookHmacAuthenticationPlan() {
  return {
    type: "hmac" as const,
    secretKey: env.vapi.webhookSecret(),
    algorithm: "sha256" as const,
    signatureHeader: "x-vapi-signature",
    includeTimestamp: false,
    payloadFormat: "{body}",
  };
}

export function vapiWebhookServerConfig(credentialId: string) {
  return {
    url: vapiWebhookUrl(),
    credentialId,
  };
}

async function listWebhookCredentials(vapi: VapiClient) {
  const response = await vapi.fetch("/credential", { method: "GET" });
  if (!response.ok) return [];

  const body = (await response.json()) as
    | Array<{ id: string; name?: string; provider?: string }>
    | { data?: Array<{ id: string; name?: string; provider?: string }> };

  if (Array.isArray(body)) return body;
  return body.data ?? [];
}

async function createWebhookCredential(vapi: VapiClient): Promise<string> {
  const response = await vapi.fetch("/credential", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "webhook",
      name: PLATFORM_WEBHOOK_CREDENTIAL_NAME,
      authenticationPlan: webhookHmacAuthenticationPlan(),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Failed to create Vapi webhook credential (${response.status}): ${detail}`
    );
  }

  const created = (await response.json()) as { id: string };
  return created.id;
}

/**
 * Reusable org-level HMAC credential for `x-vapi-signature` verification
 * against `VAPI_WEBHOOK_SECRET` on the raw request body.
 */
export async function ensurePlatformWebhookCredentialId(
  vapi: VapiClient
): Promise<string> {
  if (cachedWebhookCredentialId) return cachedWebhookCredentialId;

  const existing = (await listWebhookCredentials(vapi)).find(
    (c) => c.name === PLATFORM_WEBHOOK_CREDENTIAL_NAME
  );
  if (existing?.id) {
    cachedWebhookCredentialId = existing.id;
    return existing.id;
  }

  const id = await createWebhookCredential(vapi);
  cachedWebhookCredentialId = id;
  return id;
}
