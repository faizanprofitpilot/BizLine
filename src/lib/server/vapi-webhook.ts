import "server-only";

import type { VapiClient } from "@vapi-ai/server-sdk";

import { env } from "@/lib/server/env";
import { VAPI_API_BASE } from "@/lib/server/vapi";

const PLATFORM_WEBHOOK_CREDENTIAL_NAME = "CursorHackathon Platform Webhook";

let cachedWebhookCredentialId: string | null = null;

/** Public webhook endpoint for Vapi server messages (end-of-call-report, etc.). */
export function vapiWebhookUrl(): string {
  const base = env.appUrl().replace(/\/$/, "");
  return `${base}/api/vapi/webhook`;
}

export function webhookHmacAuthenticationPlan() {
  return {
    type: "hmac" as const,
    secretKey: env.vapi.webhookSecret(),
    algorithm: "sha256" as const,
    signatureHeader: "x-vapi-signature",
    includeTimestamp: false,
    payloadFormat: "{body}",
  };
}

export function inlineWebhookCredential() {
  return {
    provider: "webhook" as const,
    name: PLATFORM_WEBHOOK_CREDENTIAL_NAME,
    authenticationPlan: webhookHmacAuthenticationPlan(),
  };
}

export function vapiWebhookServerConfig(
  credentialId: string
): { url: string; credentialId: string } {
  return {
    url: vapiWebhookUrl(),
    credentialId,
  };
}

function credentialApiUrl(path = ""): string {
  const base = VAPI_API_BASE.replace(/\/$/, "");
  return path ? `${base}/credential/${path}` : `${base}/credential`;
}

async function listWebhookCredentials(vapi: VapiClient) {
  const response = await vapi.fetch(credentialApiUrl(), { method: "GET" });
  if (!response.ok) return [];

  const body = (await response.json()) as
    | Array<{ id: string; name?: string; provider?: string }>
    | { data?: Array<{ id: string; name?: string; provider?: string }> };

  if (Array.isArray(body)) return body;
  return body.data ?? [];
}

async function createWebhookCredential(vapi: VapiClient): Promise<string> {
  const response = await vapi.fetch(credentialApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inlineWebhookCredential()),
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
 * Reusable org-level HMAC credential for `x-vapi-signature` verification.
 * Set `VAPI_WEBHOOK_CREDENTIAL_ID` to skip list/create API calls.
 */
export async function ensurePlatformWebhookCredentialId(
  vapi: VapiClient
): Promise<string | null> {
  const fromEnv = process.env.VAPI_WEBHOOK_CREDENTIAL_ID?.trim();
  if (fromEnv) {
    cachedWebhookCredentialId = fromEnv;
    return fromEnv;
  }

  if (cachedWebhookCredentialId) return cachedWebhookCredentialId;

  try {
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
  } catch (error) {
    console.error("[vapi-webhook] credential setup failed:", error);
    return null;
  }
}
