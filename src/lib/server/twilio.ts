import "server-only";

import twilio from "twilio";

import { env } from "@/lib/server/env";

let twilioSingleton:
  | ReturnType<typeof twilio>
  | null = null;

export function getTwilio() {
  if (twilioSingleton) return twilioSingleton;
  twilioSingleton = twilio(env.twilio.accountSid(), env.twilio.authToken(), {
    autoRetry: true,
    maxRetries: 3,
  });
  return twilioSingleton;
}

