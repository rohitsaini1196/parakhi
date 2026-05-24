/**
 * Seed a starter catalog of well-known Indian SKUs so search + compare have
 * real substance. Deterministic — no LLM. Each entry is categorized by rules
 * (keyword/HSN), computed via the breakdown engine, and persisted.
 *
 *   npm run seed:catalog
 *
 * Skips entries that don't match a known category template (honest — we don't
 * fake categories). Re-runnable (idempotent on slug). Brand strings are chosen
 * to match BrandIndex aliases so brand-origin enrichment fires.
 */
import { db } from "../lib/db";
import { categorizeByRules } from "../lib/categorize-rules";
import { estimateBreakdown } from "../lib/estimate";
import { upsertProduct, upsertBreakdown } from "../lib/persist";
import { CategoryTemplateSchema, type ResolvedProduct } from "../lib/schemas";

interface Entry {
  brand: string;
  name: string;
  variant?: string;
  mrp?: number; // rupees
}

const CATALOG: Entry[] = [
  // ── Biscuits ──
  { brand: "Britannia", name: "Marie Gold", variant: "250g" },
  { brand: "Britannia", name: "Good Day Cashew", variant: "200g" },
  { brand: "Britannia", name: "Bourbon", variant: "150g" },
  { brand: "Britannia", name: "50-50 Maska Chaska", variant: "120g" },
  { brand: "Britannia", name: "NutriChoice Digestive", variant: "250g" },
  { brand: "Parle", name: "Monaco", variant: "63g" },
  { brand: "Parle", name: "Krackjack", variant: "60g" },
  { brand: "Parle", name: "Hide & Seek", variant: "100g" },
  { brand: "Sunfeast", name: "Marie Light", variant: "250g" },
  { brand: "Sunfeast", name: "Bourbon", variant: "150g" },
  // ── Instant noodles ──
  { brand: "Maggi", name: "2-Minute Masala Noodles", variant: "70g" },
  { brand: "Maggi", name: "Atta Noodles", variant: "75g" },
  { brand: "Yippee", name: "Magic Masala Noodles", variant: "70g" },
  { brand: "Top Ramen", name: "Masala Noodles", variant: "70g" },
  { brand: "Knorr", name: "Soupy Noodles", variant: "70g" },
  { brand: "Wai Wai", name: "Noodles", variant: "75g" },
  // ── Soft drinks ──
  { brand: "Coca-Cola", name: "Original", variant: "300ml" },
  { brand: "Pepsi", name: "Cola", variant: "330ml" },
  { brand: "Thums Up", name: "Cola", variant: "300ml" },
  { brand: "Sprite", name: "Lime", variant: "300ml" },
  { brand: "Limca", name: "Lemon", variant: "300ml" },
  { brand: "Fanta", name: "Orange", variant: "300ml" },
  { brand: "Mirinda", name: "Orange", variant: "330ml" },
  { brand: "Mountain Dew", name: "Cola", variant: "330ml" },
  { brand: "Coca-Cola", name: "Diet Coke", variant: "330ml" },
  // ── Bottled water ──
  { brand: "Bisleri", name: "Mineral Water", variant: "1L" },
  { brand: "Kinley", name: "Water", variant: "1L" },
  { brand: "Aquafina", name: "Water", variant: "1L" },
  { brand: "Bailley", name: "Water", variant: "1L" },
  // ── Bar soap ──
  { brand: "Lux", name: "Soft Touch Soap", variant: "100g" },
  { brand: "Lifebuoy", name: "Total Soap", variant: "100g" },
  { brand: "Dove", name: "Cream Beauty Bar", variant: "100g" },
  { brand: "Pears", name: "Pure & Gentle Soap", variant: "75g" },
  { brand: "Santoor", name: "Sandal Soap", variant: "100g" },
  { brand: "Cinthol", name: "Original Soap", variant: "100g" },
  { brand: "Dettol", name: "Original Soap", variant: "100g" },
  { brand: "Medimix", name: "Ayurvedic Soap", variant: "100g" },
  { brand: "Mysore Sandal", name: "Soap", variant: "100g" },
  // ── Packaged milk ──
  { brand: "Amul", name: "Taaza Toned Milk", variant: "500ml" },
  { brand: "Amul", name: "Gold Full Cream Milk", variant: "500ml" },
  { brand: "Mother Dairy", name: "Toned Milk", variant: "500ml" },
  { brand: "Nandini", name: "Toned Milk", variant: "500ml" },
  // ── Detergent powder ──
  { brand: "Surf Excel", name: "Easy Wash Detergent", variant: "1kg" },
  { brand: "Ariel", name: "Matic Detergent", variant: "1kg" },
  { brand: "Tide", name: "Plus Detergent", variant: "1kg" },
  { brand: "Wheel", name: "Active Detergent", variant: "1kg" },
  { brand: "Rin", name: "Detergent Powder", variant: "1kg" },
  { brand: "Ghadi", name: "Detergent Powder", variant: "1kg" },
  { brand: "Nirma", name: "Washing Powder", variant: "1kg" },
  // ── Toothpaste ──
  { brand: "Colgate", name: "Strong Teeth", variant: "100g" },
  { brand: "Pepsodent", name: "Germi Check", variant: "150g" },
  { brand: "Closeup", name: "Red Hot Gel", variant: "150g" },
  { brand: "Sensodyne", name: "Fresh Mint", variant: "70g" },
  { brand: "Dabur", name: "Red Toothpaste", variant: "100g" },
  { brand: "Patanjali", name: "Dant Kanti", variant: "100g" },
  { brand: "Vicco", name: "Vajradanti", variant: "100g" },
  { brand: "Meswak", name: "Toothpaste", variant: "100g" },
  // ── Chips & namkeen ──
  { brand: "Lay's", name: "Magic Masala", variant: "52g" },
  { brand: "Lay's", name: "Classic Salted", variant: "52g" },
  { brand: "Kurkure", name: "Masala Munch", variant: "90g" },
  { brand: "Bingo", name: "Mad Angles", variant: "80g" },
  { brand: "Bingo", name: "Tedhe Medhe", variant: "70g" },
  { brand: "Haldiram", name: "Aloo Bhujia", variant: "200g" },
  { brand: "Haldiram", name: "Bhujia Sev", variant: "200g" },
  { brand: "Bikaji", name: "Bhujia", variant: "200g" },
  { brand: "Balaji", name: "Wafers Masala", variant: "55g" },
  { brand: "Uncle Chipps", name: "Spicy Treat", variant: "55g" },
  // ── Tea ──
  { brand: "Tata Tea", name: "Premium", variant: "500g" },
  { brand: "Red Label", name: "Natural Care Tea", variant: "500g" },
  { brand: "Wagh Bakri", name: "Premium Tea", variant: "250g" },
  { brand: "Taj Mahal", name: "Tea", variant: "250g" },
  { brand: "Tetley", name: "Green Tea", variant: "100g" },
  { brand: "Lipton", name: "Green Tea", variant: "100g" },
  { brand: "Society", name: "Tea", variant: "250g" },
  { brand: "Girnar", name: "Premium Tea", variant: "250g" },
];

async function main() {
  let ok = 0;
  let skipped = 0;
  const templates = new Map<string, ReturnType<typeof CategoryTemplateSchema.parse>>();

  for (const e of CATALOG) {
    const resolved: ResolvedProduct = {
      brand: e.brand,
      name: e.name,
      variant: e.variant,
      sourceUrls: [],
      mrpInPaise: e.mrp != null ? Math.round(e.mrp * 100) : undefined,
    };
    const cat = await categorizeByRules(resolved);
    if (cat.categorySlug === "uncategorized") {
      skipped++;
      console.log(`  · skip ${e.brand} ${e.name} — uncategorized`);
      continue;
    }

    let template = templates.get(cat.categorySlug);
    if (!template) {
      const row = await db.category.findUnique({ where: { slug: cat.categorySlug } });
      if (!row) {
        skipped++;
        continue;
      }
      template = CategoryTemplateSchema.parse(JSON.parse(row.templateJson));
      templates.set(cat.categorySlug, template);
    }

    const hsnCode = cat.hsnCode || template.hsnCodes[0]!;
    const breakdown = await estimateBreakdown({ product: resolved, template, hsnCode });
    const persisted = await upsertProduct({
      product: resolved,
      categorySlug: cat.categorySlug,
      hsnCode,
    });
    await upsertBreakdown({ productId: persisted.id, breakdown });
    ok++;
    console.log(`  ✓ ${persisted.slug.padEnd(40)} IVC ${breakdown.madeInIndiaScorePct}%`);
  }

  console.log(`\nSeeded ${ok}, skipped ${skipped}, of ${CATALOG.length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
