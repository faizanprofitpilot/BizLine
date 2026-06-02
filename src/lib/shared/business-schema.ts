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

