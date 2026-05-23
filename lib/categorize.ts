import { z } from "zod";
import { db } from "@/lib/db";
import { callJson } from "@/lib/llm";
import { ConfidenceSchema, type ResolvedProduct } from "@/lib/schemas";

/**
 * Map a `ResolvedProduct` to one of our known category slugs.
 *
 * This is the one place a small LLM is still used (`gpt-4o-mini`, ~$0.0001/
 * call). Deterministic alternatives — keyword matching, embedding similarity,
 * a hand-written `brand → category` dictionary — all degrade on novel
 * products and Indian brand spellings. The classification is also cheap to
 * verify by humans via the admin feedback queue.
 *
 * Constraints we enforce in code (not trusted from the LLM):
 *   - return slug must exist in the DB, else we collapse to "uncategorized";
 *   - if confidence is low and slug is not uncategorized, we still trust the
 *     pick but caller can downgrade.
 */

export const CategorizationSchema = z.object({
  categorySlug: z.string(),
  hsnCode: z.string(),
  confidence: ConfidenceSchema,
  reasoning: z.string(),
});
export type Categorization = z.infer<typeof CategorizationSchema>;

export const UNCATEGORIZED = "uncategorized" as const;

function llmEnabled(): boolean {
  const p = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();
  return p !== "none";
}

/**
 * Categorize a product. Deterministic rules first (HSN + keyword); only fall
 * back to the LLM when rules return uncategorized AND a provider is set. This
 * keeps cost near-zero and makes the OSS fork fully LLM-free.
 */
export async function categorize(
  product: ResolvedProduct,
  hsnHint?: string,
): Promise<Categorization> {
  // Lazy import avoids a cycle (categorize-rules imports types from here).
  const { categorizeByRules } = await import("./categorize-rules");
  const ruled = await categorizeByRules(product, hsnHint);
  if (ruled.categorySlug !== UNCATEGORIZED) return ruled;
  if (!llmEnabled()) return ruled;
  return categorizeWithLlm(product);
}

async function categorizeWithLlm(
  product: ResolvedProduct,
): Promise<Categorization> {
  const categories = await db.category.findMany({
    select: { slug: true, displayName: true, hsnCodes: true },
  });
  if (categories.length === 0) {
    return {
      categorySlug: UNCATEGORIZED,
      hsnCode: "",
      confidence: "low",
      reasoning: "No category templates exist yet.",
    };
  }

  const catalogue = categories
    .map((c) => {
      const hsn = (JSON.parse(c.hsnCodes) as string[]).join(", ");
      return `- ${c.slug} — ${c.displayName} (HSN: ${hsn})`;
    })
    .join("\n");

  const result = await callJson({
    purpose: "categorize",
    tier: "fast",
    schema: CategorizationSchema,
    schemaName: "categorization",
    system: [
      "You classify Indian consumer products into one of our known category templates.",
      `Allowed category slugs (return EXACTLY one of these, or "${UNCATEGORIZED}"):`,
      catalogue,
      `- ${UNCATEGORIZED} — none of the above fit`,
      "",
      "Return the most-specific HSN code from the matched category's list. If you choose",
      `"${UNCATEGORIZED}", set hsnCode to "" and confidence to "low".`,
      "",
      "Confidence: high = clearly fits, medium = probable, low = guess.",
    ].join("\n"),
    user: JSON.stringify({
      brand: product.brand,
      name: product.name,
      variant: product.variant,
      declaredIngredients: product.declaredIngredients,
    }),
  });

  const known = new Set(categories.map((c) => c.slug));
  if (
    result.categorySlug !== UNCATEGORIZED &&
    !known.has(result.categorySlug)
  ) {
    // LLM made up a slug — treat as uncategorized.
    return {
      categorySlug: UNCATEGORIZED,
      hsnCode: "",
      confidence: "low",
      reasoning: `LLM returned unknown slug "${result.categorySlug}"`,
    };
  }
  return result;
}
