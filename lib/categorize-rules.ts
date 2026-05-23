import { db } from "./db";
import { UNCATEGORIZED, type Categorization } from "./categorize";
import type { ResolvedProduct } from "./schemas";

/**
 * Deterministic categorizer — no LLM.
 *
 * Strategy, in priority order:
 *   1. HSN prefix match: if the resolved product carries an HSN code (from
 *      Open Food Facts / GS1), match it against each category's hsnCodes.
 *   2. Keyword overlap: tokenize brand + name + declared ingredients, score
 *      each category by how many of its keywords appear. Highest score wins,
 *      provided it clears a minimum threshold.
 *   3. Otherwise → uncategorized (honest path, no invented breakdown).
 *
 * Confidence: high if HSN matched or strong keyword hit; medium for a single
 * keyword hit; low never returns a category (collapses to uncategorized).
 */
export async function categorizeByRules(
  product: ResolvedProduct,
  hsnHint?: string,
): Promise<Categorization> {
  const categories = await db.category.findMany({
    select: { slug: true, hsnCodes: true, keywords: true },
  });
  if (categories.length === 0) {
    return uncategorized("No category templates exist yet.");
  }

  // 1. HSN prefix match.
  if (hsnHint) {
    for (const c of categories) {
      const codes = JSON.parse(c.hsnCodes) as string[];
      const matched = codes.find(
        (code) =>
          hsnHint.startsWith(code.slice(0, 4)) ||
          code.startsWith(hsnHint.slice(0, 4)),
      );
      if (matched) {
        return {
          categorySlug: c.slug,
          hsnCode: matched,
          confidence: "high",
          reasoning: `HSN ${hsnHint} matches ${c.slug} (code ${matched}).`,
        };
      }
    }
  }

  // 2. Keyword overlap.
  const haystack = [
    product.brand,
    product.name,
    ...(product.declaredIngredients ?? []),
  ]
    .join(" ")
    .toLowerCase();

  let best: { slug: string; score: number; hsn: string } | null = null;
  for (const c of categories) {
    const keywords = JSON.parse(c.keywords) as string[];
    let score = 0;
    for (const kw of keywords) {
      // Word-ish boundary match to avoid "soda" matching inside "soдаium".
      if (haystack.includes(kw)) {
        // Longer keyword phrases are stronger signals.
        score += kw.includes(" ") ? 3 : 1;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      const codes = JSON.parse(c.hsnCodes) as string[];
      best = { slug: c.slug, score, hsn: codes[0] ?? "" };
    }
  }

  if (best) {
    return {
      categorySlug: best.slug,
      hsnCode: best.hsn,
      confidence: best.score >= 3 ? "high" : "medium",
      reasoning: `Keyword match (score ${best.score}) against ${best.slug}.`,
    };
  }

  return uncategorized(
    "No HSN or keyword match against any known category template.",
  );
}

function uncategorized(reasoning: string): Categorization {
  return {
    categorySlug: UNCATEGORIZED,
    hsnCode: "",
    confidence: "low",
    reasoning,
  };
}
