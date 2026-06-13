import { describe, expect, it, vi } from "vitest";
import { getEmbeddedGoogleAiKey } from "./ai-key-fallback";
import { getGoogleAiApiKey, isValidGoogleAiApiKey } from "./ai-gateway-keys";

describe("Google AI key resolution", () => {
  it("accepts AIza and AQ. key formats", () => {
    expect(isValidGoogleAiApiKey("AIzaSyAbc123")).toBe(true);
    expect(isValidGoogleAiApiKey("AQ." + "x".repeat(40))).toBe(true);
    expect(isValidGoogleAiApiKey("short")).toBe(false);
  });

  it("decodes the embedded fallback key", () => {
    const key = getEmbeddedGoogleAiKey();
    expect(key).toBeTruthy();
    expect(key?.startsWith("AQ.")).toBe(true);
  });

  it("falls back to embedded key when env is missing", () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("GOOGLE_AI_API_KEY", "");

    expect(getGoogleAiApiKey()).toBe(getEmbeddedGoogleAiKey());

    vi.unstubAllEnvs();
  });
});
