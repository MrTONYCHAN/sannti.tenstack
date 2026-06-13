import type { JournalEntryInput } from "./journal-schema";
import { CRISIS_SUGGESTIONS, CRISIS_SUPPORT_MESSAGE } from "./wellness-safety";

export type JournalAiResult = {
  ai_summary: string | null;
  ai_triggers: string[];
  ai_suggestions: string[];
  ai_sentiment: string | null;
};

export const emptyJournalAiResult = (): JournalAiResult => ({
  ai_summary: null,
  ai_triggers: [],
  ai_suggestions: [],
  ai_sentiment: null,
});

export function crisisJournalAnalysis(): JournalAiResult {
  return {
    ai_summary: CRISIS_SUPPORT_MESSAGE,
    ai_triggers: ["possible crisis language"],
    ai_suggestions: CRISIS_SUGGESTIONS,
    ai_sentiment: "distressed",
  };
}

export function buildJournalPrompt(entry: JournalEntryInput) {
  return `Student journal entry:
Mood: ${entry.mood}/10, Stress: ${entry.stress}/10, Energy: ${entry.energy}/10
Sleep: ${entry.sleep_hours ?? "n/a"} hours, Study: ${entry.study_hours ?? "n/a"} hours

Entry:
"""${entry.content}"""

Analyze this entry. Respond ONLY in this exact JSON shape (no markdown, no prose):
{"sentiment":"positive|neutral|mixed|negative|distressed","summary":"one warm empathetic sentence","triggers":["short trigger 1","short trigger 2"],"suggestions":["actionable suggestion 1","actionable suggestion 2","actionable suggestion 3"]}`;
}
