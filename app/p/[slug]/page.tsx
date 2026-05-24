import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import {
  CategoryTemplateSchema,
  CostComponentSchema,
  GstInfoSchema,
  ImportSchema,
} from "@/lib/schemas";
import { z } from "zod";
import {
  verdictFor,
  type DesignProduct,
  type DesignComponent,
  type DesignImport,
  type DesignSource,
} from "@/lib/parakhi-tokens";
import { Fold1, Fold2, Fold3, Fold4, HeroStory, NextProducts } from "@/app/_components/parakhi/folds";

type Params = Promise<{ slug: string }>;

// ISR: cache each product page; breakdowns change only on recompute (nightly).
// First hit renders + caches; subsequent hits skip the DB entirely.
export const revalidate = 3600;

// Hand-curated shrinkflation series for hero products (not in the DB).
const SHRINKFLATION: Record<string, { year: number; weight: number; price: number }[]> = {
  "parle-g-55g": [
    { year: 1994, weight: 100, price: 4 },
    { year: 2003, weight: 92, price: 4 },
    { year: 2013, weight: 88, price: 4 },
    { year: 2021, weight: 65, price: 5 },
    { year: 2025, weight: 55, price: 5 },
  ],
};

// Cache the per-slug DB read for an hour — Neon round-trips (incl. free-tier
// cold-start) are the dominant cost; caching them is what makes warm loads fast.
const loadProduct = unstable_cache(
  async (slug: string) =>
    db.product.findUnique({
      where: { slug },
      include: { breakdown: true, category: true },
    }),
  ["product-by-slug"],
  { revalidate: 3600 },
);

const loadOthers = unstable_cache(
  async (slug: string) =>
    db.product.findMany({
      where: { slug: { not: slug }, breakdown: { isNot: null } },
      include: { breakdown: true, category: true },
      orderBy: { isHeroProduct: "desc" },
      take: 6,
    }),
  ["product-others"],
  { revalidate: 3600 },
);

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product || !product.breakdown) return notFound();

  const components = z.array(CostComponentSchema).parse(JSON.parse(product.breakdown.componentsJson));
  const imports = z.array(ImportSchema).parse(JSON.parse(product.breakdown.importsJson));
  const gst = GstInfoSchema.parse(JSON.parse(product.breakdown.gstJson));
  const template = CategoryTemplateSchema.parse(JSON.parse(product.category.templateJson));

  const ivc = Math.round(product.breakdown.madeInIndiaScoreBp / 100);
  const composition = Math.round(product.breakdown.compositionMiiBp / 100);
  const mrp = product.mrpInPaise != null ? Math.round(product.mrpInPaise / 100) : null;

  // Money split: tax = GST rate, abroad = sum of imports, india = remainder.
  const taxPct = Math.round(gst.ratePct);
  const abroadPct = Math.round(imports.reduce((s, i) => s + i.sharePctOfProduct, 0));
  const indiaPct = Math.max(0, 100 - taxPct - abroadPct);

  // Map components, tagging origin (TAX / foreign country / IN).
  const importNames = new Map<string, string>(); // lowercased ingredient -> top foreign code
  for (const imp of imports) {
    const foreign = imp.likelyCountries.find((c) => c.code !== "IN" && c.code !== "MIXED");
    if (foreign) importNames.set(imp.ingredient.toLowerCase(), foreign.code);
  }
  function originOf(label: string): string {
    if (label.toLowerCase().startsWith("gst")) return "TAX";
    for (const [name, code] of importNames) {
      if (label.toLowerCase().includes(name) || name.includes(label.toLowerCase())) return code;
    }
    return "IN";
  }

  const designComponents: DesignComponent[] = components.map((c) => ({
    name: c.label,
    pct: Math.round(c.sharePct),
    rupees: c.rupeeAmount != null ? c.rupeeAmount / 100 : null,
    origin: originOf(c.label),
    confidence: c.confidence,
    tier: c.sourceTier,
    note: c.explanation,
  }));

  const designImports: DesignImport[] = imports.map((imp) => ({
    input: imp.ingredient,
    pct: Math.round(imp.sharePctOfProduct),
    countries: imp.likelyCountries.map((co) => ({
      code: co.code,
      name: co.name,
      prob: co.probabilityPct,
    })),
    note: imp.notes ?? undefined,
  }));

  const designSources: DesignSource[] = template.sources.map((s) => ({
    tier: sourceTier(s.url, s.relevance),
    title: s.title,
    ref: hostOf(s.url),
    url: s.url,
  }));

  const design: DesignProduct = {
    slug: product.slug,
    brand: product.name,
    variant: [product.category.displayName, product.variant].filter(Boolean).join(" · "),
    category: product.category.displayName,
    mrp,
    ivc,
    verdict: verdictFor(ivc),
    composition,
    split: { india: indiaPct, tax: taxPct, abroad: abroadPct },
    components: designComponents,
    imports: designImports,
    sources: designSources,
    hero: product.isHeroProduct,
    asOf: gst.asOfDate?.slice(0, 7) ?? "2026",
    longform: product.isHeroProduct && product.heroMarkdown ? parseLongform(product.heroMarkdown) : undefined,
    shrinkflation: SHRINKFLATION[product.slug],
  };

  // "Next products" — a few others to jump to.
  const others = await loadOthers(slug);
  const nextItems = others.map((p) => {
    const c = z.array(CostComponentSchema).parse(JSON.parse(p.breakdown!.componentsJson));
    const im = z.array(ImportSchema).parse(JSON.parse(p.breakdown!.importsJson));
    const g = GstInfoSchema.parse(JSON.parse(p.breakdown!.gstJson));
    const tax = Math.round(g.ratePct);
    const ab = Math.round(im.reduce((s, i) => s + i.sharePctOfProduct, 0));
    void c;
    return {
      slug: p.slug,
      brand: p.name,
      category: p.category.displayName,
      ivc: Math.round(p.breakdown!.madeInIndiaScoreBp / 100),
      split: { india: Math.max(0, 100 - tax - ab), tax, abroad: ab },
    };
  });

  return (
    <main style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <Fold1 product={design} />
      <Fold2 product={design} />
      <Fold3 product={design} />
      <Fold4 product={design} />
      {design.longform && <HeroStory product={design} />}
      <NextProducts items={nextItems} />
    </main>
  );
}

// ── helpers ──────────────────────────────────────────────────────────

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function sourceTier(url: string, relevance: string): number {
  const u = (url + " " + relevance).toLowerCase();
  if (/cbic|dgft|data\.gov|nddb|gov\.in|teaboard|apeda/.test(u)) return 1;
  if (/tofler|mca|annual report|filing|investor|results/.test(u)) return 2;
  if (/mordor|nielsen|cii|business-standard|tradeint/.test(u)) return 3;
  return 3;
}

/** Light markdown → {kicker, body[]}. First heading is the kicker; the next
 *  paragraphs (until a table/heading) become the body. */
function parseLongform(md: string): { kicker: string; body: string[] } {
  const lines = md.split("\n");
  let kicker = "";
  const body: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) {
      const text = line.replace(/^#+\s*/, "");
      if (!kicker) kicker = text;
      continue;
    }
    if (line.startsWith("|") || line.startsWith("-") || line.startsWith("*")) continue;
    if (body.length < 3) body.push(line);
  }
  return { kicker: kicker || "The story.", body: body.length ? body : ["—"] };
}
