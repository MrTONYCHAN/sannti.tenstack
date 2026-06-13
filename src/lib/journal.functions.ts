import { createServerFn } from "@tanstack/react-start";
import {
  requireSupabaseAuth,
  type AuthContext,
} from "@/integrations/supabase/auth-middleware";
import * as localData from "@/lib/local-data.server";
import { generateText } from "ai";
import {
  buildCompanionSystemPrompt,
  createCompanionModel,
  getGoogleAiApiKey,
} from "./ai-gateway.server";
import { parseJournalAnalysis } from "./journal-analysis";
import {
  containsCrisisLanguage,
  CRISIS_SUGGESTIONS,
  CRISIS_SUPPORT_MESSAGE,
} from "./wellness-safety";

import { journalEntrySchema } from "./journal-schema";

export const createJournalEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => journalEntrySchema.parse(d))
  .handler(async ({ data, context }) => {
    const ctx = context as AuthContext;
    const key = getGoogleAiApiKey();
    const crisisDetected = containsCrisisLanguage(data.content);

    let ai_summary: string | null = null;
    let ai_triggers: string[] = [];
    let ai_suggestions: string[] = [];
    let ai_sentiment: string | null = null;

    if (crisisDetected) {
      ai_summary = CRISIS_SUPPORT_MESSAGE;
      ai_triggers = ["possible crisis language"];
      ai_suggestions = CRISIS_SUGGESTIONS;
      ai_sentiment = "distressed";
    }

    if (key) {
      try {
        const prompt = `Student journal entry:
Mood: ${data.mood}/10, Stress: ${data.stress}/10, Energy: ${data.energy}/10
Sleep: ${data.sleep_hours ?? "n/a"} hours, Study: ${data.study_hours ?? "n/a"} hours

Entry:
"""${data.content}"""

Analyze this entry. Respond ONLY in this exact JSON shape (no markdown, no prose):
{"sentiment":"positive|neutral|mixed|negative|distressed","summary":"one warm empathetic sentence","triggers":["short trigger 1","short trigger 2"],"suggestions":["actionable suggestion 1","actionable suggestion 2","actionable suggestion 3"]}`;

        const { text } = await generateText({
          model: createCompanionModel(key),
          system:
            buildCompanionSystemPrompt({ crisisDetected }) +
            "\n\nWhen asked for JSON, respond with raw JSON only.",
          prompt,
        });
        const parsed = parseJournalAnalysis(text);
        if (parsed) {
          ai_summary = parsed.summary;
          ai_triggers = parsed.triggers;
          ai_suggestions = parsed.suggestions;
          ai_sentiment = parsed.sentiment;
        }
      } catch (err) {
        console.error("Journal AI analysis failed", err);
      }
    }

    if (ctx.localMode) {
      return localData.insertJournalEntry(ctx.userId, {
        mood: data.mood,
        stress: data.stress,
        energy: data.energy,
        sleep_hours: data.sleep_hours ?? null,
        study_hours: data.study_hours ?? null,
        content: data.content,
        ai_summary,
        ai_triggers,
        ai_suggestions,
        ai_sentiment,
      });
    }

    const { data: row, error } = await ctx
      .supabase!.from("journal_entries")
      .insert({
        user_id: ctx.userId,
        mood: data.mood,
        stress: data.stress,
        energy: data.energy,
        sleep_hours: data.sleep_hours ?? null,
        study_hours: data.study_hours ?? null,
        content: data.content,
        ai_summary,
        ai_triggers,
        ai_suggestions,
        ai_sentiment,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listJournalEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as AuthContext;
    if (ctx.localMode) {
      return localData.listJournalEntries(ctx.userId);
    }

    const { data, error } = await ctx
      .supabase!.from("journal_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
