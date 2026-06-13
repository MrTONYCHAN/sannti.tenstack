import { describe, expect, it } from "vitest";
import { journalEntrySchema } from "./journal-schema";

describe("journalEntrySchema", () => {
  it("accepts a valid journal payload", () => {
    const parsed = journalEntrySchema.parse({
      mood: 6,
      stress: 5,
      energy: 7,
      sleep_hours: 7.5,
      study_hours: 4,
      content: "Today was tough but I finished one chapter.",
    });
    expect(parsed.content).toBe("Today was tough but I finished one chapter.");
  });

  it("rejects content that is too short", () => {
    expect(() =>
      journalEntrySchema.parse({
        mood: 6,
        stress: 5,
        energy: 7,
        content: "hi",
      }),
    ).toThrow();
  });

  it("rejects mood values outside 1–10", () => {
    expect(() =>
      journalEntrySchema.parse({
        mood: 0,
        stress: 5,
        energy: 7,
        content: "Valid entry text here.",
      }),
    ).toThrow();
  });
});
