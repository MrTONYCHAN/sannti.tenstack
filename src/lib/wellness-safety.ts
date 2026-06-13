export const HELPLINES = [
  { name: "iCall", phone: "9152987821" },
  { name: "Vandrevala Foundation", phone: "1860-2662-345" },
  { name: "AASRA", phone: "9820466726" },
] as const;

const CRISIS_PATTERNS = [
  /\bkill myself\b/i,
  /\bend my life\b/i,
  /\bi want to die\b/i,
  /\bi don't want to live\b/i,
  /\bi do not want to live\b/i,
  /\bsuicid(?:e|al)\b/i,
  /\bself[-\s]?harm\b/i,
  /\bhurt myself\b/i,
  /\bcut myself\b/i,
  /\boverdose\b/i,
  /\babuse\b/i,
];

export const CRISIS_SUPPORT_MESSAGE =
  "If you might hurt yourself or feel unsafe, please contact a trusted adult now and call local emergency services. In India, free confidential support is available through iCall (9152987821), Vandrevala Foundation (1860-2662-345), and AASRA (9820466726).";

export const CRISIS_SUGGESTIONS = [
  "Move near another person or call someone you trust before doing anything else.",
  "Put distance between yourself and anything you could use to hurt yourself.",
  "Use one helpline now: iCall 9152987821, Vandrevala Foundation 1860-2662-345, or AASRA 9820466726.",
];

export function containsCrisisLanguage(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return false;
  return CRISIS_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function formatHelplines(): string {
  return HELPLINES.map(({ name, phone }) => `${name} (${phone})`).join(", ");
}
