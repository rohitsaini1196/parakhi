import { db } from "./db";

export interface GstLookupResult {
  ratePct: number;
  cessPct: number;
  source: "cbic" | "template-fallback";
  sourceUrl?: string;
  asOfDate?: Date;
  hsnPrefixMatched?: string;
}

/**
 * Look up the GST rate for a given HSN code against the CBIC-derived table.
 *
 * Matching: longest-prefix on `hsnPrefix`. Walks down from 8-digit to 2-digit.
 * If no row found (table empty or HSN truly unmapped) returns
 * `template-fallback` so the caller can use the template's `defaultGstRate`.
 *
 * Callers (estimate.ts) treat fallback as a non-error condition; it just means
 * we haven't ingested CBIC data yet, so the template's editorially-set rate
 * stands. As soon as the CBIC ingest runs, every product silently upgrades to
 * Tier 1 GST without code change.
 */
export async function lookupGstRate(
  hsnCode: string,
  fallback: { ratePct: number; cessPct?: number },
): Promise<GstLookupResult> {
  // Try progressively shorter prefixes: 8, 6, 4, 2 digits.
  const candidates: string[] = [];
  for (let len = hsnCode.length; len >= 2; len -= 2) {
    candidates.push(hsnCode.slice(0, len));
  }
  if (candidates.length === 0) {
    return {
      ratePct: fallback.ratePct,
      cessPct: fallback.cessPct ?? 0,
      source: "template-fallback",
    };
  }

  const rows = await db.hsnGstRate.findMany({
    where: { hsnPrefix: { in: candidates } },
  });
  if (rows.length === 0) {
    return {
      ratePct: fallback.ratePct,
      cessPct: fallback.cessPct ?? 0,
      source: "template-fallback",
    };
  }
  // Pick longest prefix that matched.
  rows.sort((a, b) => b.hsnPrefix.length - a.hsnPrefix.length);
  const best = rows[0]!;
  return {
    ratePct: best.ratePct,
    cessPct: best.cessPct,
    source: "cbic",
    sourceUrl: best.sourceUrl,
    asOfDate: best.asOfDate,
    hsnPrefixMatched: best.hsnPrefix,
  };
}
