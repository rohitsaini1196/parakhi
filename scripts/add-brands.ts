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
  // Hair oil
  { canonicalName: "Parachute", aliases: ["parachute", "parachute advansed"], country: "IN", parentCompany: "Marico" },
  { canonicalName: "Nihar", aliases: ["nihar", "nihar naturals"], country: "IN", parentCompany: "Marico" },
  { canonicalName: "Hair & Care", aliases: ["hair & care", "hair and care"], country: "IN", parentCompany: "Marico" },
  { canonicalName: "Bajaj", aliases: ["bajaj", "bajaj almond drops"], country: "IN", parentCompany: "Bajaj Consumer Care" },
  { canonicalName: "Navratna", aliases: ["navratna", "navratna oil"], country: "IN", parentCompany: "Emami" },
  { canonicalName: "Kesh King", aliases: ["kesh king"], country: "IN", parentCompany: "Emami" },
  { canonicalName: "Sesa", aliases: ["sesa", "sesa hair oil"], country: "IN", parentCompany: "Ban Labs" },
  { canonicalName: "Keo Karpin", aliases: ["keo karpin"], country: "IN", parentCompany: "Dey's Medical" },
  { canonicalName: "Indulekha", aliases: ["indulekha", "indulekha bringha"], country: "NL", parentCompany: "Hindustan Unilever" },
  // Rice
  { canonicalName: "India Gate", aliases: ["india gate", "india gate basmati"], country: "IN", parentCompany: "KRBL" },
  { canonicalName: "Daawat", aliases: ["daawat", "daawat basmati"], country: "IN", parentCompany: "LT Foods" },
  { canonicalName: "Kohinoor", aliases: ["kohinoor", "kohinoor basmati"], country: "US", parentCompany: "McCormick & Company" },
  { canonicalName: "Lal Qilla", aliases: ["lal qilla", "lal quila"], country: "IN", parentCompany: "Amar Singh Chawal Wala" },
  { canonicalName: "Shrilalmahal", aliases: ["shrilalmahal", "shri lal mahal"], country: "IN" },
  { canonicalName: "Double Horse", aliases: ["double horse"], country: "IN", parentCompany: "Manjilas" },
  { canonicalName: "Tilda", aliases: ["tilda"], country: "ES", parentCompany: "Ebro Foods" },
  // Pulses
  { canonicalName: "Organic Tattva", aliases: ["organic tattva"], country: "IN" },
  // Salt
  { canonicalName: "Tata Salt", aliases: ["tata salt"], country: "IN", parentCompany: "Tata Chemicals" },
  { canonicalName: "Surya", aliases: ["surya salt"], country: "IN" },
  // Sugar
  { canonicalName: "Madhur", aliases: ["madhur", "madhur sugar"], country: "IN" },
  { canonicalName: "Dhampure", aliases: ["dhampure", "dhampur"], country: "IN", parentCompany: "Dhampur Sugar Mills" },
  { canonicalName: "Trust", aliases: ["trust sugar"], country: "IN" },
  { canonicalName: "Uttam", aliases: ["uttam sugar"], country: "IN", parentCompany: "Uttam Sugar Mills" },
  { canonicalName: "Mawana", aliases: ["mawana", "mawana sugar"], country: "IN" },
  // Sauces & ketchup
  { canonicalName: "Kissan", aliases: ["kissan"], country: "NL", parentCompany: "Hindustan Unilever" },
  { canonicalName: "Heinz", aliases: ["heinz"], country: "US", parentCompany: "Kraft Heinz" },
  { canonicalName: "Veeba", aliases: ["veeba"], country: "IN" },
  { canonicalName: "Del Monte", aliases: ["del monte"], country: "IN", parentCompany: "FieldFresh Foods (Bharti)" },
  { canonicalName: "Cremica", aliases: ["cremica"], country: "IN" },
  { canonicalName: "Wingreens", aliases: ["wingreens", "wingreens farms"], country: "IN" },
  // Pickle
  { canonicalName: "Mother's Recipe", aliases: ["mother's recipe", "mothers recipe"], country: "IN", parentCompany: "Desai Brothers" },
  { canonicalName: "Priya", aliases: ["priya", "priya foods"], country: "IN" },
  { canonicalName: "Nilon's", aliases: ["nilon's", "nilons"], country: "IN" },
  { canonicalName: "Bedekar", aliases: ["bedekar"], country: "IN" },
  { canonicalName: "Tops", aliases: ["tops pickle", "tops"], country: "IN", parentCompany: "G.D. Foods" },
  { canonicalName: "Ruchi", aliases: ["ruchi pickle", "ruchi"], country: "IN" },
  // Jam & spreads
  { canonicalName: "Mapro", aliases: ["mapro"], country: "IN" },
  { canonicalName: "Pintola", aliases: ["pintola"], country: "IN" },
  { canonicalName: "Sundrop", aliases: ["sundrop"], country: "IN", parentCompany: "Agro Tech Foods" },
  { canonicalName: "Nutella", aliases: ["nutella"], country: "IT", parentCompany: "Ferrero" },
  { canonicalName: "Hershey's", aliases: ["hershey's", "hersheys", "hershey"], country: "US", parentCompany: "The Hershey Company" },
  // Honey
  { canonicalName: "Apis", aliases: ["apis"], country: "IN" },
  { canonicalName: "Zandu", aliases: ["zandu"], country: "IN", parentCompany: "Emami" },
  { canonicalName: "Hitkari", aliases: ["hitkari"], country: "IN" },
  // Breakfast cereal
  { canonicalName: "Kellogg's", aliases: ["kellogg's", "kelloggs", "kellogg"], country: "US", parentCompany: "Kellanova" },
  { canonicalName: "Bagrry's", aliases: ["bagrry's", "bagrrys"], country: "IN" },
  { canonicalName: "Quaker", aliases: ["quaker", "quaker oats"], country: "US", parentCompany: "PepsiCo" },
  { canonicalName: "Soulfull", aliases: ["soulfull"], country: "IN", parentCompany: "Tata Consumer Products" },
  { canonicalName: "True Elements", aliases: ["true elements"], country: "IN" },
  // Pasta
  { canonicalName: "Bambino", aliases: ["bambino"], country: "IN" },
  { canonicalName: "Weikfield", aliases: ["weikfield"], country: "IN" },
  { canonicalName: "Borges", aliases: ["borges"], country: "ES", parentCompany: "Borges International" },
  { canonicalName: "MTR", aliases: ["mtr", "mtr foods"], country: "NO", parentCompany: "Orkla" },
  // Ice cream
  { canonicalName: "Kwality Wall's", aliases: ["kwality wall's", "kwality walls"], country: "NL", parentCompany: "Hindustan Unilever" },
  { canonicalName: "Vadilal", aliases: ["vadilal"], country: "IN" },
  { canonicalName: "Havmor", aliases: ["havmor"], country: "KR", parentCompany: "Lotte" },
  { canonicalName: "Cream Bell", aliases: ["cream bell", "creambell"], country: "IN" },
  { canonicalName: "Baskin Robbins", aliases: ["baskin robbins"], country: "US", parentCompany: "Inspire Brands" },
  // Frozen
  { canonicalName: "McCain", aliases: ["mccain"], country: "CA", parentCompany: "McCain Foods" },
  { canonicalName: "Safal", aliases: ["safal"], country: "IN", parentCompany: "Mother Dairy" },
  { canonicalName: "ITC Master Chef", aliases: ["itc master chef", "master chef"], country: "IN", parentCompany: "ITC Limited" },
  { canonicalName: "Godrej Yummiez", aliases: ["godrej yummiez", "yummiez"], country: "IN", parentCompany: "Godrej" },
  // Bread
  { canonicalName: "Modern", aliases: ["modern bread", "modern foods"], country: "IN" },
  { canonicalName: "Harvest Gold", aliases: ["harvest gold"], country: "IN" },
  { canonicalName: "English Oven", aliases: ["english oven"], country: "IN", parentCompany: "Bonn Group" },
  { canonicalName: "Bonn", aliases: ["bonn"], country: "IN", parentCompany: "Bonn Group" },
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
