import { describe, expect, it } from "vitest";
import { moodEmoji } from "./journal-mood";

describe("moodEmoji", () => {
  it("maps stress levels to distinct emojis", () => {
    expect(moodEmoji("stress", 9)).toBe("🌪️");
    expect(moodEmoji("stress", 6)).toBe("😟");
    expect(moodEmoji("stress", 2)).toBe("🌿");
  });

  it("maps mood levels to distinct emojis", () => {
    expect(moodEmoji("mood", 8)).toBe("😊");
    expect(moodEmoji("mood", 5)).toBe("😐");
    expect(moodEmoji("mood", 2)).toBe("😔");
  });
});
