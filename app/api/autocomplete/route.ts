import { db } from "@/lib/db";

/**
 * Autocomplete for the search box. GET /api/autocomplete?q=<term>
 *
 * Returns:
 *   1. Existing products (already analyzed) → direct link to /p/<slug>
 *   2. Known brands (from BrandIndex) → seed a query the user can refine
 *
 * Case-insensitive, ranked (prefix match > substring, hero first), matches
 * brand + name + variant. Deterministic, no LLM — cheap to call per keystroke.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return Response.json({ products: [], brands: [] });
  }
  const ci = { contains: q, mode: "insensitive" as const };

  const [products, brands] = await Promise.all([
    db.product.findMany({
      where: {
        breakdown: { isNot: null },
        OR: [{ name: ci }, { brand: ci }, { variant: ci }],
      },
      select: {
        slug: true,
        brand: true,
        name: true,
        variant: true,
        isHeroProduct: true,
        breakdown: { select: { madeInIndiaScoreBp: true } },
      },
      take: 24,
    }),
    db.brandIndex.findMany({
      where: { OR: [{ canonicalName: ci }, { aliases: ci }] },
      select: { canonicalName: true, country: true },
      take: 24,
    }),
  ]);

  const term = q.toLowerCase();
  const score = (p: { name: string; brand: string; isHeroProduct: boolean }) => {
    const n = p.name.toLowerCase();
    const b = p.brand.toLowerCase();
    let s = 0;
    if (n.startsWith(term) || b.startsWith(term)) s += 100;
    else if (n.includes(term) || b.includes(term)) s += 50;
    if (p.isHeroProduct) s += 10;
    s -= n.length * 0.01; // prefer shorter/closer
    return s;
  };

  const rankedProducts = products
    .sort((a, b) => score(b) - score(a))
    .slice(0, 7)
    .map((p) => ({
      slug: p.slug,
      brand: p.brand,
      name: p.name,
      variant: p.variant,
      ivc: p.breakdown ? Math.round(p.breakdown.madeInIndiaScoreBp / 100) : null,
    }));

  const rankedBrands = brands
    .sort((a, b) => {
      const at = a.canonicalName.toLowerCase().startsWith(term) ? 1 : 0;
      const bt = b.canonicalName.toLowerCase().startsWith(term) ? 1 : 0;
      return bt - at;
    })
    .slice(0, 6)
    .map((b) => ({ name: b.canonicalName, country: b.country }));

  return Response.json({ products: rankedProducts, brands: rankedBrands });
}
