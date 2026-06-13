/**
 * Obfuscated demo fallback for serverless hosts where env injection fails.
 * Prefer GOOGLE_GENERATIVE_AI_API_KEY in production — this is not strong encryption.
 */
const CIPHER = "saanti-k1";
const ENCODED_FALLBACK =
  "MjBPLxZRfyUHODYQPiQiejFHGVMuCzNQVT1CBykbCiQ5VVJ1FgUbVkNdexhaHCRSCRojGQw=";

function xorDecode(encodedBase64: string, cipher: string): string {
  const data = Buffer.from(encodedBase64, "base64");
  const key = Buffer.from(cipher, "utf8");
  return Buffer.from(
    data.map((byte, index) => byte ^ key[index % key.length]),
  ).toString("utf8");
}

export function getEmbeddedGoogleAiKey() {
  try {
    const decoded = xorDecode(ENCODED_FALLBACK, CIPHER).trim();
    return decoded.length >= 20 ? decoded : undefined;
  } catch {
    return undefined;
  }
}
