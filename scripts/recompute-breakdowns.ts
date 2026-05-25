/**
 * Recompute every non-hero product's breakdown.
 *
 * Goes through the full deterministic pipeline:
 *   1. `lookupGstRate` → CBIC HSN→rate (Tier 1) or template fallback
 *   2. `brandOriginsForProduct` → BrandIndex override for brandProfit bucket
 *   3. `computeBaseline` → pure compute
 *   4. `upsertBreakdown` → idempotent write
 *
 * Skips hero products (their breakdowns are hand-curated and intentionally
 * override the algorithm).
 *
 * Safe to re-run. No LLM calls. Run after any change to:
 *   - lib/breakdown-compute.ts
 *   - prisma/seed-data/<category>.ts (template values)
 *   - HsnGstRate (npm run ingest:cbic)
 *   - BrandIndex (npm run ingest:wikidata)
 *
 *   npm run recompute
 */
import { db } from "../lib/db";
import { computeBaseline } from "../lib/breakdown-compute";
import { CategoryTemplateSchema } from "../lib/schemas";
import { upsertBreakdown } from "../lib/persist";
import { lookupGstRate } from "../lib/gst-lookup";
import { brandOriginsForProduct } from "../lib/brand-origins";
import { isNoteworthy, writeScoreDeltaAlert } from "../lib/alerts";
import { latestCommodityPrices } from "../lib/commodity";

async function main() {
  const products = await db.product.findMany({
    where: { isHeroProduct: false },
    include: { category: true, breakdown: true },
  });

  if (products.length === 0) {
    console.log("No non-hero products to recompute.");
    return;
  }

  const commodityPrices = await latestCommodityPrices();

  for (const product of products) {
    const template = CategoryTemplateSchema.parse(
      JSON.parse(product.category.templateJson),
    );
    const hsnCode = product.hsnCode ?? template.hsnCodes[0]!;

    const gst = await lookupGstRate(hsnCode, {
      ratePct: template.defaultGstRate,
    });
    const brandOrigins = await brandOriginsForProduct(product.brand);

    const breakdown = computeBaseline({
      template,
      hsnCode,
      mrpInPaise: product.mrpInPaise,
      gstOverride: gst,
      brandProfitOriginsOverride: brandOrigins ?? undefined,
      commodityPrices,
    });

    const previousIvc = product.breakdown
      ? product.breakdown.madeInIndiaScoreBp / 100
      : null;

    await upsertBreakdown({ productId: product.id, breakdown });

    // Emit an alert when a recompute moved IVC past the threshold — a likely
    // sign of a template change or a data-layer shift worth a human look.
    if (isNoteworthy(previousIvc, breakdown.madeInIndiaScorePct)) {
      await writeScoreDeltaAlert({
        slug: product.slug,
        metric: "IVC",
        previous: previousIvc!,
        next: breakdown.madeInIndiaScorePct,
        reason: `template ${template.slug} v${template.templateVersion}, GST ${gst.source}`,
      });
    }

    const delta =
      previousIvc != null
        ? (breakdown.madeInIndiaScorePct - previousIvc).toFixed(1)
        : "new";
    console.log(
      `  ✓ ${product.slug.padEnd(40)} IVC ${breakdown.madeInIndiaScorePct}%  CompMII ${breakdown.compositionMiiPct}%  GST ${gst.source === "cbic" ? "(CBIC)" : "(tmpl)"}  brand ${brandOrigins ? brandOrigins[0]!.country : "IN"}  Δ ${delta}`,
    );
  }

  console.log(`\nRecomputed ${products.length} breakdown(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
