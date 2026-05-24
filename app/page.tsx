import Link from "next/link";
import { db } from "@/lib/db";
import { T } from "@/lib/parakhi-tokens";
import { Wordmark, Eyebrow, MoneyBar } from "@/app/_components/parakhi/atoms";
import { SearchHero } from "@/app/_components/parakhi/SearchHero";
import { GstInfoSchema, ImportSchema } from "@/lib/schemas";
import { z } from "zod";

type SP = Promise<{ q?: string; error?: string }>;

export default async function Home({ searchParams }: { searchParams: SP }) {
  const { q, error } = await searchParams;
  const recent = await db.product.findMany({
    where: { breakdown: { isNot: null } },
    include: { breakdown: true, category: true },
    orderBy: [{ isHeroProduct: "desc" }, { createdAt: "desc" }],
    take: 9,
  });

  const cards = recent.map((p) => {
    const im = z.array(ImportSchema).parse(JSON.parse(p.breakdown!.importsJson));
    const g = GstInfoSchema.parse(JSON.parse(p.breakdown!.gstJson));
    const tax = Math.round(g.ratePct);
    const ab = Math.round(im.reduce((s, i) => s + i.sharePctOfProduct, 0));
    return {
      slug: p.slug,
      brand: p.name,
      category: p.category.displayName,
      ivc: Math.round(p.breakdown!.madeInIndiaScoreBp / 100),
      split: { india: Math.max(0, 100 - tax - ab), tax, abroad: ab },
    };
  });

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "26px clamp(20px,5vw,48px) 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Wordmark size={26} />
        <div style={{ display: "flex", gap: 24 }}>
          <Link href="/about" style={{ textDecoration: "none" }}><Eyebrow>about</Eyebrow></Link>
          <Link href="/sources" style={{ textDecoration: "none" }}><Eyebrow>sources</Eyebrow></Link>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px clamp(20px,5vw,48px)", textAlign: "center" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: T.fontDeva, fontSize: 22, color: T.inkDim, marginBottom: 8 }}>
            क्या है अंदर?
          </div>
          <h1 style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: "clamp(44px,9vw,72px)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0, maxWidth: 900 }}>
            What&apos;s <span style={{ color: T.india }}>actually</span> inside.
          </h1>
          <p style={{ color: T.inkDim, fontSize: 16, marginTop: 18, maxWidth: 560, lineHeight: 1.5, marginInline: "auto" }}>
            Search any Indian product. See where your money goes — and how much
            stays in India. Every number sourced. No guessing.
          </p>
        </div>

        <SearchHero defaultValue={q} />
        {error && (
          <p style={{ color: T.abroad, fontSize: 13, marginTop: 14 }}>Couldn&apos;t process that — {error}</p>
        )}

        {cards.length > 0 && (
          <div style={{ width: "100%", maxWidth: 920, marginTop: 64 }}>
            <Eyebrow style={{ color: T.inkFaint, marginBottom: 16 }}>recently analysed · jump in</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 14 }}>
              {cards.map((p) => (
                <Link
                  key={p.slug}
                  href={`/p/${p.slug}`}
                  style={{ border: `1px solid ${T.line}`, padding: "18px 20px", borderRadius: 3, background: T.bgRaised, textDecoration: "none", color: T.ink, textAlign: "left" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 19 }}>{p.brand}</span>
                    <span style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 24, color: p.ivc >= 85 ? T.india : p.ivc >= 70 ? T.tax : T.abroad }}>{p.ivc}%</span>
                  </div>
                  <div style={{ color: T.inkDim, fontSize: 11, marginTop: 2 }}>{p.category}</div>
                  <div style={{ marginTop: 12 }}>
                    <MoneyBar india={p.split.india} tax={p.split.tax} abroad={p.split.abroad} height={5} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer style={{ padding: "24px clamp(20px,5vw,48px)", borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "center", gap: 18 }}>
        <Link href="/about" style={{ textDecoration: "none" }}><Eyebrow>About</Eyebrow></Link>
        <a href="https://github.com/rohitsaini1196/parakhi" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}><Eyebrow>Open source</Eyebrow></a>
      </footer>
    </div>
  );
}
