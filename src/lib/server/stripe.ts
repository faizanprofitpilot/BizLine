import "server-only";

import Stripe from "stripe";

import { env } from "@/lib/server/env";

let stripeSingleton: Stripe | null = null;

export function getStripe() {
  if (stripeSingleton) return stripeSingleton;

  stripeSingleton = new Stripe(env.stripe.secretKey(), {
    // Intentionally omit apiVersion: follow account default unless pinned later.
    typescript: true,
  });

  return stripeSingleton;
}

