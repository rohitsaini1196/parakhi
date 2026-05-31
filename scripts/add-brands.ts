/**
 * Add brands to BrandIndex that aren't covered by the Wikidata seed.
 * Deterministic — country known, no SPARQL. Idempotent on slug.
 *
 *   npx tsx --env-file=.env scripts/add-brands.ts
 */
import { db } from "../lib/db";
import { slugify } from "../lib/slug";

interface BrandSeed {
  canonicalName: string;
  aliases: string[];
  country: string; // ISO-2
  parentCompany?: string;
}

const BRANDS: BrandSeed[] = [
  // Spices — all Indian-owned
  { canonicalName: "MDH", aliases: ["mdh", "mahashian di hatti"], country: "IN" },
  { canonicalName: "Everest", aliases: ["everest", "everest masala", "everest spices"], country: "IN" },
  { canonicalName: "Catch", aliases: ["catch", "catch masala", "catch spices"], country: "IN", parentCompany: "DS Group" },
  { canonicalName: "Badshah", aliases: ["badshah", "badshah masala"], country: "IN" },
  { canonicalName: "Suhana", aliases: ["suhana", "suhana masala"], country: "IN" },
  { canonicalName: "Tata Sampann", aliases: ["tata sampann", "sampann"], country: "IN", parentCompany: "Tata Consumer Products" },
  // Atta — mostly Indian, two foreign
  { canonicalName: "Aashirvaad", aliases: ["aashirvaad", "ashirvaad"], country: "IN", parentCompany: "ITC Limited" },
  { canonicalName: "Shakti Bhog", aliases: ["shakti bhog", "shaktibhog"], country: "IN" },
  { canonicalName: "Rajdhani", aliases: ["rajdhani", "rajdhani atta"], country: "IN" },
  { canonicalName: "Pilsbury", aliases: ["pilsbury", "pillsbury"], country: "US", parentCompany: "General Mills" },
  { canonicalName: "Annapurna", aliases: ["annapurna atta"], country: "NL", parentCompany: "Hindustan Unilever" },
  // Energy drinks
  { canonicalName: "Sting", aliases: ["sting", "sting energy"], country: "US", parentCompany: "PepsiCo" },
  { canonicalName: "Monster Energy", aliases: ["monster energy", "monster"], country: "US", parentCompany: "Monster Beverage" },
  { canonicalName: "Red Bull", aliases: ["red bull", "redbull"], country: "AT", parentCompany: "Red Bull GmbH" },
  { canonicalName: "Hell Energy", aliases: ["hell energy", "hell"], country: "HU" },
  // Health drinks
  { canonicalName: "Horlicks", aliases: ["horlicks"], country: "NL", parentCompany: "Hindustan Unilever" },
  { canonicalName: "Bournvita", aliases: ["bournvita", "cadbury bournvita"], country: "US", parentCompany: "Mondelez International" },
  { canonicalName: "Complan", aliases: ["complan"], country: "IN", parentCompany: "Zydus Wellness" },
  { canonicalName: "Boost", aliases: ["boost health"], country: "NL", parentCompany: "Hindustan Unilever" },
  { canonicalName: "Protinex", aliases: ["protinex"], country: "FR", parentCompany: "Danone" },
  { canonicalName: "Pediasure", aliases: ["pediasure"], country: "US", parentCompany: "Abbott" },
  // Face wash / skincare not yet indexed
  { canonicalName: "Clean & Clear", aliases: ["clean & clear", "clean and clear"], country: "US", parentCompany: "Johnson & Johnson" },
  { canonicalName: "Neutrogena", aliases: ["neutrogena"], country: "US", parentCompany: "Kenvue" },
  { canonicalName: "Cetaphil", aliases: ["cetaphil"], country: "CH", parentCompany: "Galderma" },
  { canonicalName: "Mamaearth", aliases: ["mamaearth"], country: "IN", parentCompany: "Honasa Consumer" },
  { canonicalName: "WOW", aliases: ["wow skin science", "wow"], country: "IN" },
  // Dairy / staples
  { canonicalName: "Heritage", aliases: ["heritage foods", "heritage dairy"], country: "IN" },
  { canonicalName: "Nandini", aliases: ["nandini", "kmf nandini"], country: "IN", parentCompany: "Karnataka Milk Federation" },
  // Misc personal care
  { canonicalName: "Vatika", aliases: ["vatika", "dabur vatika"], country: "IN", parentCompany: "Dabur" },
  { canonicalName: "Savlon", aliases: ["savlon"], country: "IN", parentCompany: "ITC Limited" },
];

async function main() {
  let added = 0;
  let updated = 0;
  for (const b of BRANDS) {
    const slug = slugify(b.canonicalName);
    const existing = await db.brandIndex.findUnique({ where: { slug } });
    await db.brandIndex.upsert({
      where: { slug },
      update: {
        aliases: JSON.stringify(b.aliases),
        country: b.country,
        parentCompany: b.parentCompany ?? null,
      },
      create: {
        slug,
        canonicalName: b.canonicalName,
        aliases: JSON.stringify(b.aliases),
        country: b.country,
        parentCompany: b.parentCompany ?? null,
        source: "manual-seed",
      },
    });
    if (existing) updated++;
    else added++;
    console.log(`  ${existing ? "~" : "+"} ${b.canonicalName.padEnd(20)} ${b.country}`);
  }
  console.log(`\nAdded ${added}, updated ${updated}, of ${BRANDS.length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
