import "server-only";

import { VapiClient } from "@vapi-ai/server-sdk";
import { VapiEnvironment } from "@vapi-ai/server-sdk";

import { env } from "@/lib/server/env";

/** Vapi REST base — required for `client.fetch()` relative paths in production. */
export const VAPI_API_BASE = VapiEnvironment.Default;

let vapiSingleton: VapiClient | null = null;

export function getVapi() {
  if (vapiSingleton) return vapiSingleton;
  vapiSingleton = new VapiClient({
    token: env.vapi.apiKey(),
    baseUrl: VAPI_API_BASE,
  });
  return vapiSingleton;
}

