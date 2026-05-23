import { computeBaseline } from "./breakdown-compute";
import { lookupGstRate } from "./gst-lookup";
import { brandOriginsForProduct } from "./brand-origins";
import type {
  CategoryTemplate,
  ProductBreakdown,
  ResolvedProduct,
} from "./schemas";

/**
 * The "estimation" pipeline. As of Phase 1 this is a thin wrapper around
 * `computeBaseline` — no LLM in the hot path. Two enrichments before compute:
 *
 *   1. GST rate looked up against CBIC HSN→rate table (Tier 1). Falls back to
 *      template `defaultGstRate` when no CBIC row matches.
 *   2. Brand profit origins enriched from the BrandIndex (Wikidata-derived).
 *      Overrides template's `brandProfit.origins` when the brand has a known
 *      foreign parent.
 *
 * Function signature is kept stable so a later refine pass (Phase 4+) can be
 * slotted in here without touching callers.
 */
export async function estimateBreakdown(args: {
  product: ResolvedProduct;
  template: CategoryTemplate;
  hsnCode: string;
}): Promise<ProductBreakdown> {
  const gst = await lookupGstRate(args.hsnCode, {
    ratePct: args.template.defaultGstRate,
  });

  const brandProfitOrigins = await brandOriginsForProduct(args.product.brand);

  return computeBaseline({
    template: args.template,
    hsnCode: args.hsnCode,
    mrpInPaise: args.product.mrpInPaise ?? null,
    gstOverride: gst,
    brandProfitOriginsOverride: brandProfitOrigins ?? undefined,
  });
}
