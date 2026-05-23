import { db } from "@/lib/db";
import { productSlug } from "@/lib/slug";
import type { ProductBreakdown, ResolvedProduct } from "@/lib/schemas";

/**
 * Persist a resolved product (or return the existing one). Idempotent on slug.
 */
export async function upsertProduct(args: {
  product: ResolvedProduct;
  categorySlug: string;
  hsnCode: string;
}) {
  const slug = productSlug(args.product.brand, args.product.name, args.product.variant);
  return db.product.upsert({
    where: { slug },
    update: {
      categorySlug: args.categorySlug,
      hsnCode: args.hsnCode,
    },
    create: {
      slug,
      brand: args.product.brand,
      name: args.product.name,
      variant: args.product.variant,
      barcode: args.product.barcode,
      categorySlug: args.categorySlug,
      hsnCode: args.hsnCode,
      sourceUrls: args.product.sourceUrls.length
        ? JSON.stringify(args.product.sourceUrls)
        : null,
      mrpInPaise: args.product.mrpInPaise,
    },
  });
}

export async function upsertBreakdown(args: {
  productId: string;
  breakdown: ProductBreakdown;
}) {
  const bd = args.breakdown;
  const data = {
    madeInIndiaScoreBp: Math.round(bd.madeInIndiaScorePct * 100),
    madeInIndiaLowBp: Math.round(bd.madeInIndiaRangePct.low * 100),
    madeInIndiaHighBp: Math.round(bd.madeInIndiaRangePct.high * 100),
    compositionMiiBp: Math.round(bd.compositionMiiPct * 100),
    compositionMiiLowBp: Math.round(bd.compositionMiiRangePct.low * 100),
    compositionMiiHighBp: Math.round(bd.compositionMiiRangePct.high * 100),
    componentsJson: JSON.stringify(bd.components),
    importsJson: JSON.stringify(bd.imports),
    gstJson: JSON.stringify(bd.gst),
    reasoningMarkdown: bd.overall.reasoning,
    modelUsed: bd.overall.modelUsed,
    confidenceOverall: bd.overall.confidence,
    templateVersion: bd.overall.templateVersion,
  };
  return db.breakdown.upsert({
    where: { productId: args.productId },
    update: data,
    create: { productId: args.productId, ...data },
  });
}
