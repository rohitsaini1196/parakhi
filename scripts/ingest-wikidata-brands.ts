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

  // ── Personal care: toothpaste, shampoo ───────────────────────────────────
  { name: "Pepsodent", defaultCountry: "NL" }, // Unilever
  { name: "Closeup", defaultCountry: "NL" },
  { name: "Sensodyne", defaultCountry: "GB" }, // GSK / Haleon
  { name: "Oral-B", defaultCountry: "US" }, // P&G
  { name: "Promise", defaultCountry: "IN" }, // Dabur
  { name: "Meswak", defaultCountry: "IN" }, // Dabur
  { name: "Babool", defaultCountry: "IN" }, // Dabur
  { name: "Vicco", defaultCountry: "IN" },
  { name: "Pantene", defaultCountry: "US" }, // P&G
  { name: "Sunsilk", defaultCountry: "NL" }, // Unilever
  { name: "Head & Shoulders", defaultCountry: "US" }, // P&G
  { name: "Clinic Plus", defaultCountry: "NL" }, // HUL/Unilever
  { name: "TRESemmé", defaultCountry: "NL" }, // Unilever
  { name: "Vatika", defaultCountry: "IN" }, // Dabur
  { name: "Himalaya", defaultCountry: "IN" }, // Himalaya Wellness

  // ── Snacks: chips & namkeen ──────────────────────────────────────────────
  { name: "Lay's", defaultCountry: "US" }, // already above; duplicate safe — upserts on slug
  { name: "Kurkure", defaultCountry: "US" },
  { name: "Uncle Chipps", defaultCountry: "US" }, // PepsiCo
  { name: "Pringles", defaultCountry: "US" }, // Kellanova / Kellogg's
  { name: "Doritos", defaultCountry: "US" },
  { name: "Cheetos", defaultCountry: "US" },
  { name: "Cornitos", defaultCountry: "IN" },
  { name: "Haldiram's", defaultCountry: "IN" }, // dup, safe
  { name: "Bikaji", defaultCountry: "IN" },
  { name: "Balaji Wafers", defaultCountry: "IN" },
  { name: "Yellow Diamond", defaultCountry: "IN" },

  // ── Tea ──────────────────────────────────────────────────────────────────
  { name: "Tata Tea", defaultCountry: "IN" },
  { name: "Brooke Bond", defaultCountry: "NL" }, // HUL/Unilever
  { name: "Red Label", defaultCountry: "NL" },
  { name: "Taj Mahal Tea", defaultCountry: "NL" }, // HUL
  { name: "Taaza", defaultCountry: "NL" },
  { name: "Wagh Bakri", defaultCountry: "IN" },
  { name: "Lipton", defaultCountry: "NL" }, // now under Lipton Teas & Infusions (CVC, NL)
  { name: "Tetley", defaultCountry: "IN" }, // owned by Tata Consumer
  { name: "Society Tea", defaultCountry: "IN" },
  { name: "Girnar", defaultCountry: "IN" },
  { name: "Kanan Devan", defaultCountry: "IN" }, // Tata

  // ── Chocolate ────────────────────────────────────────────────────────────
  { name: "Cadbury", defaultCountry: "US" }, // Mondelez (dup-safe)
  { name: "Dairy Milk", defaultCountry: "US" },
  { name: "5 Star", defaultCountry: "US" },
  { name: "Perk", defaultCountry: "US" },
  { name: "Gems", defaultCountry: "US" },
  { name: "Bournville", defaultCountry: "US" },
  { name: "Munch", defaultCountry: "CH" }, // Nestlé
  { name: "Milkybar", defaultCountry: "CH" },
  { name: "Ferrero Rocher", defaultCountry: "IT" },
  { name: "Amul Chocolate", defaultCountry: "IN" },

  // ── Hair / shampoo ───────────────────────────────────────────────────────
  { name: "Indulekha", defaultCountry: "NL" }, // HUL
  { name: "Chik", defaultCountry: "IN" }, // CavinKare
  { name: "Clear", defaultCountry: "NL" },

  // ── Skin cream / lotion ──────────────────────────────────────────────────
  { name: "Pond's", defaultCountry: "NL" }, // HUL
  { name: "Glow & Lovely", defaultCountry: "NL" },
  { name: "Vaseline", defaultCountry: "NL" },
  { name: "Lakmé", defaultCountry: "NL" },
  { name: "Nivea", defaultCountry: "DE" },
  { name: "Boroline", defaultCountry: "IN" },
  { name: "Olay", defaultCountry: "US" }, // P&G
  { name: "Garnier", defaultCountry: "FR" }, // L'Oréal

  // ── Cooking oil ──────────────────────────────────────────────────────────
  { name: "Fortune", defaultCountry: "IN" }, // Adani Wilmar (India-listed)
  { name: "Saffola", defaultCountry: "IN" }, // Marico
  { name: "Sundrop", defaultCountry: "IN" },
  { name: "Dhara", defaultCountry: "IN" }, // Mother Dairy
  { name: "Gemini", defaultCountry: "IN" },

  // ── Coffee ───────────────────────────────────────────────────────────────
  { name: "Bru", defaultCountry: "NL" }, // HUL
  { name: "Sunrise", defaultCountry: "IN" },
  { name: "Tata Coffee", defaultCountry: "IN" },
  { name: "Continental Coffee", defaultCountry: "IN" },

  // ── Juice ────────────────────────────────────────────────────────────────
  { name: "Real", defaultCountry: "IN" }, // Dabur
  { name: "Frooti", defaultCountry: "IN" }, // Parle Agro
  { name: "Appy", defaultCountry: "IN" },
  { name: "Tropicana", defaultCountry: "US" }, // PepsiCo
  { name: "Slice", defaultCountry: "US" },
  { name: "Maaza", defaultCountry: "US" }, // Coca-Cola (dup-safe)
  { name: "Minute Maid", defaultCountry: "US" },
  { name: "Paper Boat", defaultCountry: "IN" },
  { name: "B Natural", defaultCountry: "IN" }, // ITC
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
