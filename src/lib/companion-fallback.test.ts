import { describe, expect, it } from "vitest";
import { buildFallbackCompanionReply } from "./companion-fallback";

describe("buildFallbackCompanionReply", () => {
  it("returns crisis support when crisis language is detected", () => {
    const reply = buildFallbackCompanionReply("I want to die", true);
    expect(reply).toContain("Your safety matters");
    expect(reply).toContain("iCall");
  });

  it("returns empathetic offline guidance for ordinary stress", () => {
    const reply = buildFallbackCompanionReply(
      "I failed my mock test and feel hopeless about NEET",
    );
    expect(reply).toContain("Thank you for sharing");
    expect(reply).toContain("offline support mode");
    expect(reply).not.toContain("Your safety matters");
  });

  it("truncates long user messages in the preview", () => {
    const longText = "x".repeat(150);
    const reply = buildFallbackCompanionReply(longText);
    expect(reply).toContain("…");
    expect(reply).not.toContain("x".repeat(130));
  });
});
