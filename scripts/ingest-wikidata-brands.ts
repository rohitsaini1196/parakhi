/**
 * Seed the BrandIndex with well-known Indian-market FMCG brands from
 * Wikidata. Free, public, no API key. Run monthly via GH Actions in Phase 3.
 *
 *   npm run ingest:wikidata
 *
 * Idempotent — `slug` is the conflict key. Re-running updates parent/country
 * if Wikidata data changed.
 *
 * The seed list below is hand-curated. Add to it as new brands appear in
 * production traffic; alternatively a future job can mine product queries
 * for unindexed brand candidates and queue them for review.
 */
import { db } from "../lib/db";
import { fetchBrandFromWikidata } from "../lib/wikidata";
import { slugify } from "../lib/slug";

/**
 * Seed list. Format: { name: Wikidata-canonical-label, defaultCountry?: ISO2 }
 * `defaultCountry` is a manual override when Wikidata is missing country
 * data (rare). The script logs a warning when used.
 */
const BRAND_SEEDS: Array<{ name: string; defaultCountry?: string }> = [
  // Big Indian FMCG
  { name: "Parle Products" },
  { name: "Britannia Industries" },
  { name: "ITC Limited" },
  { name: "Godrej Consumer Products", defaultCountry: "IN" },
  { name: "Marico", defaultCountry: "IN" },
  { name: "Dabur" },
  { name: "Emami" },
  { name: "Patanjali Ayurved" },
  { name: "Tata Consumer Products" },
  { name: "Amul" },
  { name: "Mother Dairy" },
  { name: "Bisleri International", defaultCountry: "IN" },
  // Indian beverage bottlers (Indian companies running foreign brand ops)
  { name: "Varun Beverages", defaultCountry: "IN" },
  { name: "Hindustan Coca-Cola Beverages", defaultCountry: "IN" },
  // Foreign-parent FMCG operating in India
  { name: "Hindustan Unilever" },
  { name: "Unilever" },
  { name: "Nestlé India", defaultCountry: "IN" },
  { name: "Nestlé" },
  // PepsiCo is incorporated in NY despite Wikidata's strange BE country code;
  // override to keep brand-profit attribution accurate.
  { name: "PepsiCo", defaultCountry: "US" },
  { name: "The Coca-Cola Company" },
  { name: "Mondelez International" },
  { name: "Procter & Gamble" },
  { name: "Colgate-Palmolive", defaultCountry: "US" },
  { name: "Reckitt" },
  { name: "Johnson & Johnson" },
  { name: "L'Oréal" },
  { name: "Kellogg's", defaultCountry: "US" },
  { name: "General Mills" },
  // Smaller / regional
  { name: "Haldiram's" },
  { name: "MTR Foods" },

  // ── Consumer sub-brands (what people actually type) ──────────────────────
  // Each resolves to its parent company → country via Wikidata P749/P127.
  // Brand-profit attribution follows the parent, which is what we want.
  { name: "Maggi", defaultCountry: "CH" }, // Nestlé
  { name: "Surf Excel", defaultCountry: "NL" }, // Unilever
  { name: "Rin", defaultCountry: "NL" },
  { name: "Wheel", defaultCountry: "NL" },
  { name: "Lux", defaultCountry: "NL" },
  { name: "Lifebuoy", defaultCountry: "NL" },
  { name: "Dove", defaultCountry: "NL" },
  { name: "Pears", defaultCountry: "NL" },
  { name: "Vim", defaultCountry: "NL" },
  { name: "Thums Up", defaultCountry: "US" }, // Coca-Cola
  { name: "Limca", defaultCountry: "US" },
  { name: "Sprite", defaultCountry: "US" },
  { name: "Fanta", defaultCountry: "US" },
  { name: "Maaza", defaultCountry: "US" },
  { name: "Kinley", defaultCountry: "US" },
  { name: "Lay's", defaultCountry: "US" }, // PepsiCo
  { name: "Kurkure", defaultCountry: "US" },
  { name: "Aquafina", defaultCountry: "US" },
  { name: "Mirinda", defaultCountry: "US" },
  { name: "Bisleri", defaultCountry: "IN" },
  { name: "Bingo", defaultCountry: "IN" }, // ITC
  { name: "Sunfeast", defaultCountry: "IN" },
  { name: "Aashirvaad", defaultCountry: "IN" },
  { name: "Bru", defaultCountry: "IN" }, // HUL
  { name: "Nescafé", defaultCountry: "CH" }, // Nestlé
  { name: "KitKat", defaultCountry: "CH" },
  { name: "Bournvita", defaultCountry: "US" }, // Mondelez
  { name: "Cadbury", defaultCountry: "US" }, // Mondelez
  { name: "Oreo", defaultCountry: "US" },
  { name: "Horlicks", defaultCountry: "NL" }, // now HUL/Unilever
  { name: "Colgate", defaultCountry: "US" },
  { name: "Dettol", defaultCountry: "GB" }, // Reckitt
  { name: "Harpic", defaultCountry: "GB" },
  { name: "Lizol", defaultCountry: "GB" },
  { name: "Good Day", defaultCountry: "IN" }, // Britannia
  { name: "Parle-G", defaultCountry: "IN" },
];

async function main() {
  let inserted = 0;
  let updated = 0;
  let missed: string[] = [];

  for (const seed of BRAND_SEEDS) {
    try {
      const hit = await fetchBrandFromWikidata(seed.name);
      // Author-asserted defaultCountry wins: Wikidata's country field is noisy
      // for sub-brands (returns country-of-origin of same-named unrelated
      // items — Bingo→Burkina Faso, Rin→Ireland). When we've asserted a
      // country we trust it; Wikidata only fills the gaps.
      const country = seed.defaultCountry ?? hit?.country ?? null;
      if (!country) {
        missed.push(seed.name);
        console.log(
          `  ! ${seed.name.padEnd(36)} no Wikidata hit + no defaultCountry, skipped`,
        );
        continue;
      }
      const slug = slugify(seed.name);
      const canonicalName = hit?.canonicalName ?? seed.name;
      const aliasSet = new Set<string>([
        seed.name.toLowerCase(),
        canonicalName.toLowerCase(),
      ]);
      hit?.aliases.forEach((a) => aliasSet.add(a.toLowerCase()));
      const aliases = JSON.stringify(Array.from(aliasSet));
      const source = hit ? `wikidata:${hit.qid}` : "manual";
      const sourceUrl = hit
        ? `https://www.wikidata.org/wiki/${hit.qid}`
        : null;
      const existing = await db.brandIndex.findUnique({ where: { slug } });
      await db.brandIndex.upsert({
        where: { slug },
        update: {
          canonicalName,
          aliases,
          parentCompany: hit?.parentCompany ?? null,
          country,
          source,
          sourceUrl,
        },
        create: {
          slug,
          canonicalName,
          aliases,
          parentCompany: hit?.parentCompany ?? null,
          country,
          source,
          sourceUrl,
        },
      });
      if (existing) updated++;
      else inserted++;
      const tag = hit ? "✓" : "·";
      const note = hit ? "" : "(manual)";
      console.log(
        `  ${tag} ${seed.name.padEnd(36)} → ${country} ${hit?.parentCompany ? `(parent: ${hit.parentCompany})` : note}`,
      );
    } catch (e) {
      missed.push(seed.name);
      console.log(`  ✗ ${seed.name.padEnd(36)} ERROR ${(e as Error).message}`);
    }
    // Politeness: 250ms between requests.
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\nDone. Inserted ${inserted}, updated ${updated}, missed ${missed.length}.`);
  if (missed.length > 0) {
    console.log(`Missed: ${missed.join(", ")}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
