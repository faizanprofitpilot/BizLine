import "server-only";

import OpenAI from "openai";

import { env } from "@/lib/server/env";

let openaiSingleton: OpenAI | null = null;

export function getOpenAI() {
  if (openaiSingleton) return openaiSingleton;
  openaiSingleton = new OpenAI({ apiKey: env.openai.apiKey() });
  return openaiSingleton;
}

