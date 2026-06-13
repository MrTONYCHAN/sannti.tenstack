import { describe, expect, it } from "vitest";
import { containsCrisisLanguage, formatHelplines } from "./wellness-safety";

describe("wellness safety helpers", () => {
  it("detects explicit crisis language", () => {
    expect(containsCrisisLanguage("I want to die after this exam")).toBe(true);
    expect(containsCrisisLanguage("I am thinking about self harm")).toBe(true);
  });

  it("does not flag ordinary exam stress", () => {
    expect(
      containsCrisisLanguage("I am anxious about tomorrow's mock test"),
    ).toBe(false);
  });

  it("formats India helplines for prompt context", () => {
    expect(formatHelplines()).toContain("iCall");
    expect(formatHelplines()).toContain("AASRA");
  });
});
