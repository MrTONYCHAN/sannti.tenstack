import { z } from "zod";

export const journalEntrySchema = z.object({
  mood: z.number().int().min(1).max(10),
  stress: z.number().int().min(1).max(10),
  energy: z.number().int().min(1).max(10),
  sleep_hours: z.number().min(0).max(24).optional(),
  study_hours: z.number().min(0).max(24).optional(),
  content: z.string().trim().min(5).max(8000),
});

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
