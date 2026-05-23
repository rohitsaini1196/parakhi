export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productSlug(brand: string, name: string, variant?: string) {
  const slug = slugify([brand, name, variant].filter(Boolean).join(" "));
  // Collapse an immediately-repeated phrase: "thums-up-thums-up-750ml" →
  // "thums-up-750ml". Happens when the product name equals the brand
  // (single-brand products like "Thums Up").
  return collapseRepeatedPhrases(slug.split("-")).join("-");
}

function collapseRepeatedPhrases(tokens: string[]): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    // Try to detect a repeated phrase of length 1..3 starting at i.
    let collapsed = false;
    for (let len = 3; len >= 1; len--) {
      if (i + 2 * len > tokens.length) continue;
      const a = tokens.slice(i, i + len).join("-");
      const b = tokens.slice(i + len, i + 2 * len).join("-");
      if (a === b) {
        out.push(...tokens.slice(i, i + len));
        i += 2 * len;
        collapsed = true;
        break;
      }
    }
    if (!collapsed) {
      out.push(tokens[i]!);
      i += 1;
    }
  }
  return out;
}
