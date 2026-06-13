import { describe, expect, it } from "vitest";
import { crisisJournalAnalysis } from "./journal-ai";

describe("crisisJournalAnalysis", () => {
  it("returns distressed sentiment with support copy", () => {
    const result = crisisJournalAnalysis();
    expect(result.ai_sentiment).toBe("distressed");
    expect(result.ai_summary).toBeTruthy();
    expect(result.ai_suggestions.length).toBeGreaterThan(0);
  });
});
