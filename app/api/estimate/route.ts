import { z } from "zod";
import { db } from "@/lib/db";
import { CategoryTemplateSchema, ResolvedProductSchema } from "@/lib/schemas";
import { estimateBreakdown } from "@/lib/estimate";
import { upsertBreakdown, upsertProduct } from "@/lib/persist";
import { categorize, UNCATEGORIZED } from "@/lib/categorize";
import { handleError, jsonError, readJson } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * One endpoint, two modes:
 *
 *   - { productId }                  → re-estimate an existing product
 *   - { product, categorySlug?, hsnCode? } → estimate from a resolved product
 *
 * If no category is given, we run categorize() internally. If categorization
 * returns "uncategorized", we respond with that — the client (not us) decides
 * to show the "vote to add" screen.
 */
const BodySchema = z.union([
  z.object({ productId: z.string() }),
  z.object({
    product: ResolvedProductSchema,
    categorySlug: z.string().optional(),
    hsnCode: z.string().optional(),
  }),
]);

export async function POST(req: Request) {
  const limit = await checkRateLimit(req);
  if (!limit.ok) return jsonError(429, limit.reason!);

  try {
    const body = BodySchema.parse(await readJson(req));

    // Mode A: re-estimate existing product
    if ("productId" in body) {
      const product = await db.product.findUnique({
        where: { id: body.productId },
        include: { category: true },
      });
      if (!product) return jsonError(404, "Product not found");

      const template = CategoryTemplateSchema.parse(
        JSON.parse(product.category.templateJson),
      );
      const breakdown = await estimateBreakdown({
        product: {
          brand: product.brand,
          name: product.name,
          variant: product.variant ?? undefined,
          barcode: product.barcode ?? undefined,
          mrpInPaise: product.mrpInPaise ?? undefined,
          sourceUrls: product.sourceUrls
            ? (JSON.parse(product.sourceUrls) as string[])
            : [],
        },
        template,
        hsnCode: product.hsnCode ?? template.hsnCodes[0] ?? "",
      });
      await upsertBreakdown({ productId: product.id, breakdown });
      return Response.json({ productId: product.id, slug: product.slug, breakdown });
    }

    // Mode B: estimate from a freshly resolved product
    let { categorySlug, hsnCode } = body;
    if (!categorySlug || !hsnCode) {
      const cat = await categorize(body.product);
      categorySlug = cat.categorySlug;
      hsnCode = cat.hsnCode;
    }

    if (categorySlug === UNCATEGORIZED) {
      return Response.json({
        status: "uncategorized",
        message:
          "We haven't researched this category yet. Vote for it and we'll add it.",
      });
    }

    const category = await db.category.findUnique({ where: { slug: categorySlug } });
    if (!category) return jsonError(404, `Unknown category ${categorySlug}`);
    const template = CategoryTemplateSchema.parse(JSON.parse(category.templateJson));

    const breakdown = await estimateBreakdown({
      product: body.product,
      template,
      hsnCode: hsnCode || template.hsnCodes[0]!,
    });
    const persisted = await upsertProduct({
      product: body.product,
      categorySlug,
      hsnCode: hsnCode || template.hsnCodes[0]!,
    });
    await upsertBreakdown({ productId: persisted.id, breakdown });

    return Response.json({
      productId: persisted.id,
      slug: persisted.slug,
      breakdown,
    });
  } catch (e) {
    return handleError(e);
  }
}
