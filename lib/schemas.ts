import { z } from "zod";

/**
 * Zod schemas for the data contract (brief §5).
 * These are the single source of truth — DB JSON blobs and LLM outputs are validated against them.
 */

export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const SourceTierSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);
export type SourceTier = z.infer<typeof SourceTierSchema>;

const PctRange = z.object({ low: z.number(), high: z.number() });
const PaiseRange = z.object({ low: z.number().int(), high: z.number().int() });

/** Country-of-origin entry (shared between raw materials and cost buckets). */
export const OriginSchema = z.object({
  country: z.string(),
  countryName: z.string(),
  probabilityPct: z.number(),
  notes: z.string().optional(),
});
export type Origin = z.infer<typeof OriginSchema>;

/**
 * Cost-bucket bounds. `origins` is optional and defaults to 100% India when
 * omitted — appropriate for labor-heavy / domestic buckets (manufacturing,
 * logistics, retail, advertising). Set explicitly when a category meaningfully
 * imports a bucket: e.g. aluminum cans from the Middle East show up under
 * `packaging.origins`; royalty/brand-profit flowing to a foreign parent
 * (Coca-Cola Atlanta, Unilever London) shows up under `brandProfit.origins`.
 */
const BucketSchema = z.object({
  lowPct: z.number(),
  highPct: z.number(),
  origins: z.array(OriginSchema).optional(),
});

/** Category template — stored in Category.templateJson. */
export const CategoryTemplateSchema = z.object({
  slug: z.string(),
  displayName: z.string(),
  templateVersion: z.string(),
  defaultGstRate: z.number(),
  hsnCodes: z.array(z.string()),
  // Lowercased keywords used by the deterministic categorizer (Phase 2).
  // Match against product brand+name+ingredients tokens. Optional so older
  // template files validate; default to empty.
  keywords: z.array(z.string()).default([]),
  typicalStructure: z.object({
    // rawMaterials origins are listed per-ingredient in the rawMaterials array.
    rawMaterials: z.object({ lowPct: z.number(), highPct: z.number() }),
    packaging: BucketSchema,
    manufacturing: BucketSchema,
    logistics: BucketSchema,
    retailMargin: BucketSchema,
    brandMargin: BucketSchema,
    advertising: BucketSchema,
    // GST always flows to the Indian government — no origins field.
    gst: z.object({ lowPct: z.number(), highPct: z.number() }),
    brandProfit: BucketSchema,
  }),
  rawMaterials: z.array(
    z.object({
      name: z.string(),
      sharePct: PctRange,
      typicalOrigin: z.array(OriginSchema),
    }),
  ),
  madeInIndiaBand: z.object({ lowPct: z.number(), highPct: z.number() }),
  llmGuidance: z.string(),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      relevance: z.string(),
    }),
  ),
});
export type CategoryTemplate = z.infer<typeof CategoryTemplateSchema>;

/**
 * Cost component within a breakdown.
 *
 * Note: OpenAI strict structured outputs require every field to be `required`,
 * and use `nullable` to express absence. So we use `.nullable()` here (not
 * `.optional()`). All consumers treat `null` as "unknown" — same as undefined.
 */
export const CostComponentSchema = z.object({
  label: z.string(),
  sharePct: z.number(),
  rangePct: PctRange,
  rupeeAmount: z.number().int().nullable(),
  rupeeRange: PaiseRange.nullable(),
  confidence: ConfidenceSchema,
  sourceTier: SourceTierSchema,
  explanation: z.string(),
  /** True when this raw material is confirmed present on the product's actual
   * label (Open Food Facts), not just inferred from the category template. */
  confirmedOnLabel: z.boolean().optional(),
});
export type CostComponent = z.infer<typeof CostComponentSchema>;

export const ImportSchema = z.object({
  ingredient: z.string(),
  sharePctOfProduct: z.number(),
  likelyCountries: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      probabilityPct: z.number(),
    }),
  ),
  notes: z.string().nullable(),
});
export type Import = z.infer<typeof ImportSchema>;

export const GstInfoSchema = z.object({
  ratePct: z.number(),
  rupeeAmount: z.number().int().nullable(),
  hsnCode: z.string(),
  confidence: ConfidenceSchema,
  asOfDate: z.string(),
});
export type GstInfo = z.infer<typeof GstInfoSchema>;

/**
 * Full product breakdown — the canonical output shape of computeBaseline.
 *
 * `madeInIndiaScorePct` is the **Indian Value Capture (IVC)** — MRP-weighted
 * share that flows to Indian sources across every cost bucket *except* GST.
 * Field name retained for storage continuity; semantically it's IVC now.
 *
 * `compositionMiiPct` is the secondary score: weighted P(Indian) across raw
 * materials only, ignoring buckets. Useful when the question is "what is this
 * physically made of?" rather than "where does my rupee go?".
 */
export const ProductBreakdownSchema = z.object({
  madeInIndiaScorePct: z.number(),
  madeInIndiaRangePct: PctRange,
  compositionMiiPct: z.number(),
  compositionMiiRangePct: PctRange,
  components: z.array(CostComponentSchema),
  imports: z.array(ImportSchema),
  gst: GstInfoSchema,
  overall: z.object({
    confidence: ConfidenceSchema,
    reasoning: z.string(),
    modelUsed: z.string(),
    templateVersion: z.string(),
  }),
});
export type ProductBreakdown = z.infer<typeof ProductBreakdownSchema>;

/** Resolved product after Layer 1 — what the rest of the pipeline consumes. */
export const ResolvedProductSchema = z.object({
  brand: z.string(),
  name: z.string(),
  variant: z.string().optional(),
  barcode: z.string().optional(),
  mrpInPaise: z.number().int().optional(),
  declaredIngredients: z.array(z.string()).optional(),
  sourceUrls: z.array(z.string()),
});
export type ResolvedProduct = z.infer<typeof ResolvedProductSchema>;
