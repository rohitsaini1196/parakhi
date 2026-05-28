import Link from "next/link";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { T } from "@/lib/parakhi-tokens";
import { Wordmark, Eyebrow, MoneyBar } from "@/app/_components/parakhi/atoms";
import { SearchHero } from "@/app/_components/parakhi/SearchHero";
import { GstInfoSchema, ImportSchema } from "@/lib/schemas";
import { z } from "zod";

type SP = Promise<{ q?: string; error?: string }>;

// Curated slugs — diverse, interesting, well-known brands.
const FEATURED_SLUGS = [
  "parle-g-55g",
  "maggi-2-minute-masala-noodles-70g",
  "coca-cola-original-300ml",
  "amul-taaza-toned-milk-500ml",
  "lay-s-magic-masala-52g",
  "surf-excel-easy-wash-detergent-1kg",
  "cadbury-dairy-milk-50g",
  "fortune-sunflower-oil-1l",
  "tata-tea-premium-500g",
];

const getFeatured = unstable_cache(
  async () => {
    const products = await db.product.findMany({
      where: { slug: { in: FEATURED_SLUGS }, breakdown: { isNot: null } },
      include: { breakdown: true, category: true },
    });
    // Keep the curated order
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return FEATURED_SLUGS.flatMap((slug) => {
      const p = bySlug.get(slug);
      if (!p?.breakdown) return [];
      const im = z.array(ImportSchema).parse(JSON.parse(p.breakdown.importsJson));
      const g = GstInfoSchema.parse(JSON.parse(p.breakdown.gstJson));
      const tax = Math.round(g.ratePct);
      const abroad = Math.round(im.reduce((s, i) => s + i.sharePctOfProduct, 0));
      const india = Math.max(0, 100 - tax - abroad);
      const ivc = Math.round(p.breakdown.madeInIndiaScoreBp / 100);
      const mrp = p.mrpInPaise ? Math.round(p.mrpInPaise / 100) : null;
      return [{
        slug: p.slug,
        brand: p.brand,
        name: p.name,
        variant: p.variant,
        category: p.category.displayName,
        categorySlug: p.categorySlug,
        ivc,
        mrp,
        hero: p.isHeroProduct,
        split: { india, tax, abroad },
      }];
    });
  },
  ["home-featured"],
  { revalidate: 3600 },
);

const getStats = unstable_cache(
  async () => {
    const [productCount, categoryCount] = await Promise.all([
      db.product.count({ where: { breakdown: { isNot: null } } }),
      db.category.count(),
    ]);
    return { productCount, categoryCount };
  },
  ["home-stats"],
  { revalidate: 3600 },
);

const getCategories = unstable_cache(
  async () =>
    db.category.findMany({
      select: { slug: true, displayName: true },
      orderBy: { displayName: "asc" },
    }),
  ["home-categories"],
  { revalidate: 3600 },
);

function ivcColor(ivc: number) {
  if (ivc >= 85) return T.india;
  if (ivc >= 65) return T.tax;
  return T.abroad;
}

export default async function Home({ searchParams }: { searchParams: SP }) {
  const { q, error } = await searchParams;
  const [featured, stats, categories] = await Promise.all([
    getFeatured(),
    getStats(),
    getCategories(),
  ]);

  const [heroProduct, ...restProducts] = featured;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header style={{ padding: "24px clamp(20px,5vw,56px)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Wordmark size={24} />
        <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <Link href="/browse" style={{ textDecoration: "none" }}><Eyebrow>browse</Eyebrow></Link>
          <Link href="/about" style={{ textDecoration: "none" }}><Eyebrow>about</Eyebrow></Link>
          <Link href="/sources" style={{ textDecoration: "none" }}><Eyebrow>sources</Eyebrow></Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <div style={{ padding: "clamp(48px,8vw,96px) clamp(20px,5vw,56px) clamp(40px,6vw,72px)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: T.fontDeva, fontSize: 18, color: T.inkFaint, marginBottom: 12, letterSpacing: "0.02em" }}>
          क्या है अंदर?
        </div>
        <h1 style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: "clamp(48px,10vw,88px)", letterSpacing: "-0.03em", lineHeight: 1, margin: "0 0 20px", maxWidth: 800 }}>
          What&apos;s <span style={{ color: T.india }}>actually</span> inside.
        </h1>
        <p style={{ color: T.inkDim, fontSize: "clamp(14px,2vw,17px)", lineHeight: 1.6, maxWidth: 500, margin: "0 0 40px" }}>
          Where does your money go when you buy an Indian product?
          Every rupee traced. Every number sourced.
        </p>

        <SearchHero defaultValue={q} />

        {error && (
          <p style={{ color: T.abroad, fontSize: 13, marginTop: 12 }}>
            Couldn&apos;t process that — {error}
          </p>
        )}

        <Link
          href="/browse"
          style={{ marginTop: 18, fontFamily: T.fontMono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: T.inkFaint, textDecoration: "none" }}
        >
          or browse all {stats.productCount} products →
        </Link>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, padding: "14px clamp(20px,5vw,56px)", display: "flex", gap: "clamp(16px,4vw,48px)", flexWrap: "wrap", justifyContent: "center" }}>
        {[
          `${stats.productCount} products`,
          `${stats.categoryCount} categories`,
          "GST-exact from CBIC",
          "open source",
        ].map((s) => (
          <span key={s} style={{ fontFamily: T.fontMono, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: T.inkFaint }}>
            {s}
          </span>
        ))}
      </div>

      {/* ── Featured breakdowns ── */}
      <div style={{ padding: "clamp(40px,6vw,72px) clamp(20px,5vw,56px)" }}>
        <Eyebrow style={{ color: T.inkFaint, marginBottom: 24 }}>Popular breakdowns</Eyebrow>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12 }}>

          {/* Hero card — spans 5 cols on desktop */}
          {heroProduct && (
            <Link
              href={`/p/${heroProduct.slug}`}
              style={{
                gridColumn: "span 12",
                border: `1px solid ${T.line}`,
                borderRadius: 4,
                background: T.bgRaised,
                textDecoration: "none",
                color: T.ink,
                padding: "clamp(20px,4vw,36px)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                position: "relative",
                overflow: "hidden",
              }}
              className="hero-card"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: T.inkFaint, marginBottom: 8 }}>
                    {heroProduct.category}
                  </div>
                  <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: "clamp(28px,5vw,44px)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
                    {heroProduct.brand}
                  </div>
                  <div style={{ color: T.inkDim, fontSize: 15, marginTop: 4 }}>
                    {heroProduct.name}{heroProduct.variant ? ` · ${heroProduct.variant}` : ""}
                    {heroProduct.mrp && <span style={{ color: T.inkFaint }}> · ₹{heroProduct.mrp}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: "clamp(56px,9vw,88px)", letterSpacing: "-0.04em", lineHeight: 1, color: ivcColor(heroProduct.ivc) }}>
                    {heroProduct.ivc}%
                  </div>
                  <div style={{ fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: T.inkFaint, marginTop: 2 }}>
                    Indian Value Capture
                  </div>
                </div>
              </div>

              <MoneyBar india={heroProduct.split.india} tax={heroProduct.split.tax} abroad={heroProduct.split.abroad} height={10} />

              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                {[
                  { label: "India", val: heroProduct.split.india, color: T.india },
                  { label: "Tax", val: heroProduct.split.tax, color: T.tax },
                  { label: "Abroad", val: heroProduct.split.abroad, color: T.abroad },
                ].map(({ label, val, color }) => (
                  <div key={label}>
                    <div style={{ fontFamily: T.fontMono, fontSize: 9, color, letterSpacing: "0.15em", textTransform: "uppercase" }}>● {label}</div>
                    <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 22, marginTop: 2 }}>{val}%</div>
                    {heroProduct.mrp && (
                      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkFaint }}>
                        ₹{((heroProduct.mrp * val) / 100).toFixed(0)} of ₹{heroProduct.mrp}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Link>
          )}

          {/* Regular cards — 4 cols each (3 per row on desktop) */}
          {restProducts.map((p) => (
            <Link
              key={p.slug}
              href={`/p/${p.slug}`}
              style={{
                gridColumn: "span 6",
                border: `1px solid ${T.line}`,
                borderRadius: 4,
                background: T.bgRaised,
                textDecoration: "none",
                color: T.ink,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
              className="product-card"
            >
              <div style={{ fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: T.inkFaint }}>
                {p.category}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginTop: 2 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: "clamp(18px,3vw,22px)", letterSpacing: "-0.01em", lineHeight: 1.15 }}>
                    {p.brand}
                  </div>
                  <div style={{ color: T.inkDim, fontSize: 12, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}{p.variant ? ` · ${p.variant}` : ""}
                  </div>
                </div>
                <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: "clamp(28px,4vw,36px)", color: ivcColor(p.ivc), flexShrink: 0, lineHeight: 1 }}>
                  {p.ivc}%
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <MoneyBar india={p.split.india} tax={p.split.tax} abroad={p.split.abroad} height={6} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.india }}>▮ {p.split.india}%</span>
                <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.tax }}>▮ {p.split.tax}%</span>
                <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.abroad }}>▮ {p.split.abroad}%</span>
              </div>
            </Link>
          ))}
        </div>

        {/* View all */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link
            href="/browse"
            style={{ fontFamily: T.fontMono, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: T.inkDim, textDecoration: "none", padding: "10px 20px", border: `1px solid ${T.line}`, borderRadius: 2 }}
          >
            View all {stats.productCount} products →
          </Link>
        </div>
      </div>

      {/* ── Category strip ── */}
      <div style={{ borderTop: `1px solid ${T.line}`, padding: "clamp(32px,5vw,56px) clamp(20px,5vw,56px)" }}>
        <Eyebrow style={{ color: T.inkFaint, marginBottom: 20 }}>Explore by category</Eyebrow>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/browse?category=${c.slug}`}
              style={{
                fontFamily: T.fontMono,
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "8px 14px",
                border: `1px solid ${T.line}`,
                borderRadius: 2,
                color: T.inkDim,
                textDecoration: "none",
                background: "transparent",
              }}
            >
              {c.displayName}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ padding: "20px clamp(20px,5vw,56px)", borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Wordmark size={18} />
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/browse" style={{ textDecoration: "none" }}><Eyebrow>Browse</Eyebrow></Link>
          <Link href="/about" style={{ textDecoration: "none" }}><Eyebrow>About</Eyebrow></Link>
          <a href="https://github.com/rohitsaini1196/parakhi" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}><Eyebrow>GitHub</Eyebrow></a>
        </div>
      </footer>

    </div>
  );
}
