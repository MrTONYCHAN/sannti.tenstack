import { generateText } from "ai";
import {
  buildCompanionSystemPrompt,
  createCompanionModel,
} from "./ai-gateway.server";
import {
  buildJournalPrompt,
  crisisJournalAnalysis,
  emptyJournalAiResult,
  type JournalAiResult,
} from "./journal-ai";
import { parseJournalAnalysis } from "./journal-analysis";
import type { JournalEntryInput } from "./journal-schema";

function fromParsedAnalysis(
  parsed: NonNullable<ReturnType<typeof parseJournalAnalysis>>,
): JournalAiResult {
  return {
    ai_summary: parsed.summary,
    ai_triggers: parsed.triggers,
    ai_suggestions: parsed.suggestions,
    ai_sentiment: parsed.sentiment,
  };
}

export async function analyzeJournalEntry(
  entry: JournalEntryInput,
  apiKey: string,
  crisisDetected: boolean,
): Promise<JournalAiResult> {
  if (crisisDetected) return crisisJournalAnalysis();

  try {
    const { text } = await generateText({
      model: createCompanionModel(apiKey),
      system:
        buildCompanionSystemPrompt({ crisisDetected }) +
        "\n\nWhen asked for JSON, respond with raw JSON only.",
      prompt: buildJournalPrompt(entry),
    });
    const parsed = parseJournalAnalysis(text);
    return parsed ? fromParsedAnalysis(parsed) : emptyJournalAiResult();
  } catch (err) {
    console.error("Journal AI analysis failed", err);
    return emptyJournalAiResult();
  }
}

export { crisisJournalAnalysis } from "./journal-ai";
