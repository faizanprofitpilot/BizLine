import "server-only";

import { Resend } from "resend";

import { env } from "@/lib/server/env";

let resendSingleton: Resend | null = null;

export function getResend() {
  if (resendSingleton) return resendSingleton;
  resendSingleton = new Resend(env.resend.apiKey());
  return resendSingleton;
}

