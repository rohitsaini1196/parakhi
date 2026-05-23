import { db } from "@/lib/db";
import { resolveQuery } from "@/lib/resolve";
import { categorize, UNCATEGORIZED } from "@/lib/categorize";
import { estimateBreakdown } from "@/lib/estimate";
import { upsertBreakdown, upsertProduct } from "@/lib/persist";
import { CategoryTemplateSchema } from "@/lib/schemas";
import { productSlug } from "@/lib/slug";
import { checkRateLimit } from "@/lib/rate-limit";
import { jsonError } from "@/lib/api";

/**
 * The one-stop search endpoint that the homepage form hits.
 * GET /api/search?q=<query>  →  302 to /p/<slug>  or  /uncategorized?...
 *
 * Flow: resolve → check DB cache → categorize → estimate → persist → redirect.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return Response.redirect(new URL("/", req.url), 302);

  try {
    const resolved = await resolveQuery({ value: q });

    // Cache hit by slug or barcode → straight to product page.
    const slug = productSlug(resolved.brand, resolved.name, resolved.variant);
    const existing = await db.product.findFirst({
      where: {
        OR: [
          { slug },
          resolved.barcode ? { barcode: resolved.barcode } : { slug: "__never__" },
        ],
      },
      include: { breakdown: true },
    });
    if (existing && existing.breakdown) {
      return Response.redirect(new URL(`/p/${existing.slug}`, req.url), 302);
    }

    const limit = await checkRateLimit(req, "estimate");
    if (!limit.ok) return jsonError(429, limit.reason!);

    const cat = await categorize(resolved);
    if (cat.categorySlug === UNCATEGORIZED) {
      const params = new URLSearchParams({
        brand: resolved.brand,
        name: resolved.name,
        variant: resolved.variant ?? "",
      });
      return Response.redirect(
        new URL(`/uncategorized?${params}`, req.url),
        302,
      );
    }

    const category = await db.category.findUnique({
      where: { slug: cat.categorySlug },
    });
    if (!category) return jsonError(500, "Categorizer returned missing slug");
    const template = CategoryTemplateSchema.parse(
      JSON.parse(category.templateJson),
    );

    const breakdown = await estimateBreakdown({
      product: resolved,
      template,
      hsnCode: cat.hsnCode || template.hsnCodes[0]!,
    });

    const persisted = await upsertProduct({
      product: resolved,
      categorySlug: cat.categorySlug,
      hsnCode: cat.hsnCode || template.hsnCodes[0]!,
    });
    await upsertBreakdown({ productId: persisted.id, breakdown });

    return Response.redirect(new URL(`/p/${persisted.slug}`, req.url), 302);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const params = new URLSearchParams({ q, error: message });
    return Response.redirect(new URL(`/?${params}`, req.url), 302);
  }
}
