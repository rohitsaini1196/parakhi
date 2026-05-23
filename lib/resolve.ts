import { z } from "zod";
import { callJson } from "@/lib/llm";
import { ResolvedProductSchema, type ResolvedProduct } from "@/lib/schemas";
import { resolveByRules } from "@/lib/resolve-rules";

/**
 * Resolve a raw user query into a `ResolvedProduct`. Three input shapes:
 *
 *   1. Barcode (EAN-13)  → Open Food Facts API
 *   2. URL               → one-shot fetch, parse Open Graph
 *   3. Free text         → BrandIndex fuzzy match (deterministic)
 *
 * Provider gating via LLM_PROVIDER env:
 *   - "none"   → deterministic only (BrandIndex). Throws if no brand match.
 *   - "openai"/"ollama" → deterministic first, LLM fallback on 0-match.
 *
 * Every branch returns the same shape so the rest of the pipeline is uniform.
 */

const BARCODE_RE = /^\d{8,14}$/;
const URL_RE = /^https?:\/\//i;

export type RawQuery = { value: string };

function llmEnabled(): boolean {
  const p = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();
  return p !== "none";
}

export async function resolveQuery(input: RawQuery): Promise<ResolvedProduct> {
  const q = input.value.trim();
  if (!q) throw new Error("Empty query");

  // Deterministic path first — it covers barcode + URL + known brands and
  // costs nothing. Only fall back to the LLM for free-text misses, and only
  // when a provider is configured.
  try {
    return await resolveByRules(input);
  } catch (rulesErr) {
    if (!llmEnabled()) throw rulesErr;
    // LLM fallback only for free text (barcode/URL failures are real errors).
    if (BARCODE_RE.test(q) || URL_RE.test(q)) throw rulesErr;
    return resolveText(q);
  }
}

// ── Free text → LLM normalize (fallback only) ────────────────────────────────

const NormalizedSchema = z.object({
  brand: z.string(),
  name: z.string(),
  variant: z.string().nullable(),
});

async function resolveText(query: string): Promise<ResolvedProduct> {
  return normalizeWithLlm(query, { sourceUrls: [] });
}

async function normalizeWithLlm(
  raw: string,
  extras: { sourceUrls: string[]; brandHint?: string },
): Promise<ResolvedProduct> {
  const result = await callJson({
    purpose: "resolve",
    tier: "fast",
    schema: NormalizedSchema,
    schemaName: "normalized_product",
    system:
      "You normalize Indian consumer product queries. Return strict JSON: brand, name, variant. " +
      "If unclear, set the field to null (do not invent). Strip retailer noise like '— Buy online at Amazon'. " +
      "Variant is the size/pack (e.g. '1kg', '55g pack', '500ml'); null if not stated.",
    user: extras.brandHint
      ? `Brand hint: ${extras.brandHint}\nQuery: ${raw}`
      : `Query: ${raw}`,
  });

  if (!result.brand || !result.name) {
    throw new Error("Couldn't identify product — try a more specific name");
  }

  return ResolvedProductSchema.parse({
    brand: result.brand,
    name: result.name,
    variant: result.variant ?? undefined,
    sourceUrls: extras.sourceUrls,
  });
}
