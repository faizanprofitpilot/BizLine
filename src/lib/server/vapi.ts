import "server-only";

import { VapiClient } from "@vapi-ai/server-sdk";

import { env } from "@/lib/server/env";

let vapiSingleton: VapiClient | null = null;

export function getVapi() {
  if (vapiSingleton) return vapiSingleton;
  vapiSingleton = new VapiClient({ token: env.vapi.apiKey() });
  return vapiSingleton;
}

