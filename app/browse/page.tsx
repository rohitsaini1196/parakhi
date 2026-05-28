import Link from "next/link";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { T } from "@/lib/parakhi-tokens";
import { Wordmark, Eyebrow, MoneyBar } from "@/app/_components/parakhi/atoms";
import { GstInfoSchema, ImportSchema } from "@/lib/schemas";
import { z } from "zod";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse products — Parakhi",
  description: "Explore 250+ Indian products by category. See where your money goes.",
};

export const revalidate = 3600;

type SP = Promise<{ category?: string }>;

const loadAll = unstable_cache(
  async () => {
    const products = await db.product.findMany({
      where: { breakdown: { isNot: null } },
      include: { breakdown: true, category: true },
      orderBy: [{ isHeroProduct: "desc" }, { name: "asc" }],
    });
    return products.map((p) => {
      const im = z.array(ImportSchema).parse(JSON.parse(p.breakdown!.importsJson));
      const g = GstInfoSchema.parse(JSON.parse(p.breakdown!.gstJson));
      const tax = Math.round(g.ratePct);
      const abroad = Math.round(im.reduce((s, i) => s + i.sharePctOfProduct, 0));
      return {
        slug: p.slug,
        brand: p.brand,
        name: p.name,
        variant: p.variant,
        category: p.category.displayName,
        categorySlug: p.categorySlug,
        ivc: Math.round(p.breakdown!.madeInIndiaScoreBp / 100),
        hero: p.isHeroProduct,
        split: { india: Math.max(0, 100 - tax - abroad), tax, abroad },
      };
    });
  },
  ["browse-all"],
  { revalidate: 3600 },
);

export default async function BrowsePage({ searchParams }: { searchParams: SP }) {
  const { category: activeSlug } = await searchParams;
  const all = await loadAll();

  // Build category list from actual products
  const categoryMap = new Map<string, string>();
  for (const p of all) categoryMap.set(p.categorySlug, p.category);
  const categories = [
    { slug: "", label: "All" },
    ...Array.from(categoryMap.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([slug, label]) => ({ slug, label })),
  ];

  const filtered = activeSlug ? all.filter((p) => p.categorySlug === activeSlug) : all;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink }}>
      <header style={{ padding: "26px clamp(20px,5vw,48px) 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Wordmark size={22} />
        </Link>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Eyebrow style={{ color: T.inkFaint }}>← search</Eyebrow>
        </Link>
      </header>

      <div style={{ padding: "40px clamp(20px,5vw,48px)" }}>
        <h1 style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: "clamp(32px,6vw,52px)", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 8 }}>
          Browse products.
        </h1>
        <p style={{ color: T.inkDim, fontSize: 14, marginBottom: 32 }}>
          {all.length} products analysed across {categoryMap.size} categories.
        </p>

        {/* Category tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
          {categories.map((c) => {
            const active = (activeSlug ?? "") === c.slug;
            return (
              <Link
                key={c.slug}
                href={c.slug ? `/browse?category=${c.slug}` : "/browse"}
                style={{
                  fontFamily: T.fontMono,
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "6px 12px",
                  borderRadius: 2,
                  border: `1px solid ${active ? T.ink : T.line}`,
                  background: active ? T.ink : "transparent",
                  color: active ? T.bg : T.inkDim,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* Product grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`/p/${p.slug}`}
              style={{
                border: `1px solid ${T.line}`,
                padding: "16px 18px",
                borderRadius: 3,
                background: T.bgRaised,
                textDecoration: "none",
                color: T.ink,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span
                  style={{
                    fontFamily: T.fontDisplay,
                    fontStyle: "italic",
                    fontSize: 17,
                    lineHeight: 1.2,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.brand}
                </span>
                <span
                  style={{
                    fontFamily: T.fontDisplay,
                    fontStyle: "italic",
                    fontSize: 22,
                    flexShrink: 0,
                    color: p.ivc >= 85 ? T.india : p.ivc >= 65 ? T.tax : T.abroad,
                  }}
                >
                  {p.ivc}%
                </span>
              </div>
              <div style={{ color: T.inkDim, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.name}{p.variant ? ` · ${p.variant}` : ""}
              </div>
              <div style={{ marginTop: 10 }}>
                <MoneyBar india={p.split.india} tax={p.split.tax} abroad={p.split.abroad} height={4} />
              </div>
              <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.inkFaint, letterSpacing: "0.1em", marginTop: 4 }}>
                {p.category.toUpperCase()}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
