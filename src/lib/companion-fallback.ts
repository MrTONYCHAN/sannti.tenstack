import { containsCrisisLanguage, formatHelplines } from "./wellness-safety";

export function buildFallbackCompanionReply(
  userText: string,
  crisisDetected = containsCrisisLanguage(userText),
) {
  const trimmed = userText.trim();
  const preview = trimmed.length > 120 ? `${trimmed.slice(0, 117)}…` : trimmed;

  if (crisisDetected) {
    return `I hear how much pain you're carrying right now, and I'm glad you said something.

Your safety matters more than any exam or deadline. Please reach out to someone you trust today, and consider calling a free confidential helpline: ${formatHelplines()}.

If you might hurt yourself, contact local emergency services right away. You don't have to face this alone.`;
  }

  return `Thank you for sharing that with me. It sounds like you're going through something heavy${
    preview ? ` — "${preview}"` : ""
  }.

That feeling makes sense, especially when you're under pressure. For the next few minutes, try this: unclench your jaw, drop your shoulders, and take one slow breath in for 4 counts and out for 6 counts.

When you're ready, pick one tiny next step — a glass of water, a 5-minute walk, or writing down the one thing worrying you most. I'm here with you.`;
}
