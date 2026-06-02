import "server-only";

import { zodTextFormat } from "openai/helpers/zod";

import { getFirecrawl } from "@/lib/server/firecrawl";
import { getOpenAI } from "@/lib/server/openai";
import {
  businessExtractSchema,
  type BusinessExtract,
} from "@/lib/shared/business-schema";

async function scrapeOne(url: string) {
  const firecrawl = getFirecrawl();

  // Firecrawl Node SDK docs: firecrawl.scrape(url, { formats: [...] })
  const res = await firecrawl.scrape(url, { formats: ["markdown"] });

  // Firecrawl docs show result contains markdown; keep fallback for any doc variance.
  const markdown =
    (res?.markdown as string | undefined) ??
    // @ts-expect-error Some SDK versions nest result under `data`.
    (res?.data?.markdown as string | undefined) ??
    "";

  return { url, markdown };
}

export async function scrapeBusinessSource(params: {
  websiteUrl?: string;
  googleBusinessUrl?: string;
}) {
  const sourceUrl = params.websiteUrl || params.googleBusinessUrl;
  if (!sourceUrl) throw new Error("Missing source URL");

  // Conservative v1: scrape only the provided URL.
  // TODO: add evidence-based discovery of about/services/contact pages (or Firecrawl crawl/map)
  // per Firecrawl docs, without guessing site URL patterns.
  const primary = await scrapeOne(sourceUrl);

  return {
    sourceUrl,
    pages: [primary],
  };
}

export async function extractBusinessFromScrape(input: {
  sourceUrl: string;
  pages: Array<{ url: string; markdown: string }>;
}): Promise<BusinessExtract> {
  const openai = getOpenAI();

  const content = input.pages
    .map((p) => `URL: ${p.url}\n\n${p.markdown}`.trim())
    .join("\n\n---\n\n");

  // OpenAI Structured Outputs docs: use Responses API `text.format` with json_schema strict.
  // OpenAI Node SDK helper: zodTextFormat(schema, name)
  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content:
          "You extract small-business details for an AI phone receptionist. Output must match the provided JSON schema.",
      },
      {
        role: "user",
        content:
          `Extract the business fields from the scraped content.\n\n` +
          `Source: ${input.sourceUrl}\n\n` +
          content,
      },
    ],
    text: {
      format: zodTextFormat(businessExtractSchema, "business_extract"),
    },
  });

  // Prefer parsed output when available.
  const parsed = response?.output_parsed as BusinessExtract | undefined;
  if (parsed) return parsed;

  // Fallback: attempt to parse JSON from output text (should be rare).
  const textOut =
    (response?.output_text as string | undefined) ??
    (response as unknown as { output?: Array<{ content?: Array<{ text?: string }> }> })
      ?.output?.[0]?.content?.[0]?.text ??
    "";

  return businessExtractSchema.parse(JSON.parse(textOut));
}

