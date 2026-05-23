import { db } from "./db";
import { ResolvedProductSchema, type ResolvedProduct } from "./schemas";

/**
 * Deterministic resolver — no LLM.
 *
 *   1. Barcode  → Open Food Facts (same as the LLM path; OFF needs no model)
 *   2. URL      → Open Graph extraction + regex title cleanup
 *   3. Free text→ BrandIndex fuzzy match + variant regex
 *
 * On a text query we never invent a brand. If no BrandIndex entry clears the
 * similarity threshold we throw a "not found" error; the caller surfaces a
 * "pick the brand" form. Honest failure beats a hallucinated match.
 */

const BARCODE_RE = /^\d{8,14}$/;
const URL_RE = /^https?:\/\//i;
const VARIANT_RE =
  /(\d+(?:\.\d+)?\s?(?:kg|g|gm|grams?|ml|l|litre?s?|pcs?|pack|x\d+))/i;

export type RawQuery = { value: string };

export async function resolveByRules(
  input: RawQuery,
): Promise<ResolvedProduct> {
  const q = input.value.trim();
  if (!q) throw new Error("Empty query");

  if (BARCODE_RE.test(q)) return resolveBarcode(q);
  if (URL_RE.test(q)) return resolveUrl(q);
  return resolveText(q);
}

// ── Barcode → Open Food Facts (no LLM) ───────────────────────────────────────

interface OFFProduct {
  product_name?: string;
  brands?: string;
  quantity?: string;
  ingredients_text?: string;
}

async function resolveBarcode(barcode: string): Promise<ResolvedProduct> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Parakhi/0.1 (https://parakhi.in; sidsaini1196@gmail.com)",
    },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Open Food Facts HTTP ${res.status}`);
  const body = (await res.json()) as { status: number; product?: OFFProduct };
  if (body.status !== 1 || !body.product) {
    throw new Error(`Barcode ${barcode} not found in Open Food Facts`);
  }
  const p = body.product;
  const ingredients = p.ingredients_text
    ? p.ingredients_text.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
    : undefined;
  return ResolvedProductSchema.parse({
    brand: (p.brands ?? "").split(",")[0]?.trim() || "Unknown",
    name: p.product_name?.trim() || "Unknown product",
    variant: p.quantity?.trim() || undefined,
    barcode,
    declaredIngredients: ingredients,
    sourceUrls: [url],
  });
}

// ── URL → Open Graph (no LLM; regex cleanup) ─────────────────────────────────

async function resolveUrl(url: string): Promise<ResolvedProduct> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      "Accept-Language": "en-IN,en;q=0.9",
    },
    next: { revalidate: false },
  });
  if (!res.ok) {
    throw new Error(`URL fetch HTTP ${res.status} — paste product name instead`);
  }
  const html = await res.text();
  const title =
    pickMeta(html, "og:title") ?? pickTitle(html);
  const brandHint = pickMeta(html, "og:brand") ?? pickMeta(html, "product:brand");
  if (!title) {
    throw new Error("Couldn't read product title — paste product name instead");
  }
  // Strip retailer noise: everything after a dash/pipe, "Buy online", etc.
  const cleaned = title
    .replace(/\s*[|–—-]\s*(buy|shop|online|amazon|flipkart|blinkit).*$/i, "")
    .replace(/\s*:\s*amazon\.in.*$/i, "")
    .trim();
  return resolveText(cleaned, { brandHint, sourceUrls: [url] });
}

function pickMeta(html: string, property: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  return re.exec(html)?.[1]?.trim();
}
function pickTitle(html: string): string | undefined {
  return /<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1]?.trim();
}

// ── Free text → BrandIndex fuzzy + variant regex ─────────────────────────────

async function resolveText(
  query: string,
  extras?: { brandHint?: string; sourceUrls?: string[] },
): Promise<ResolvedProduct> {
  const sourceUrls = extras?.sourceUrls ?? [];
  const lower = query.toLowerCase();

  // Extract variant first (and strip it from the name).
  const variantMatch = VARIANT_RE.exec(query);
  const variant = variantMatch ? variantMatch[1]!.trim() : undefined;

  // Find the best brand. Prefer the brandHint, else scan BrandIndex aliases.
  const brands = await db.brandIndex.findMany({
    select: { canonicalName: true, aliases: true },
  });

  let matchedAlias = "";
  let bestScore = 0;

  const hintLower = extras?.brandHint?.toLowerCase();

  for (const b of brands) {
    const aliases = JSON.parse(b.aliases) as string[];
    for (const alias of aliases) {
      // Substring match in the query (or in the brand hint) is the strongest
      // signal and avoids fuzzy false-positives.
      if (lower.includes(alias) || (hintLower && hintLower.includes(alias))) {
        if (alias.length > matchedAlias.length) {
          matchedAlias = alias;
          bestScore = 1;
        }
      } else {
        // Fuzzy fallback: token-level Jaro-Winkler on the first query token.
        const sim = jaroWinkler(firstToken(lower), alias);
        if (sim > 0.92 && sim > bestScore && alias.length >= 4) {
          matchedAlias = alias;
          bestScore = sim;
        }
      }
    }
  }

  if (!matchedAlias) {
    throw new Error(
      "Couldn't match a known brand — pick one from the list or submit it for review",
    );
  }

  // Display the consumer-facing brand (the matched alias, title-cased) rather
  // than the corporate canonical name. "Coca-Cola" not "The Coca-Cola
  // Company". The alias still resolves to the right BrandIndex row for
  // origin enrichment because brandOriginsForProduct searches the alias list.
  const matchedBrand = titleCase(matchedAlias);

  // Name = query minus the matched brand alias minus the variant. Normalize
  // hyphens to spaces on both sides so "Coca-Cola" strips against alias
  // "coca cola" and vice-versa.
  const norm = (s: string) => s.replace(/[-–—]/g, " ").replace(/\s+/g, " ").trim();
  let name = norm(query);
  if (variantMatch) name = name.replace(norm(variantMatch[1]!), "");
  const aliasNorm = norm(matchedAlias);
  const aliasRe = new RegExp(
    aliasNorm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "ig",
  );
  name = name.replace(aliasRe, "").replace(/\s+/g, " ").trim();
  if (!name) name = matchedBrand;

  return ResolvedProductSchema.parse({
    brand: matchedBrand,
    name,
    variant,
    sourceUrls,
  });
}

function firstToken(s: string): string {
  return s.split(/\s+/)[0] ?? s;
}

function titleCase(s: string): string {
  return s
    .split(/(\s|-)/)
    .map((part) =>
      /^[a-z]/.test(part)
        ? part.charAt(0).toUpperCase() + part.slice(1)
        : part,
    )
    .join("");
}

// ── Jaro-Winkler similarity (0..1) ───────────────────────────────────────────

function jaroWinkler(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  const matchDistance = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  const aMatches = new Array(a.length).fill(false);
  const bMatches = new Array(b.length).fill(false);
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;
  let t = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) t++;
    k++;
  }
  t /= 2;
  const jaro =
    (matches / a.length + matches / b.length + (matches - t) / matches) / 3;
  // Winkler prefix bonus.
  let prefix = 0;
  for (let i = 0; i < Math.min(4, a.length, b.length); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}
