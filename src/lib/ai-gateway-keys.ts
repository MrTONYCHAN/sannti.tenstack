import { getEmbeddedGoogleAiKey } from "./ai-key-fallback";

export const DEFAULT_COMPANION_MODEL = "gemini-2.5-flash";

function readEnvGoogleAiKey() {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY
  )?.trim();
}

export function isValidGoogleAiApiKey(key: string | undefined | null) {
  if (!key?.trim()) return false;
  const trimmed = key.trim();
  if (trimmed.startsWith("AIza")) return true;
  return trimmed.startsWith("AQ.") && trimmed.length >= 20;
}

export function getGoogleAiApiKey() {
  const envKey = readEnvGoogleAiKey();
  if (envKey && isValidGoogleAiApiKey(envKey)) return envKey;

  const embedded = getEmbeddedGoogleAiKey();
  if (embedded && isValidGoogleAiApiKey(embedded)) {
    if (typeof process !== "undefined") {
      console.warn(
        "[ai] using embedded Gemini fallback key — set GOOGLE_GENERATIVE_AI_API_KEY in env for production",
      );
    }
    return embedded;
  }

  return undefined;
}
