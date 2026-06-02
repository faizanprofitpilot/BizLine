import "server-only";

import { env } from "@/lib/server/env";

const PLATFORM_WEBHOOK_CREDENTIAL_NAME = "CursorHackathon Platform Webhook";

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

/** Embedded on assistant create/update — avoids unsupported credential REST passthrough. */
export function inlineWebhookCredential() {
  return {
    provider: "webhook" as const,
    name: PLATFORM_WEBHOOK_CREDENTIAL_NAME,
    authenticationPlan: webhookHmacAuthenticationPlan(),
  };
}

export function vapiWebhookServerConfig(credentialId: string) {
  return {
    url: vapiWebhookUrl(),
    credentialId,
  };
}

/**
 * Optional pre-created credential from Vapi dashboard.
 * Set `VAPI_WEBHOOK_CREDENTIAL_ID` in env to use it; otherwise assistants use inline credentials.
 */
export function getPlatformWebhookCredentialIdFromEnv(): string | null {
  const id = process.env.VAPI_WEBHOOK_CREDENTIAL_ID?.trim();
  return id || null;
}
