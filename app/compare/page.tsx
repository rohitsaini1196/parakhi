import Link from "next/link";
import type { ReactNode } from "react";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { mapToDesignProduct } from "@/lib/product-design";
import { T, type DesignProduct } from "@/lib/parakhi-tokens";
import { Wordmark, Eyebrow } from "@/app/_components/parakhi/atoms";
import { CompareTable } from "@/app/_components/parakhi/CompareTable";
import { ComparePicker, type Selected } from "@/app/_components/parakhi/ComparePicker";

export const revalidate = 3600;

type SP = Promise<{ a?: string; b?: string }>;

// IVC gaps this small sit inside our margin — call it a tie.
const TIE_THRESHOLD = 3;

const loadPair = unstable_cache(
  async (slugs: string[]) =>
    db.product.findMany({
      where: { slug: { in: slugs }, breakdown: { isNot: null } },
      include: { breakdown: true, category: true },
    }),
  ["compare-pair"],
  { revalidate: 3600 },
);

async function resolveProducts(a?: string, b?: string): Promise<DesignProduct[]> {
  const requested = [a, b].filter((s): s is string => !!s);
  // De-dupe while preserving order.
  const slugs = [...new Set(requested)].slice(0, 2);
  if (slugs.length === 0) return [];
  const rows = await loadPair(slugs);
  // findMany doesn't preserve `in` order — reorder to match the URL, drop misses.
  return slugs
    .map((slug) => rows.find((r) => r.slug === slug))
    .filter((r): r is NonNullable<typeof r> => !!r)
    .map(mapToDesignProduct);
}

export default async function ComparePage({ searchParams }: { searchParams: SP }) {
  const { a, b } = await searchParams;
  const products = await resolveProducts(a, b);
  const selected: Selected[] = products.map((p) => ({ slug: p.slug, title: p.brand }));

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink }}>
      <header
        style={{
          padding: "26px clamp(20px,5vw,48px) 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Wordmark size={22} />
        </Link>
        <div style={{ display: "flex", gap: 18 }}>
          <Link href="/browse" style={{ textDecoration: "none" }}>
            <Eyebrow style={{ color: T.inkFaint }}>browse</Eyebrow>
          </Link>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Eyebrow style={{ color: T.inkFaint }}>← search</Eyebrow>
          </Link>
        </div>
      </header>

      <div style={{ padding: "40px clamp(20px,5vw,48px) 90px" }}>
        <h1
          style={{
            fontFamily: T.fontDisplay,
            fontStyle: "italic",
            fontSize: "clamp(32px,6vw,52px)",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            margin: "0 0 8px",
          }}
        >
          Compare.
        </h1>
        <p style={{ color: T.inkDim, fontSize: 13, marginBottom: 28, maxWidth: 540 }}>
          Two products, side by side. Which keeps more of your money in India?
        </p>

        <div style={{ marginBottom: 36 }}>
          <ComparePicker selected={selected} />
        </div>

        {products.length === 2 && <Verdict a={products[0]!} b={products[1]!} />}

        {products.length === 2 && products[0]!.category !== products[1]!.category && (
          <p style={{ color: T.tax, fontSize: 13, marginBottom: 20, maxWidth: 600, lineHeight: 1.5 }}>
            Different categories — the top-line numbers compare fine, but cost structures
            differ by product type, so read the split as context, not a like-for-like.
          </p>
        )}

        {products.length >= 1 ? (
          <CompareTable products={products} />
        ) : (
          <p style={{ color: T.inkFaint, fontSize: 14 }}>Add two products above to compare them.</p>
        )}

        {products.length === 1 && (
          <p style={{ color: T.inkFaint, fontSize: 14, marginTop: 20 }}>Add one more to compare.</p>
        )}
      </div>
    </div>
  );
}

function Verdict({ a, b }: { a: DesignProduct; b: DesignProduct }) {
  const [hi, lo] = a.ivc >= b.ivc ? [a, b] : [b, a];
  const gap = Math.abs(a.ivc - b.ivc);
  const tied = gap <= TIE_THRESHOLD;

  let line: ReactNode;
  if (tied) {
    line = (
      <>
        Effectively tied — {a.brand} and {b.brand} are within {gap} point{gap === 1 ? "" : "s"} ({a.ivc}% vs {b.ivc}%).
        That gap is inside our margin; treat them as equally Indian.
      </>
    );
  } else {
    const abroadGap = lo.split.abroad - hi.split.abroad;
    const reason =
      abroadGap >= 2
        ? ` ${lo.brand} sends ${lo.split.abroad}% abroad vs ${hi.split.abroad}%.`
        : "";
    const directional =
      hi.isDraft || hi.sourcedShare < 50
        ? ` But ${hi.brand}'s number is largely modelled, so read it as directional.`
        : "";
    line = (
      <>
        <strong style={{ color: T.india, fontWeight: 400 }}>{hi.brand} keeps more in India</strong> — {hi.ivc}% vs {lo.ivc}% ({gap}-point lead).{reason}{directional}
      </>
    );
  }

  return (
    <div
      style={{
        border: `1px solid ${T.line}`,
        borderRadius: 4,
        background: T.bgRaised,
        padding: "20px 24px",
        marginBottom: 28,
        maxWidth: 720,
      }}
    >
      <Eyebrow style={{ marginBottom: 8 }}>Which is more Indian?</Eyebrow>
      <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: "clamp(20px,3vw,26px)", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
        {line}
      </div>
    </div>
  );
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { a, b } = await searchParams;
  const products = await resolveProducts(a, b);
  if (products.length === 2) {
    const title = `${products[0]!.brand} vs ${products[1]!.brand} — Parakhi`;
    return { title, description: `Which keeps more of your money in India? ${products[0]!.brand} vs ${products[1]!.brand}, sliced.` };
  }
  return { title: "Compare products — Parakhi", description: "Compare two Indian products side by side." };
}
