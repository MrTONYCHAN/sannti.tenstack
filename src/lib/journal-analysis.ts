import { z } from "zod";

export const SentimentSchema = z.enum([
  "positive",
  "neutral",
  "mixed",
  "negative",
  "distressed",
]);

const compactString = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .transform((value) => value.replace(/\s+/g, " "));

export const JournalAnalysisSchema = z.object({
  sentiment: SentimentSchema,
  summary: compactString(320),
  triggers: z.array(compactString(80)).max(6).default([]),
  suggestions: z.array(compactString(180)).max(6).default([]),
});

export type JournalAnalysis = z.infer<typeof JournalAnalysisSchema>;

export function extractJsonObject(text: string): string | null {
  const cleaned = text.replace(/```(?:json)?|```/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return cleaned.slice(start, end + 1);
}

export function parseJournalAnalysis(text: string): JournalAnalysis | null {
  const json = extractJsonObject(text);
  if (!json) return null;

  try {
    const parsed = JSON.parse(json);
    const result = JournalAnalysisSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
