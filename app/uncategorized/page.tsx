import Link from "next/link";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { T } from "@/lib/parakhi-tokens";
import { Wordmark, Eyebrow, MoneyBar } from "@/app/_components/parakhi/atoms";
import { GstInfoSchema, ImportSchema } from "@/lib/schemas";
import { z } from "zod";

type SP = Promise<{ brand?: string; name?: string; variant?: string }>;

const getPopular = unstable_cache(
  async () => {
    const products = await db.product.findMany({
      where: { breakdown: { isNot: null } },
      include: { breakdown: true, category: true },
      orderBy: [{ isHeroProduct: "desc" }, { createdAt: "desc" }],
      take: 8,
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
        ivc: Math.round(p.breakdown!.madeInIndiaScoreBp / 100),
        split: { india: Math.max(0, 100 - tax - abroad), tax, abroad },
      };
    });
  },
  ["uncategorized-popular"],
  { revalidate: 3600 },
);

const getCategories = unstable_cache(
  async () => db.category.findMany({ select: { slug: true, displayName: true }, orderBy: { displayName: "asc" } }),
  ["uncategorized-cats"],
  { revalidate: 3600 },
);

export default async function UncategorizedPage({ searchParams }: { searchParams: SP }) {
  const { brand, name, variant } = await searchParams;
  const label = [brand, name, variant].filter(Boolean).join(" ");
  const [popular, categories] = await Promise.all([getPopular(), getCategories()]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink }}>
      <header style={{ padding: "24px clamp(20px,5vw,56px)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none" }}><Wordmark size={22} /></Link>
        <Link href="/" style={{ textDecoration: "none" }}><Eyebrow style={{ color: T.inkFaint }}>← search</Eyebrow></Link>
      </header>

      <div style={{ padding: "clamp(32px,5vw,64px) clamp(20px,5vw,56px)" }}>
        {/* Honest message */}
        <div style={{ maxWidth: 560, marginBottom: 48 }}>
          <Eyebrow style={{ color: T.abroad, marginBottom: 12 }}>not analysed yet</Eyebrow>
          <h1 style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: "clamp(28px,5vw,44px)", letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 16px" }}>
            {label ? `"${label}"` : "This product"} isn&apos;t in our database yet.
          </h1>
          <p style={{ color: T.inkDim, fontSize: 15, lineHeight: 1.6 }}>
            We only show breakdowns where we have a curated category template — no guessing.
            We&apos;re working through categories; this one isn&apos;t covered yet.
          </p>
          <form action="/api/vote" method="post" style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input type="hidden" name="target" value={`product:${label || "unknown"}`} />
            <button
              type="submit"
              style={{ fontFamily: T.fontMono, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", padding: "8px 16px", border: `1px solid ${T.line}`, borderRadius: 2, background: T.ink, color: T.bg, cursor: "pointer" }}
            >
              vote to add
            </button>
            <Link
              href="/"
              style={{ fontFamily: T.fontMono, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", padding: "8px 16px", border: `1px solid ${T.line}`, borderRadius: 2, color: T.inkDim, textDecoration: "none" }}
            >
              try another search
            </Link>
          </form>
        </div>

        {/* Category strip */}
        <div style={{ marginBottom: 48 }}>
          <Eyebrow style={{ color: T.inkFaint, marginBottom: 16 }}>categories we cover</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/browse?category=${c.slug}`}
                style={{ fontFamily: T.fontMono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 12px", border: `1px solid ${T.line}`, borderRadius: 2, color: T.inkDim, textDecoration: "none" }}
              >
                {c.displayName}
              </Link>
            ))}
          </div>
        </div>

        {/* Popular products */}
        <div>
          <Eyebrow style={{ color: T.inkFaint, marginBottom: 16 }}>popular breakdowns</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px,1fr))", gap: 10 }}>
            {popular.map((p) => (
              <Link
                key={p.slug}
                href={`/p/${p.slug}`}
                style={{ border: `1px solid ${T.line}`, borderRadius: 3, padding: "14px 16px", background: T.bgRaised, textDecoration: "none", color: T.ink }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 17, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.brand}</span>
                  <span style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 20, flexShrink: 0, color: p.ivc >= 85 ? T.india : p.ivc >= 65 ? T.tax : T.abroad }}>{p.ivc}%</span>
                </div>
                <div style={{ color: T.inkDim, fontSize: 11, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ marginTop: 10 }}><MoneyBar india={p.split.india} tax={p.split.tax} abroad={p.split.abroad} height={4} /></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
