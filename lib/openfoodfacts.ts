import { USER_AGENT } from "./contact";

/**
 * Open Food Facts search → real declared ingredients from the product label.
 * Free, no key. India coverage is patchy (~30-50% for big brands), so we treat
 * a hit as a bonus Tier-2 sourced fact, never a requirement. Barcode-less:
 * uses the search API and picks the best name match that actually has an
 * ingredient list.
 */

const SEARCH = "https://world.openfoodfacts.org/cgi/search.pl";

export interface OffMatch {
  barcode: string;
  productName: string;
  ingredients: string[];
  quantity: string | null;
}

interface OffSearchProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  quantity?: string;
  ingredients_text?: string;
  ingredients?: { text?: string }[];
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Search OFF for a brand+name and return the best ingredient-bearing match. */
export async function searchOFF(
  brand: string,
  name: string,
): Promise<OffMatch | null> {
  const url = new URL(SEARCH);
  url.searchParams.set("search_terms", `${brand} ${name}`);
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "10");
  url.searchParams.set("fields", "code,product_name,brands,quantity,ingredients_text,ingredients");
  // Bias toward India.
  url.searchParams.set("tagtype_0", "countries");
  url.searchParams.set("tag_contains_0", "contains");
  url.searchParams.set("tag_0", "india");

  let body: { products?: OffSearchProduct[] };
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;
    body = (await res.json()) as { products?: OffSearchProduct[] };
  } catch {
    return null;
  }
  const products = body.products ?? [];
  if (products.length === 0) return null;

  const wantBrand = norm(brand);
  const wantName = norm(name);

  // Score: must have ingredients; prefer brand + name token overlap.
  let best: { p: OffSearchProduct; score: number } | null = null;
  for (const p of products) {
    const text = p.ingredients_text?.trim();
    if (!text || text.length < 3) continue;
    const hay = norm(`${p.brands ?? ""} ${p.product_name ?? ""}`);
    let score = 0;
    if (hay.includes(wantBrand)) score += 3;
    for (const w of wantName.split(" ")) if (w.length > 2 && hay.includes(w)) score += 1;
    if (score === 0) continue;
    if (!best || score > best.score) best = { p, score };
  }
  if (!best) return null;

  const p = best.p;
  const ingredients = parseIngredients(p);
  if (ingredients.length === 0) return null;

  return {
    barcode: p.code ?? "",
    productName: p.product_name ?? name,
    ingredients,
    quantity: p.quantity ?? null,
  };
}

function parseIngredients(p: OffSearchProduct): string[] {
  if (p.ingredients?.length) {
    const list = p.ingredients
      .map((i) => i.text?.trim())
      .filter((t): t is string => Boolean(t && t.length > 1));
    if (list.length) return dedup(list).slice(0, 20);
  }
  if (p.ingredients_text) {
    return dedup(
      p.ingredients_text
        .split(/[,;]/)
        .map((s) => s.replace(/[().*_]/g, "").trim())
        .filter((s) => s.length > 1 && s.length < 60),
    ).slice(0, 20);
  }
  return [];
}

function dedup(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}
