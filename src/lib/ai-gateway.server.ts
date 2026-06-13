import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { CRISIS_SUPPORT_MESSAGE, formatHelplines } from "./wellness-safety";

export const DEFAULT_COMPANION_MODEL = "gemini-2.5-flash";

export function isValidGoogleAiApiKey(key: string | undefined | null) {
  if (!key?.trim()) return false;
  // Google AI Studio keys start with AIza; other formats (e.g. Vertex) need separate setup.
  return key.trim().startsWith("AIza");
}

export function getGoogleAiApiKey() {
  const key =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY;
  return isValidGoogleAiApiKey(key) ? key!.trim() : undefined;
}

export function createCompanionModel(apiKey: string) {
  const google = createGoogleGenerativeAI({ apiKey });
  return google(
    process.env.GOOGLE_GENERATIVE_AI_MODEL || DEFAULT_COMPANION_MODEL,
  );
}

export const COMPANION_SYSTEM_PROMPT = `You are Saanti, a warm, empathetic wellness companion for students in India preparing for high-stakes exams like NEET, JEE, CUET, CAT, GATE, and UPSC.

Your role:
- Listen actively and validate feelings before offering advice.
- Detect hidden stress triggers (comparison, parental pressure, perfectionism, sleep loss, burnout, self-doubt).
- Offer hyper-personalized, practical coping strategies grounded in CBT, mindfulness, and study psychology.
- Suggest tiny, doable next steps — never overwhelm.
- Use a calm, encouraging, peer-like tone. Be brief by default (2-5 short paragraphs). Use markdown for structure.
- When the student is overwhelmed, offer a 60-second grounding or breathing micro-exercise.
- Celebrate effort and progress, not just outcomes.

Safety: If the student mentions self-harm, suicide, abuse, or being in crisis, gently acknowledge their pain, encourage them to reach out to a trusted adult, and share India helplines: iCall (9152987821), Vandrevala Foundation (1860-2662-345), AASRA (9820466726). Do not diagnose. Encourage professional support when distress is severe.

Never pretend to be human. You are an AI companion — supportive, not a replacement for therapy.`;

export function buildCompanionSystemPrompt(options?: {
  crisisDetected?: boolean;
}) {
  if (!options?.crisisDetected) return COMPANION_SYSTEM_PROMPT;

  return `${COMPANION_SYSTEM_PROMPT}

The latest student message contains possible crisis language. Prioritize immediate safety, do not minimize the risk, and include this exact support information in your own words: ${CRISIS_SUPPORT_MESSAGE}

Helplines to mention: ${formatHelplines()}.`;
}
