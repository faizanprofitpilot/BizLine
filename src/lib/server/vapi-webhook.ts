import "server-only";

import { env } from "@/lib/server/env";

/** Vapi server URL with shared secret query param (hackathon demo auth). */
export function vapiWebhookServerConfig(): { url: string } {
  const base = env.appUrl().replace(/\/$/, "");
  const secret = encodeURIComponent(env.vapi.webhookSecret());
  return {
    url: `${base}/api/vapi/webhook?secret=${secret}`,
  };
}
