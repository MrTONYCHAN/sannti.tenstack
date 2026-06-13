import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveAuthContext } from "@/lib/auth-context";
import * as localData from "@/lib/local-data.server";
import { analyzeJournalEntry } from "@/lib/journal-ai.server";
import { emptyJournalAiResult } from "@/lib/journal-ai";
import { getGoogleAiApiKey } from "./ai-gateway.server";
import { journalEntrySchema } from "./journal-schema";
import { containsCrisisLanguage } from "./wellness-safety";

export const createJournalEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => journalEntrySchema.parse(d))
  .handler(async ({ data, context }) => {
    const ctx = resolveAuthContext(context);
    const crisisDetected = containsCrisisLanguage(data.content);
    const apiKey = getGoogleAiApiKey();
    const empty = emptyJournalAiResult();
    const analysis = crisisDetected
      ? await analyzeJournalEntry(data, apiKey ?? "", true)
      : apiKey
        ? await analyzeJournalEntry(data, apiKey, false)
        : empty;

    const payload = {
      mood: data.mood,
      stress: data.stress,
      energy: data.energy,
      sleep_hours: data.sleep_hours ?? null,
      study_hours: data.study_hours ?? null,
      content: data.content,
      ...analysis,
    };

    if (ctx.localMode) {
      return localData.insertJournalEntry(ctx.userId, payload);
    }

    const { data: row, error } = await ctx
      .supabase!.from("journal_entries")
      .insert({ user_id: ctx.userId, ...payload })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listJournalEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = resolveAuthContext(context);
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
