import { db } from "./db";
import type { Origin } from "./schemas";

/**
 * Given a brand name as it appears in a `ResolvedProduct`, look up the brand
 * in the BrandIndex and return a foreign-origin override for the brandProfit
 * cost bucket. Returns null if:
 *
 *   - the brand isn't in the index (no override; template default stands)
 *   - the brand's resolved country is "IN" (template default stands; no
 *     point overriding with "100% Indian" since that's already the default)
 *
 * Matching strategy: exact canonicalName, then aliases-array contains (case-
 * insensitive). Fuzzy match is deliberately omitted in Phase 1 — false
 * positives here silently rewrite a product's IVC score. We'd rather miss the
 * enrichment than misattribute origin.
 */
export async function brandOriginsForProduct(
  brand: string,
): Promise<Origin[] | null> {
  if (!brand) return null;
  const needle = brand.trim().toLowerCase();
  if (!needle) return null;

  // Exact canonical-name match (case-insensitive via lowercased aliases search).
  const rows = await db.brandIndex.findMany({
    where: {
      OR: [
        { canonicalName: { equals: brand } },
        // SQLite doesn't have ILIKE; for case-insensitive equality we keep
        // a lowercased version in the aliases JSON and look there.
        { aliases: { contains: `"${needle}"` } },
      ],
    },
  });

  const hit = rows[0];
  if (!hit) return null;
  if (hit.country === "IN") return null;

  return [
    {
      country: hit.country,
      countryName: countryName(hit.country),
      probabilityPct: 100,
      notes: hit.parentCompany
        ? `Brand profit flows to ${hit.parentCompany} (${hit.country}).`
        : `Brand registered in ${hit.country}.`,
    },
  ];
}

const COUNTRY_NAMES: Record<string, string> = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  CH: "Switzerland",
  DE: "Germany",
  NL: "Netherlands",
  FR: "France",
  IT: "Italy",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  AE: "UAE",
  SG: "Singapore",
  AU: "Australia",
};

function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}
