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

  // ── Chocolate ──
  { brand: "Cadbury", name: "Dairy Milk", variant: "50g" },
  { brand: "Cadbury", name: "5 Star", variant: "40g" },
  { brand: "Cadbury", name: "Perk", variant: "27g" },
  { brand: "Cadbury", name: "Bournville Dark", variant: "80g" },
  { brand: "Cadbury", name: "Gems", variant: "40g" },
  { brand: "Nestlé", name: "KitKat", variant: "37g" },
  { brand: "Nestlé", name: "Munch", variant: "20g" },
  { brand: "Nestlé", name: "Milkybar", variant: "40g" },
  { brand: "Amul", name: "Dark Chocolate", variant: "150g" },
  { brand: "Ferrero Rocher", name: "Chocolate", variant: "100g" },
  // ── Shampoo ──
  { brand: "Sunsilk", name: "Black Shine Shampoo", variant: "180ml" },
  { brand: "Clinic Plus", name: "Strong & Long Shampoo", variant: "175ml" },
  { brand: "Dove", name: "Intense Repair Shampoo", variant: "180ml" },
  { brand: "Pantene", name: "Pro-V Shampoo", variant: "180ml" },
  { brand: "Head & Shoulders", name: "Anti-Dandruff Shampoo", variant: "180ml" },
  { brand: "TRESemmé", name: "Keratin Smooth Shampoo", variant: "185ml" },
  { brand: "Patanjali", name: "Kesh Kanti Shampoo", variant: "200ml" },
  { brand: "Indulekha", name: "Bringha Shampoo", variant: "100ml" },
  // ── Skin cream & lotion ──
  { brand: "Pond's", name: "Light Moisturiser", variant: "100ml" },
  { brand: "Nivea", name: "Soft Cream", variant: "100ml" },
  { brand: "Vaseline", name: "Body Lotion", variant: "200ml" },
  { brand: "Boroline", name: "Antiseptic Cream", variant: "40g" },
  { brand: "Glow & Lovely", name: "Face Cream", variant: "50g" },
  { brand: "Himalaya", name: "Nourishing Cream", variant: "50ml" },
  { brand: "Lakmé", name: "Peach Milk Moisturiser", variant: "120ml" },
  { brand: "Garnier", name: "Light Complete Cream", variant: "45g" },
  // ── Cooking oil ──
  { brand: "Fortune", name: "Sunflower Oil", variant: "1L" },
  { brand: "Fortune", name: "Soyabean Oil", variant: "1L" },
  { brand: "Saffola", name: "Gold Blended Oil", variant: "1L" },
  { brand: "Sundrop", name: "Sunflower Oil", variant: "1L" },
  { brand: "Dhara", name: "Mustard Oil", variant: "1L" },
  { brand: "Fortune", name: "Kachi Ghani Mustard Oil", variant: "1L" },
  { brand: "Gemini", name: "Refined Sunflower Oil", variant: "1L" },
  // ── Instant coffee ──
  { brand: "Nescafé", name: "Classic Coffee", variant: "50g" },
  { brand: "Bru", name: "Instant Coffee", variant: "50g" },
  { brand: "Sunrise", name: "Instant Coffee", variant: "50g" },
  { brand: "Tata Coffee", name: "Grand", variant: "50g" },
  { brand: "Continental Coffee", name: "Xtra", variant: "50g" },
  // ── Packaged juice ──
  { brand: "Real", name: "Mixed Fruit Juice", variant: "1L" },
  { brand: "Real", name: "Mango Nectar", variant: "1L" },
  { brand: "Tropicana", name: "Orange Juice", variant: "1L" },
  { brand: "Maaza", name: "Mango Drink", variant: "600ml" },
  { brand: "Frooti", name: "Mango Drink", variant: "600ml" },
  { brand: "Slice", name: "Mango Drink", variant: "600ml" },
  { brand: "Paper Boat", name: "Aamras", variant: "250ml" },
  { brand: "B Natural", name: "Mixed Fruit Juice", variant: "1L" },

  // ── Biscuits (extended) ──
  { brand: "Oreo", name: "Original Sandwich Biscuit", variant: "120g" },
  { brand: "Oreo", name: "Chocolate Sandwich Biscuit", variant: "120g" },
  { brand: "McVitie's", name: "Digestive Biscuits", variant: "250g" },
  { brand: "McVitie's", name: "Chocolate Digestive", variant: "200g" },
  { brand: "Sunfeast", name: "Dark Fantasy Choco Fills", variant: "75g" },
  { brand: "Sunfeast", name: "Mom's Magic Butter", variant: "200g" },
  { brand: "Sunfeast", name: "Yumfills Choco", variant: "75g" },
  { brand: "Britannia", name: "Jim Jam", variant: "150g" },
  { brand: "Britannia", name: "Tiger Glucose", variant: "60g" },
  { brand: "Britannia", name: "NutriChoice 5 Grain", variant: "100g" },
  { brand: "Parle", name: "Milk Shakti", variant: "150g" },
  { brand: "Parle", name: "Digestive Marie", variant: "250g" },
  { brand: "Parle", name: "Cheeselings", variant: "50g" },
  { brand: "Patanjali", name: "Doodh Biscuit", variant: "150g" },
  { brand: "Anmol", name: "Marie Biscuit", variant: "250g" },
  { brand: "Priyagold", name: "Choco Nut Biscuit", variant: "100g" },

  // ── Instant noodles (extended) ──
  { brand: "Ching's Secret", name: "Desi Chinese Noodles", variant: "60g" },
  { brand: "Patanjali", name: "Atta Noodles", variant: "75g" },
  { brand: "Maggi", name: "Veggie Atta Noodles", variant: "75g" },
  { brand: "Yippee", name: "Mood Masala Noodles", variant: "70g" },
  { brand: "Yippee", name: "Power Up Atta Noodles", variant: "70g" },
  { brand: "Bambino", name: "Vermicelli Roasted", variant: "150g" },

  // ── Carbonated soft drinks (extended) ──
  { brand: "7Up", name: "Lime", variant: "300ml" },
  { brand: "Sting", name: "Energy Drink", variant: "250ml" },
  { brand: "Bisleri", name: "Limonata", variant: "250ml" },
  { brand: "Appy Fizz", name: "Apple Drink", variant: "250ml" },
  { brand: "Pepsi", name: "Cola", variant: "500ml" },
  { brand: "Thums Up", name: "Cola", variant: "500ml" },
  { brand: "Sprite", name: "Lime", variant: "500ml" },
  { brand: "Campa Cola", name: "Cola", variant: "200ml" },
  { brand: "Campa Cola", name: "Lemon", variant: "200ml" },
  { brand: "Mountain Dew", name: "Ice", variant: "330ml" },

  // ── Bottled water (extended) ──
  { brand: "Himalayan", name: "Mineral Water", variant: "500ml" },
  { brand: "Nestlé", name: "Pure Life Water", variant: "1L" },
  { brand: "Vedica", name: "Mountain Water", variant: "500ml" },
  { brand: "Qua", name: "Sparkling Water", variant: "500ml" },

  // ── Bar soap (extended) ──
  { brand: "Hamam", name: "Neem Tulsi Soap", variant: "100g" },
  { brand: "Margo", name: "Neem Soap", variant: "100g" },
  { brand: "Godrej", name: "No.1 Sandal Soap", variant: "100g" },
  { brand: "Vivel", name: "Aloe Vera Soap", variant: "100g" },
  { brand: "Fiama", name: "Shower Gel Bar", variant: "75g" },
  { brand: "Savlon", name: "Moisturising Soap", variant: "125g" },

  // ── Packaged milk (extended) ──
  { brand: "Nestlé", name: "a+ Toned Milk", variant: "500ml" },
  { brand: "Amul", name: "Slim & Trim Skimmed Milk", variant: "500ml" },
  { brand: "Heritage", name: "Fresh Toned Milk", variant: "500ml" },
  { brand: "Kwality Dairy", name: "Toned Milk", variant: "500ml" },
  { brand: "Aavin", name: "Toned Milk", variant: "500ml" },
  { brand: "Verka", name: "Toned Milk", variant: "500ml" },

  // ── Detergent powder (extended) ──
  { brand: "Henkel", name: "Henko Detergent Powder", variant: "1kg" },
  { brand: "Fena", name: "Detergent Powder", variant: "1kg" },
  { brand: "Patanjali", name: "Herbal Washing Powder", variant: "1kg" },

  // ── Chips & namkeen (extended) ──
  { brand: "Lay's", name: "Spanish Tomato Tango", variant: "26g" },
  { brand: "Lay's", name: "Cream & Onion", variant: "26g" },
  { brand: "Lay's", name: "Simply Salted", variant: "52g" },
  { brand: "Kurkure", name: "Naughty Tomatoes", variant: "90g" },
  { brand: "Kurkure", name: "Green Chutney Style", variant: "90g" },
  { brand: "Haldiram's", name: "Moong Dal", variant: "150g" },
  { brand: "Haldiram's", name: "Peanut Masala", variant: "150g" },
  { brand: "Haldiram's", name: "Navratan Mixture", variant: "150g" },
  { brand: "Haldiram's", name: "Soan Papdi", variant: "250g" },
  { brand: "Bikaji", name: "Bikaneri Bhujia", variant: "200g" },
  { brand: "Bikaji", name: "Aloo Bhujia", variant: "200g" },
  { brand: "Too Yumm", name: "Veggie Stix Multigrain", variant: "60g" },
  { brand: "Bingo", name: "Yumitos Masala", variant: "40g" },
  { brand: "Yellow Diamond", name: "Chips Masala", variant: "90g" },
  { brand: "Cornitos", name: "Nacho Chips", variant: "55g" },
  { brand: "Act II", name: "Instant Popcorn Butter", variant: "33g" },

  // ── Packaged tea (extended) ──
  { brand: "Tata Tea", name: "Gold", variant: "500g" },
  { brand: "Tata Tea", name: "Chakra Gold", variant: "250g" },
  { brand: "Red Label", name: "Tea", variant: "500g" },
  { brand: "Brooke Bond", name: "3 Roses Tea", variant: "250g" },
  { brand: "Lipton", name: "Yellow Label Tea", variant: "250g" },
  { brand: "Wagh Bakri", name: "Special Tea", variant: "500g" },
  { brand: "Patanjali", name: "Danedar Chai", variant: "250g" },
  { brand: "Organic India", name: "Tulsi Green Tea", variant: "25 bags" },
  { brand: "Twinings", name: "Earl Grey Tea", variant: "25 bags" },

  // ── Toothpaste (extended) ──
  { brand: "Colgate", name: "MaxFresh Blue Gel", variant: "150g" },
  { brand: "Colgate", name: "Total Advance Health", variant: "120g" },
  { brand: "Colgate", name: "Vedshakti", variant: "200g" },
  { brand: "Colgate", name: "Active Salt", variant: "100g" },
  { brand: "Closeup", name: "Ever Fresh Gel", variant: "200g" },
  { brand: "Pepsodent", name: "Expert Protection", variant: "150g" },
  { brand: "Himalaya", name: "Neem Toothpaste", variant: "200g" },
  { brand: "Oral-B", name: "Pro-Health Toothpaste", variant: "150g" },
  { brand: "Signal", name: "Complete Care Toothpaste", variant: "160g" },

  // ── Chocolate (extended) ──
  { brand: "Cadbury", name: "Silk Oreo", variant: "130g" },
  { brand: "Cadbury", name: "Dairy Milk Crackle", variant: "40g" },
  { brand: "Amul", name: "Milk Chocolate", variant: "150g" },
  { brand: "Lindt", name: "Excellence Dark 70%", variant: "100g" },
  { brand: "Nestlé", name: "Éclairs Chocolate", variant: "27g" },
  { brand: "Hershey's", name: "Kisses Milk Chocolate", variant: "100g" },
  { brand: "Mars", name: "Chocolate Bar", variant: "51g" },
  { brand: "Kit Kat", name: "Chunky", variant: "40g" },

  // ── Shampoo (extended) ──
  { brand: "L'Oréal", name: "Total Repair 5 Shampoo", variant: "175ml" },
  { brand: "Biotique", name: "Bio Kelp Protein Shampoo", variant: "120ml" },
  { brand: "Himalaya", name: "Damage Repair Shampoo", variant: "200ml" },
  { brand: "Mamaearth", name: "Onion Shampoo", variant: "200ml" },
  { brand: "WOW", name: "Apple Cider Vinegar Shampoo", variant: "300ml" },
  { brand: "Tresemme", name: "Moisture Rich Shampoo", variant: "185ml" },
  { brand: "Garnier", name: "Fructis Strengthening Shampoo", variant: "175ml" },

  // ── Skin cream & lotion (extended) ──
  { brand: "Olay", name: "Total Effects Cream", variant: "50g" },
  { brand: "L'Oréal", name: "Skin Perfect Cream", variant: "30ml" },
  { brand: "Cetaphil", name: "Moisturizing Cream", variant: "80g" },
  { brand: "Mamaearth", name: "Ubtan Face Cream", variant: "100ml" },
  { brand: "Neutrogena", name: "Deep Moisture Lotion", variant: "200ml" },
  { brand: "Simple", name: "Kind to Skin Moisturiser", variant: "125ml" },
  { brand: "WOW", name: "Vitamin C Face Cream", variant: "50ml" },
  { brand: "Biotique", name: "Bio Almond Soothing Cream", variant: "50g" },

  // ── Cooking oil (extended) ──
  { brand: "Parachute", name: "Coconut Oil", variant: "500ml" },
  { brand: "Parachute", name: "Coconut Oil", variant: "1L" },
  { brand: "Engine", name: "Coconut Oil", variant: "500ml" },
  { brand: "Saffola", name: "Active Pro Weight Watchers Oil", variant: "1L" },
  { brand: "Emami", name: "Healthy & Tasty Rice Bran Oil", variant: "1L" },
  { brand: "Patanjali", name: "Mustard Oil", variant: "1L" },
  { brand: "Borges", name: "Olive Oil", variant: "500ml" },
  { brand: "Disano", name: "Olive Oil", variant: "500ml" },
  { brand: "KS Gold", name: "Refined Sunflower Oil", variant: "1L" },

  // ── Instant coffee (extended) ──
  { brand: "Nescafé", name: "Gold Blend Coffee", variant: "50g" },
  { brand: "Nescafé", name: "Mellow & Sweet Coffee", variant: "50g" },
  { brand: "Bru", name: "Gold Instant Coffee", variant: "50g" },
  { brand: "Bru", name: "Select Coffee", variant: "50g" },
  { brand: "Tata Coffee", name: "Premium Instant Coffee", variant: "100g" },

  // ── Packaged juice (extended) ──
  { brand: "Tropicana", name: "Guava Nectar", variant: "1L" },
  { brand: "Tropicana", name: "Mixed Fruit Juice", variant: "1L" },
  { brand: "Real", name: "Tomato Juice", variant: "1L" },
  { brand: "Real", name: "Guava Juice", variant: "1L" },
  { brand: "Paper Boat", name: "Jaljeera", variant: "250ml" },
  { brand: "Paper Boat", name: "Kokum", variant: "250ml" },
  { brand: "Paper Boat", name: "Mango Panna", variant: "250ml" },
  { brand: "Appy", name: "Fresh Apple Juice", variant: "250ml" },
  { brand: "Dabur", name: "Real Amla Juice", variant: "1L" },
  { brand: "Patanjali", name: "Amla Juice", variant: "500ml" },
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
