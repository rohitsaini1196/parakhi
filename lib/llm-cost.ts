/**
 * Per-1M-token USD pricing. Update when providers change prices.
 * Unknown models fall back to 0 — visible in DB as "free" so we notice.
 */
const PRICING: Record<string, { in: number; out: number }> = {
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "gpt-4o": { in: 2.5, out: 10 },
  "gpt-4.1-mini": { in: 0.4, out: 1.6 },
  "gpt-4.1": { in: 2.0, out: 8.0 },
  // Gemini paid-tier pricing (free tier = $0; rows here for when quota exceeded)
  "gemini-2.0-flash": { in: 0.10, out: 0.40 },
  "gemini-1.5-flash": { in: 0.075, out: 0.30 },
  "gemini-1.5-pro": { in: 1.25, out: 5.0 },
};

export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const p = PRICING[model];
  if (!p) return 0;
  return (inputTokens / 1_000_000) * p.in + (outputTokens / 1_000_000) * p.out;
}
