/**
 * Shared DB-row → DesignProduct mapper.
 *
 * Pure: no DB access, no caching. Callers load the Prisma row (product +
 * breakdown + category) and pass it in. Both the product page and the compare
 * page map through here so the numbers (IVC, split, sourcedShare, origin
 * tagging) can never drift between views.
 */
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  CategoryTemplateSchema,
  CostComponentSchema,
  GstInfoSchema,
  ImportSchema,
} from "@/lib/schemas";
import {
  verdictFor,
  type DesignProduct,
  type DesignComponent,
  type DesignImport,
  type DesignSource,
} from "@/lib/parakhi-tokens";

export type ProductWithBreakdownAndCategory = Prisma.ProductGetPayload<{
  include: { breakdown: true; category: true };
}>;

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

/**
 * Map a loaded product row to the shape the UI renders against.
 * Throws if the breakdown is missing — callers must guard / filter first.
 */
export function mapToDesignProduct(product: ProductWithBreakdownAndCategory): DesignProduct {
  if (!product.breakdown) {
    throw new Error(`mapToDesignProduct: product ${product.slug} has no breakdown`);
  }

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

  // Honesty: how much of the breakdown rests on hard data (Tier 1-2) vs
  // category-typical estimate (Tier 3-4).
  const totalShare = components.reduce((s, c) => s + c.sharePct, 0) || 1;
  const sourcedShare = Math.round(
    (components.filter((c) => c.sourceTier <= 2).reduce((s, c) => s + c.sharePct, 0) / totalShare) * 100,
  );
  const isDraft = product.breakdown.templateVersion.includes("draft");

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
    confirmedOnLabel: c.confirmedOnLabel,
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

  return {
    slug: product.slug,
    brand: productTitle(product.brand, product.name),
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
    sourcedShare,
    isDraft,
    declaredIngredients: product.declaredIngredients
      ? (JSON.parse(product.declaredIngredients) as string[])
      : undefined,
    longform: product.isHeroProduct && product.heroMarkdown ? parseLongform(product.heroMarkdown) : undefined,
    shrinkflation: SHRINKFLATION[product.slug],
  };
}

// ── helpers ──────────────────────────────────────────────────────────

/** Brand-forward, deduped product title. "Maaza" + "Mango Drink" →
 *  "Maaza Mango Drink"; "Parle Products" + "Parle-G …" → "Parle-G …"
 *  (avoids repeating the brand when the name already carries it). */
function productTitle(brand: string, name: string): string {
  const nameLower = name.toLowerCase();
  const brandWords = brand.toLowerCase().split(/\s+/);
  const nameCarriesBrand = brandWords.some((w) => w.length > 2 && nameLower.includes(w));
  return nameCarriesBrand ? name : `${brand} ${name}`;
}

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
