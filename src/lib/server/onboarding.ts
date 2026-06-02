import "server-only";

import { zodTextFormat } from "openai/helpers/zod";

import { getFirecrawl } from "@/lib/server/firecrawl";
import { getOpenAI } from "@/lib/server/openai";
import {
  businessExtractSchema,
  receptionistPromptSchema,
  type BusinessExtract,
  type ReceptionistPrompts,
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
          "You extract small-business details for an AI phone receptionist. " +
          "Be thorough on services, hours, address, and phone. " +
          "For recommended_system_prompt and recommended_first_message, only extract if the site states them verbatim; otherwise leave them empty.",
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

const MAX_SCRAPE_CHARS_FOR_PROMPTS = 48_000;

function truncatePagesForPrompt(
  pages: Array<{ url: string; markdown: string }>
): Array<{ url: string; markdown: string }> {
  let used = 0;
  const out: Array<{ url: string; markdown: string }> = [];
  for (const page of pages) {
    if (used >= MAX_SCRAPE_CHARS_FOR_PROMPTS) break;
    const remaining = MAX_SCRAPE_CHARS_FOR_PROMPTS - used;
    const markdown = page.markdown.slice(0, remaining);
    out.push({ url: page.url, markdown });
    used += markdown.length;
  }
  return out;
}

export function buildFallbackReceptionistPrompts(
  extracted: BusinessExtract
): ReceptionistPrompts {
  const name = extracted.business_name || "the business";
  const services =
    extracted.services.length > 0
      ? extracted.services.map((s) => `- ${s}`).join("\n")
      : "- (not listed on website)";

  const system_prompt = [
    `You are the AI phone receptionist for ${name}.`,
    "",
    "## Your role",
    "Answer inbound calls professionally, warmly, and concisely. Help callers book appointments, request services, get directions, or reach the right person. You represent the business accurately—never invent prices, guarantees, or policies not stated below.",
    "",
    "## Business overview",
    name,
    extracted.additional_context
      ? extracted.additional_context
      : "See services and details below from the business website.",
    "",
    "## Services",
    services,
    "",
    "## Hours",
    extracted.hours || "Not specified on the website. Offer to take a message and have someone call back with hours.",
    "",
    "## Location",
    extracted.address || "Not specified on the website.",
    "",
    "## Business phone (reference only — you are answering this line)",
    extracted.phone || "Not specified on the website.",
    "",
    "## How to handle calls",
    "- Greet callers briefly and ask how you can help.",
    "- For service requests: clarify what they need, capture name, callback number, and best time to reach them.",
    "- For appointments: collect preferred date/time and contact details; say the team will confirm.",
    "- For urgent issues: stay calm, gather details, and assure a prompt callback.",
    "- If you do not know an answer, say you will have a team member follow up—do not guess.",
    "",
    "## Tone",
    "Friendly, capable, and human. Keep responses short enough for phone conversation (1–3 sentences when possible).",
  ].join("\n");

  const first_message =
    extracted.recommended_first_message ||
    `Thank you for calling ${name}. How can I help you today?`;

  return { first_message, system_prompt };
}

/** Build a detailed system prompt + greeting from scrape + extracted fields (GPT-4o mini). */
export async function generateReceptionistPrompts(input: {
  sourceUrl: string;
  pages: Array<{ url: string; markdown: string }>;
  extracted: BusinessExtract;
}): Promise<ReceptionistPrompts> {
  const openai = getOpenAI();
  const pages = truncatePagesForPrompt(input.pages);
  const scrapeContent = pages
    .map((p) => `URL: ${p.url}\n\n${p.markdown}`.trim())
    .join("\n\n---\n\n");

  const structuredFields = JSON.stringify(
    {
      business_name: input.extracted.business_name,
      services: input.extracted.services,
      hours: input.extracted.hours,
      address: input.extracted.address,
      phone: input.extracted.phone,
      additional_context: input.extracted.additional_context,
    },
    null,
    2
  );

  try {
    const response = await openai.responses.parse({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: [
            "You write production-ready instructions for an AI phone receptionist.",
            "",
            "system_prompt requirements:",
            "- Use markdown section headers (##) for clarity.",
            "- Include ALL factual business context from the scrape and structured fields: name, what they do, every service, hours, address, phone, policies, service areas, pricing notes ONLY if explicitly on the site.",
            "- Add practical call-handling guidance: appointments, quotes, emergencies, general FAQs, message-taking.",
            "- State what the assistant must NOT invent (prices, guarantees, same-day availability unless stated).",
            "- Target length: roughly 400–900 words when the scrape has enough detail; shorter only if the site is sparse.",
            "- Write in second person ('You are the receptionist for...').",
            "",
            "first_message requirements:",
            "- One or two short sentences spoken when the call connects.",
            "- Professional, warm, mention business name if known.",
            "- Do NOT use the system_prompt text as the greeting.",
          ].join("\n"),
        },
        {
          role: "user",
          content: [
            `Website source: ${input.sourceUrl}`,
            "",
            "Structured extraction (use as facts; prefer scrape if conflict):",
            structuredFields,
            "",
            "Full scraped content:",
            scrapeContent,
          ].join("\n"),
        },
      ],
      text: {
        format: zodTextFormat(receptionistPromptSchema, "receptionist_prompts"),
      },
    });

    const parsed = response?.output_parsed as ReceptionistPrompts | undefined;
    if (parsed) return parsed;

    const textOut =
      (response?.output_text as string | undefined) ??
      (response as unknown as { output?: Array<{ content?: Array<{ text?: string }> }> })
        ?.output?.[0]?.content?.[0]?.text ??
      "";

    return receptionistPromptSchema.parse(JSON.parse(textOut));
  } catch {
    return buildFallbackReceptionistPrompts(input.extracted);
  }
}

