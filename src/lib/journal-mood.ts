export type MoodMetric = "mood" | "stress" | "energy";

export function moodEmoji(kind: MoodMetric, value: number): string {
  if (kind === "stress") return value >= 8 ? "🌪️" : value >= 5 ? "😟" : "🌿";
  if (kind === "energy") return value >= 7 ? "⚡" : value >= 4 ? "🙂" : "😴";
  return value >= 7 ? "😊" : value >= 4 ? "😐" : "😔";
}
