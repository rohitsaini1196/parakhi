import type { Confidence, SourceTier } from "@/lib/schemas";

const CONFIDENCE_COLOR: Record<Confidence, string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-orange-500",
};

const TIER_COLOR: Record<SourceTier, string> = {
  1: "bg-emerald-500",
  2: "bg-emerald-400",
  3: "bg-amber-500",
  4: "bg-orange-500",
};

const TIER_LABEL: Record<SourceTier, string> = {
  1: "Tier 1 — Hard data (gov/HSN/RoC)",
  2: "Tier 2 — Structured open data",
  3: "Tier 3 — Public web sources",
  4: "Tier 4 — LLM reasoning (with ranges)",
};

export function ConfidenceDot({ level }: { level: Confidence }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${CONFIDENCE_COLOR[level]}`}
      title={`Confidence: ${level}`}
      aria-label={`Confidence: ${level}`}
    />
  );
}

export function TierDot({ tier }: { tier: SourceTier }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${TIER_COLOR[tier]}`}
      title={TIER_LABEL[tier]}
      aria-label={TIER_LABEL[tier]}
    />
  );
}
