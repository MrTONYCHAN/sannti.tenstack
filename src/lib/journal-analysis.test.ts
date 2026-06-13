import { describe, expect, it } from "vitest";
import { extractJsonObject, parseJournalAnalysis } from "./journal-analysis";

describe("journal analysis parsing", () => {
  it("extracts JSON from fenced model output", () => {
    expect(extractJsonObject('```json\n{"sentiment":"mixed"}\n```')).toBe(
      '{"sentiment":"mixed"}',
    );
  });

  it("returns validated analysis for a well-formed response", () => {
    const parsed = parseJournalAnalysis(`{
      "sentiment": "mixed",
      "summary": "You had a hard mock test but noticed one useful pattern.",
      "triggers": ["comparison", "sleep loss"],
      "suggestions": ["Take a short walk", "Review only two mistakes"]
    }`);

    expect(parsed).toEqual({
      sentiment: "mixed",
      summary: "You had a hard mock test but noticed one useful pattern.",
      triggers: ["comparison", "sleep loss"],
      suggestions: ["Take a short walk", "Review only two mistakes"],
    });
  });

  it("rejects malformed or unsafe analysis", () => {
    expect(parseJournalAnalysis("not json")).toBeNull();
    expect(
      parseJournalAnalysis(
        '{"sentiment":"panic","summary":"x","triggers":[],"suggestions":[]}',
      ),
    ).toBeNull();
  });
});
