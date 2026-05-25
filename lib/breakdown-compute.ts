import type {
  CategoryTemplate,
  CostComponent,
  GstInfo,
  Import,
  Origin,
  ProductBreakdown,
} from "./schemas";
import { anchorForMaterial } from "./commodity";

/**
 * Deterministic baseline breakdown for a product, computed from its category
 * template alone. **No LLM in this path.** Given the same template + HSN +
 * MRP, the output is byte-identical.
 *
 * Division of labor (this is the credibility moat):
 *   - Template defines: raw-material composition, origin probabilities,
 *     typical cost structure bands, GST rate, sources.
 *   - This function defines: how the template numbers become a per-product
 *     breakdown — labels, ranges, rupee math, MII score, source tiers.
 *   - LLM defines: nothing, in v1. (A later "refine" pass may make small
 *     within-band adjustments based on product specifics, but it can never
 *     move a number outside the deterministic range.)
 *
 * Semantics:
 *   - rawMaterial.sharePct in templates is treated as **composition share**
 *     (weight or volume — whichever the template author meant), normalized to
 *     the rawMaterials bucket of MRP. We do NOT assume cost-weighted shares;
 *     a future template version may add `costMultiplier` per material.
 *   - Made-in-India = 100 − Σ(compositionShare × P(non-Indian origin)).
 *     Matches the brief's intent of scoring by raw material origins.
 */

// ── Human-facing labels and copy for the cost buckets ────────────────────────

const BUCKET_LABEL: Record<NonRmBucket, string> = {
  packaging: "Packaging",
  manufacturing: "Manufacturing",
  logistics: "Distribution & logistics",
  retailMargin: "Retailer + distributor margin",
  brandMargin: "Brand margin",
  advertising: "Advertising",
  brandProfit: "Brand's profit",
};

const BUCKET_EXPLANATION: Record<NonRmBucket, string> = {
  packaging: "Plastic, paper, PET, glass, or metal. Industry-standard share for the category.",
  manufacturing: "Labor, energy, machinery depreciation at the factory.",
  logistics: "Trucking, warehousing, regional distribution across India.",
  retailMargin: "Wholesaler + kirana / modern-trade retailer cut.",
  brandMargin: "Brand-owner's wholesale margin to the trade.",
  advertising: "TV, print, digital, sponsorships, promotions.",
  brandProfit: "Operating profit retained by the brand owner (post-tax, pre-dividend).",
};

type NonRmBucket =
  | "packaging"
  | "manufacturing"
  | "logistics"
  | "retailMargin"
  | "brandMargin"
  | "advertising"
  | "brandProfit";

const NON_RM_BUCKETS: NonRmBucket[] = [
  "packaging",
  "manufacturing",
  "logistics",
  "retailMargin",
  "brandMargin",
  "advertising",
  "brandProfit",
];

// ── Small helpers ────────────────────────────────────────────────────────────

const mid = (low: number, high: number) => (low + high) / 2;
const round1 = (n: number) => Math.round(n * 10) / 10;
const round0 = (n: number) => Math.round(n);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * P(origin is Indian) for a list of origins. "MIXED" / "Mixed" entries count
 * as 50% Indian (genuinely unknown) — better than counting them as imports.
 * Empty / undefined origins default to fully Indian (sensible default for
 * domestic buckets like labor, retail).
 */
function probIndian(origins: Origin[] | undefined | null): number {
  if (!origins || origins.length === 0) return 100;
  let p = 0;
  for (const o of origins) {
    if (o.country === "IN") p += o.probabilityPct;
    else if (o.country === "MIXED") p += o.probabilityPct * 0.5;
  }
  return clamp(p, 0, 100);
}

function foreignOnly(origins: Origin[]): Origin[] {
  return [...origins]
    .filter((o) => o.country !== "IN" && o.country !== "MIXED")
    .sort((a, b) => b.probabilityPct - a.probabilityPct);
}

function toCountry(o: Origin) {
  return { code: o.country, name: o.countryName, probabilityPct: o.probabilityPct };
}

/**
 * Returns a short trailing sentence describing notable foreign origins, or ""
 * if the bucket is essentially Indian. Used to annotate component explanations.
 */
function describeForeignOrigins(origins: Origin[] | undefined): string {
  if (!origins || origins.length === 0) return "";
  const foreign = foreignOnly(origins);
  if (foreign.length === 0) return "";
  const top = foreign.slice(0, 3).map((o) => o.countryName).join(", ");
  return `Significant foreign share: ${top}.`;
}

// Generic tokens that don't, on their own, identify a material on a label.
const GENERIC_TOKENS = new Set([
  "oil", "powder", "paste", "solids", "syrup", "extract", "regulator",
  "regulators", "agent", "agents", "flavour", "flavor", "flavouring",
  "colour", "color", "preservative", "preservatives", "emulsifier",
  "emulsifiers", "added", "based", "other", "mixed", "unknown", "and",
  "the", "refined", "edible", "iodised", "leavening",
]);

/**
 * Does a template raw-material appear on the product's declared label?
 * Matches on distinctive tokens (wheat, palm, cocoa, sugar, milk…), ignoring
 * generic words (oil, powder, flavour) that would false-match across materials.
 */
function materialOnLabel(materialName: string, declared: string[]): boolean {
  const tokens = materialName
    .toLowerCase()
    .replace(/[()/,]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !GENERIC_TOKENS.has(t));
  if (tokens.length === 0) return false;
  return declared.some((ing) => tokens.some((t) => ing.includes(t)));
}

function paiseFromPct(pct: number, mrpPaise: number | null | undefined) {
  if (mrpPaise == null) return null;
  return round0((pct / 100) * mrpPaise);
}

function paiseRangeFromPct(
  low: number,
  high: number,
  mrpPaise: number | null | undefined,
) {
  if (mrpPaise == null) return null;
  return {
    low: round0((low / 100) * mrpPaise),
    high: round0((high / 100) * mrpPaise),
  };
}

// ── Main entrypoint ──────────────────────────────────────────────────────────

export interface GstOverride {
  ratePct: number;
  source: "cbic" | "template-fallback";
  sourceUrl?: string;
  asOfDate?: Date;
}

export function computeBaseline(args: {
  template: CategoryTemplate;
  hsnCode: string;
  mrpInPaise?: number | null;
  /** Optional GST rate override (e.g. from CBIC lookup). When omitted or
   * `source==="template-fallback"`, we use `template.defaultGstRate`. */
  gstOverride?: GstOverride;
  /** Optional brandProfit origins override (e.g. from Wikidata enrichment).
   * Replaces template's `brandProfit.origins` entirely when set. */
  brandProfitOriginsOverride?: import("./schemas").Origin[];
  /** Optional Agmarknet commodity price anchors, keyed by commodity name.
   * Raw-material components that map to a commodity get a dated Tier-1
   * wholesale-price anchor instead of a pure template estimate. */
  commodityPrices?: Map<string, import("./commodity").CommodityAnchor>;
  /** Optional declared ingredients from the product's label (Open Food Facts).
   * When present + confident, restricts the raw-material set to what the label
   * actually lists — making composition product-specific, not category-generic. */
  declaredIngredients?: string[];
}): ProductBreakdown {
  const { template, hsnCode, mrpInPaise = null } = args;

  // ── Label-driven raw materials ──────────────────────────────────────────
  // If we have the product's actual label, use it to decide which template
  // raw materials are really in THIS product. Match each material to the
  // declared ingredients; drop those clearly absent (renormalizing the rest).
  // Guarded: only override when the label is reasonably complete and we
  // matched enough, else fall back to the full template set.
  // We use the label to *confirm* which template materials are really in this
  // product (per-component provenance) — we do NOT drop/reweight on it. Fuzzy
  // matching that silently removes a real ingredient (e.g. Frooti losing its
  // fruit pulp because the label said "mango" not "pulp") is worse than an
  // honest category estimate. So composition stays template-derived; the label
  // only adds a "✓ confirmed on label" mark. Correct > impressive-but-wrong.
  const declared = (args.declaredIngredients ?? []).map((s) => s.toLowerCase());
  const labelMatched = new Set<string>();
  if (declared.length >= 3) {
    for (const rm of template.rawMaterials) {
      if (materialOnLabel(rm.name, declared)) labelMatched.add(rm.name);
    }
  }
  const activeRawMaterials = template.rawMaterials;
  // Apply overrides without mutating the template object.
  const effectiveGstRate =
    args.gstOverride?.source === "cbic"
      ? args.gstOverride.ratePct
      : template.defaultGstRate;
  const struct = args.brandProfitOriginsOverride
    ? {
        ...template.typicalStructure,
        brandProfit: {
          ...template.typicalStructure.brandProfit,
          origins: args.brandProfitOriginsOverride,
        },
        gst: {
          ...template.typicalStructure.gst,
          lowPct: effectiveGstRate,
          highPct: effectiveGstRate,
        },
      }
    : {
        ...template.typicalStructure,
        gst: {
          ...template.typicalStructure.gst,
          lowPct: effectiveGstRate,
          highPct: effectiveGstRate,
        },
      };

  // ── 1. Raw-material rows (sub-shares of the rawMaterials bucket of MRP) ──
  const rmBucketLow = struct.rawMaterials.lowPct;
  const rmBucketHigh = struct.rawMaterials.highPct;
  const rmBucketMid = mid(rmBucketLow, rmBucketHigh);

  // Templates aren't required to sum exactly to 100; we normalize.
  const rmInternalTotalMid = activeRawMaterials.reduce(
    (s, rm) => s + mid(rm.sharePct.low, rm.sharePct.high),
    0,
  );
  const rmInternalTotalLow = activeRawMaterials.reduce(
    (s, rm) => s + rm.sharePct.low,
    0,
  );
  const rmInternalTotalHigh = activeRawMaterials.reduce(
    (s, rm) => s + rm.sharePct.high,
    0,
  );

  const components: CostComponent[] = [];

  for (const rm of activeRawMaterials) {
    const internalMid = mid(rm.sharePct.low, rm.sharePct.high);
    const shareOfMrp = (internalMid / rmInternalTotalMid) * rmBucketMid;
    const rangeLow =
      rmInternalTotalLow > 0
        ? (rm.sharePct.low / rmInternalTotalLow) * rmBucketLow
        : 0;
    const rangeHigh =
      rmInternalTotalHigh > 0
        ? (rm.sharePct.high / rmInternalTotalHigh) * rmBucketHigh
        : 0;
    const dominant = [...rm.typicalOrigin].sort(
      (a, b) => b.probabilityPct - a.probabilityPct,
    )[0];
    const originText = dominant
      ? `dominant origin: ${dominant.countryName}${dominant.notes ? ` — ${dominant.notes}` : ""}`
      : "origin unspecified";

    // Agmarknet anchor: if this material maps to a commodity we have a live
    // wholesale price for, upgrade it from a template estimate to a dated
    // Tier-1 market reference.
    const anchor = args.commodityPrices
      ? anchorForMaterial(rm.name, args.commodityPrices)
      : null;
    const confirmed = labelMatched.has(rm.name);
    const labelNote = confirmed ? " Confirmed on the product label (Open Food Facts)." : "";
    const explanation = anchor
      ? `Template composition share; ${originText}. Wholesale ${anchor.commodity.toLowerCase()} ₹${anchor.modalPerQuintal.toLocaleString("en-IN")}/quintal (Agmarknet ${anchor.market}, ${anchor.asOf}) — input-commodity reference.${labelNote}`
      : `Template composition share of the raw-materials bucket; ${originText}.${labelNote}`;

    components.push({
      label: rm.name,
      sharePct: round1(shareOfMrp),
      rangePct: { low: round1(rangeLow), high: round1(rangeHigh) },
      rupeeAmount: paiseFromPct(shareOfMrp, mrpInPaise),
      rupeeRange: paiseRangeFromPct(rangeLow, rangeHigh, mrpInPaise),
      confidence: anchor ? "high" : "medium",
      sourceTier: anchor ? 1 : 2,
      explanation,
      confirmedOnLabel: confirmed,
    });
  }

  // ── 2. Non-raw-material cost buckets ─────────────────────────────────────
  for (const key of NON_RM_BUCKETS) {
    const b = struct[key];
    const m = mid(b.lowPct, b.highPct);
    const origins = b.origins;
    const originSuffix = describeForeignOrigins(origins);
    components.push({
      label: BUCKET_LABEL[key],
      sharePct: round1(m),
      rangePct: { low: round1(b.lowPct), high: round1(b.highPct) },
      rupeeAmount: paiseFromPct(m, mrpInPaise),
      rupeeRange: paiseRangeFromPct(b.lowPct, b.highPct, mrpInPaise),
      confidence: "medium",
      sourceTier: 3,
      explanation: BUCKET_EXPLANATION[key] + (originSuffix ? ` ${originSuffix}` : ""),
    });
  }

  // ── 3. GST row (Tier 1 when CBIC-sourced, otherwise template fallback) ───
  const gstRate = effectiveGstRate;
  const gstFromCbic = args.gstOverride?.source === "cbic";
  const gstAsOf = args.gstOverride?.asOfDate ?? new Date("2025-09-22");
  components.push({
    label: `GST (${gstRate}%)`,
    sharePct: round1(gstRate),
    rangePct: { low: round1(gstRate), high: round1(gstRate) },
    rupeeAmount: paiseFromPct(gstRate, mrpInPaise),
    rupeeRange: paiseRangeFromPct(gstRate, gstRate, mrpInPaise),
    confidence: "high",
    sourceTier: 1,
    explanation: gstFromCbic
      ? `HSN ${hsnCode} attracts ${gstRate}% GST per the CBIC schedule (as of ${gstAsOf.toISOString().slice(0, 10)}).`
      : `HSN ${hsnCode} attracts ${gstRate}% GST per the category template default. (CBIC HSN ingest not yet run.)`,
  });

  // ── 4. Imports list ──────────────────────────────────────────────────────
  // Surface any input — raw material *or* cost bucket — whose probability-
  // weighted non-Indian share is non-trivial. sharePctOfProduct here means
  // "share of MRP attributable to a foreign source." Summing the imports
  // equals (100 − Made-in-India).
  const imports: Import[] = [];
  const IMPORT_THRESHOLD_PCT_NON_IN = 20;

  for (const rm of activeRawMaterials) {
    const pIN = probIndian(rm.typicalOrigin);
    const pNonIN = 100 - pIN;
    if (pNonIN < IMPORT_THRESHOLD_PCT_NON_IN) continue;
    const foreign = foreignOnly(rm.typicalOrigin);
    if (foreign.length === 0) continue;
    const compositionShareOfRM =
      (mid(rm.sharePct.low, rm.sharePct.high) / rmInternalTotalMid) * 100;
    const shareOfMrp = (compositionShareOfRM / 100) * rmBucketMid;
    imports.push({
      ingredient: rm.name,
      sharePctOfProduct: round1((shareOfMrp * pNonIN) / 100),
      likelyCountries: foreign.slice(0, 4).map(toCountry),
      notes: foreign[0]?.notes ?? null,
    });
  }

  for (const key of NON_RM_BUCKETS) {
    const b = struct[key];
    const pIN = probIndian(b.origins);
    const pNonIN = 100 - pIN;
    if (pNonIN < IMPORT_THRESHOLD_PCT_NON_IN) continue;
    const foreign = foreignOnly(b.origins ?? []);
    if (foreign.length === 0) continue;
    const bucketMid = mid(b.lowPct, b.highPct);
    imports.push({
      ingredient: BUCKET_LABEL[key],
      sharePctOfProduct: round1((bucketMid * pNonIN) / 100),
      likelyCountries: foreign.slice(0, 4).map(toCountry),
      notes: foreign[0]?.notes ?? null,
    });
  }

  // ── 5. Indian Value Capture (IVC) — MRP-weighted, GST excluded ───────────
  // Weighted P(Indian) across every cost bucket *except* GST. GST is excluded
  // because tax revenue going to the Indian government is a categorically
  // different question from value flowing to Indian producers, workers, and
  // retailers. Including GST would inflate scores in any 18%+ category.
  let ivcInWeighted = 0;
  let ivcShareTotal = 0;

  for (const rm of activeRawMaterials) {
    const compositionShareOfRM =
      (mid(rm.sharePct.low, rm.sharePct.high) / rmInternalTotalMid) * 100;
    const shareOfMrp = (compositionShareOfRM / 100) * rmBucketMid;
    ivcInWeighted += shareOfMrp * probIndian(rm.typicalOrigin);
    ivcShareTotal += shareOfMrp;
  }
  for (const key of NON_RM_BUCKETS) {
    const b = struct[key];
    const share = mid(b.lowPct, b.highPct);
    ivcInWeighted += share * probIndian(b.origins);
    ivcShareTotal += share;
  }
  // GST deliberately omitted from both numerator and denominator.

  const ivcScore = round1(
    clamp(ivcShareTotal > 0 ? ivcInWeighted / ivcShareTotal : 0, 0, 100),
  );
  const ivcLow = round1(clamp(ivcScore - 5, 0, 100));
  const ivcHigh = round1(clamp(ivcScore + 5, 0, 100));

  // ── 6. Composition-MII — raw materials only, weighted by composition ─────
  // Answers a different question: "of the physical stuff in this product,
  // what fraction came from India?" Water-heavy products (Diet Coke, bottled
  // water) score high here even if their brand value flows abroad. Useful as
  // a secondary signal; never published as the headline.
  let compInWeighted = 0;
  let compTotal = 0;
  for (const rm of activeRawMaterials) {
    const w = mid(rm.sharePct.low, rm.sharePct.high);
    compInWeighted += w * probIndian(rm.typicalOrigin);
    compTotal += w;
  }
  const compMii = round1(
    clamp(compTotal > 0 ? compInWeighted / compTotal : 0, 0, 100),
  );
  const compMiiLow = round1(clamp(compMii - 5, 0, 100));
  const compMiiHigh = round1(clamp(compMii + 5, 0, 100));

  // ── 6. GST struct ────────────────────────────────────────────────────────
  const gst: GstInfo = {
    ratePct: gstRate,
    rupeeAmount: paiseFromPct(gstRate, mrpInPaise),
    hsnCode,
    confidence: "high",
    asOfDate: gstAsOf.toISOString().slice(0, 10),
  };

  // ── 7. Final assembly ────────────────────────────────────────────────────
  return {
    madeInIndiaScorePct: ivcScore,
    madeInIndiaRangePct: { low: ivcLow, high: ivcHigh },
    compositionMiiPct: compMii,
    compositionMiiRangePct: { low: compMiiLow, high: compMiiHigh },
    components,
    imports,
    gst,
    overall: {
      confidence: "medium",
      reasoning:
        `Deterministic baseline derived from the "${template.displayName}" template (v${template.templateVersion}). ` +
        `The headline number is Indian Value Capture — the MRP-weighted share that flows to Indian sources across ` +
        `raw materials, packaging, manufacturing, logistics, retail margin, brand margin, advertising, and brand profit. ` +
        `GST is excluded from this calculation because tax revenue to the government is a categorically different ` +
        `question from value flowing to producers, workers, and retailers. ` +
        `Composition-MII (${compMii}%) is shown alongside as the secondary metric: ` +
        `weighted probability of Indian origin across raw materials only, by composition share. ` +
        `Every component is template-sourced; no per-product LLM reasoning. ` +
        `GST is the CBIC HSN-${hsnCode} rate.`,
      modelUsed: "deterministic-v1",
      templateVersion: template.templateVersion,
    },
  };
}
