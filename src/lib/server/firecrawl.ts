import "server-only";

import { Firecrawl } from "firecrawl";

import { env } from "@/lib/server/env";

let firecrawlSingleton: Firecrawl | null = null;

export function getFirecrawl() {
  if (firecrawlSingleton) return firecrawlSingleton;
  firecrawlSingleton = new Firecrawl({ apiKey: env.firecrawl.apiKey() });
  return firecrawlSingleton;
}

