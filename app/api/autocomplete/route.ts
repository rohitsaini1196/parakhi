import { db } from "@/lib/db";

/**
 * Autocomplete for the search box. GET /api/autocomplete?q=<prefix>
 *
 * Returns two kinds of suggestions:
 *   1. Existing products (already analyzed) → direct link to /p/<slug>
 *   2. Known brands (from BrandIndex) → seed a query the user can refine
 *
 * Deterministic, no LLM. Cheap enough to call on every keystroke (debounced
 * client-side). Caps results to keep the payload small.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) {
    return Response.json({ products: [], brands: [] });
  }

  const [products, brands] = await Promise.all([
    db.product.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { brand: { contains: q } },
        ],
        breakdown: { isNot: null },
      },
      select: {
        slug: true,
        brand: true,
        name: true,
        variant: true,
        breakdown: { select: { madeInIndiaScoreBp: true } },
      },
      take: 6,
      orderBy: { isHeroProduct: "desc" },
    }),
    db.brandIndex.findMany({
      where: {
        OR: [
          { canonicalName: { contains: q } },
          { aliases: { contains: q } },
        ],
      },
      select: { canonicalName: true, country: true },
      take: 6,
    }),
  ]);

  return Response.json({
    products: products.map((p) => ({
      slug: p.slug,
      brand: p.brand,
      name: p.name,
      variant: p.variant,
      ivc: p.breakdown ? Math.round(p.breakdown.madeInIndiaScoreBp / 100) : null,
    })),
    brands: brands.map((b) => ({
      name: b.canonicalName,
      country: b.country,
    })),
  });
}
