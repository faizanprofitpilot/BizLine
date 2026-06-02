import { z } from "zod";

export const callClassifySchema = z.object({
  summary: z.string().default(""),
  outcome: z.string().default(""),
  urgency: z.string().default(""),
  sentiment: z.string().default(""),
});

export type CallClassify = z.infer<typeof callClassifySchema>;

