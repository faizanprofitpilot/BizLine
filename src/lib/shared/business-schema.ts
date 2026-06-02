import { z } from "zod";

export const businessExtractSchema = z.object({
  business_name: z.string().default(""),
  services: z.array(z.string()).default([]),
  hours: z.string().default(""),
  address: z.string().default(""),
  phone: z.string().default(""),
  additional_context: z.string().default(""),
  recommended_first_message: z.string().default(""),
  recommended_system_prompt: z.string().default(""),
});

export type BusinessExtract = z.infer<typeof businessExtractSchema>;

/** Full receptionist instructions generated from scrape + structured fields. */
export const receptionistPromptSchema = z.object({
  first_message: z.string().min(1),
  system_prompt: z.string().min(200),
});

export type ReceptionistPrompts = z.infer<typeof receptionistPromptSchema>;

