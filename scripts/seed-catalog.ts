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

  // ── Bottled water (extended) ──
  { brand: "Bisleri", name: "Mineral Water", variant: "500ml" },
  { brand: "Bisleri", name: "Mineral Water", variant: "250ml" },
  { brand: "Kinley", name: "Water", variant: "500ml" },
  { brand: "Aquafina", name: "Water", variant: "500ml" },
  { brand: "Himalayan", name: "Natural Mineral Water", variant: "750ml" },
  { brand: "Nestlé", name: "Pure Life Water", variant: "500ml" },
  { brand: "Kingfisher", name: "Packaged Drinking Water", variant: "1L" },
  { brand: "Rail Neer", name: "Drinking Water", variant: "500ml" },

  // ── Instant noodles (extended) ──
  { brand: "Maggi", name: "Chilli Chow Noodles", variant: "70g" },
  { brand: "Maggi", name: "Masala Noodles", variant: "280g" },
  { brand: "Yippee", name: "Tricolor Pasta", variant: "65g" },
  { brand: "Ching's Secret", name: "Schezwan Noodles", variant: "60g" },
  { brand: "Ching's Secret", name: "Hakka Noodles", variant: "150g" },
  { brand: "Top Ramen", name: "Curry Noodles", variant: "70g" },
  { brand: "Knorr", name: "Chinese Noodles", variant: "60g" },
  { brand: "Patanjali", name: "Atta Noodles", variant: "240g" },
  { brand: "Sunfeast", name: "Pasta Treat", variant: "65g" },

  // ── Instant coffee (extended) ──
  { brand: "Nescafé", name: "Strong Coffee", variant: "50g" },
  { brand: "Nescafé", name: "Sunrise Insta-Filter Coffee", variant: "50g" },
  { brand: "Bru", name: "Strong Coffee", variant: "50g" },
  { brand: "Bru", name: "Green Label Coffee", variant: "50g" },
  { brand: "Tata Coffee", name: "Kaapi Smart Powder", variant: "100g" },
  { brand: "Continental Coffee", name: "Gold Coffee", variant: "50g" },

  // ── Detergent powder (extended) ──
  { brand: "Surf Excel", name: "Easy Wash Detergent", variant: "2kg" },
  { brand: "Ariel", name: "Matic Front Load", variant: "1kg" },
  { brand: "Tide", name: "Plus Lemon & Mint", variant: "1kg" },
  { brand: "Rin", name: "Advance Bar", variant: "250g" },
  { brand: "Nirma", name: "Washing Powder", variant: "500g" },
  { brand: "Ghadi", name: "Detergent Powder", variant: "500g" },
  { brand: "Henkel", name: "Henko Stain Champion", variant: "2kg" },
  { brand: "Ezee", name: "Liquid Detergent", variant: "500ml" },

  // ── Packaged milk (extended) ──
  { brand: "Amul", name: "Gold Full Cream Milk", variant: "1L" },
  { brand: "Amul", name: "Taaza Toned Milk", variant: "1L" },
  { brand: "Mother Dairy", name: "Full Cream Milk", variant: "500ml" },
  { brand: "Nestlé", name: "a+ Full Cream Milk", variant: "500ml" },
  { brand: "Nandini", name: "Full Cream Milk", variant: "500ml" },
  { brand: "Heritage", name: "Full Cream Milk", variant: "500ml" },
  { brand: "Milma", name: "Toned Milk", variant: "500ml" },

  // ── Shampoo (extended) ──
  { brand: "Sunsilk", name: "Soft & Smooth Shampoo", variant: "180ml" },
  { brand: "Vatika", name: "Enriched Coconut Shampoo", variant: "200ml" },
  { brand: "Nyle", name: "Herbal Shampoo", variant: "200ml" },
  { brand: "Head & Shoulders", name: "Cool Menthol Shampoo", variant: "180ml" },
  { brand: "Pantene", name: "Hair Fall Control Shampoo", variant: "180ml" },
  { brand: "Garnier", name: "Ultra Blends Shampoo", variant: "175ml" },
  { brand: "L'Oréal", name: "Hair Fall Repair Shampoo", variant: "175ml" },
  { brand: "Tresemme", name: "Hair Fall Defence Shampoo", variant: "185ml" },
  { brand: "Dove", name: "Hair Fall Rescue Shampoo", variant: "180ml" },

  // ── Bar soap (extended) ──
  { brand: "Lux", name: "Purple Lotus Soap", variant: "100g" },
  { brand: "Dove", name: "Deeply Nourishing Bar", variant: "100g" },
  { brand: "Rexona", name: "Active Fresh Soap", variant: "125g" },
  { brand: "Johnson's", name: "Baby Soap", variant: "100g" },
  { brand: "Himalaya", name: "Neem & Turmeric Soap", variant: "75g" },
  { brand: "Fiama", name: "Di Wills Soap", variant: "100g" },
  { brand: "Godrej", name: "No.1 Lime Soap", variant: "100g" },

  // ── Packaged tea (extended) ──
  { brand: "Tata Tea", name: "Agni Strong Tea", variant: "500g" },
  { brand: "Wagh Bakri", name: "Masala Chai", variant: "250g" },
  { brand: "Lipton", name: "Honey Lemon Green Tea", variant: "25 bags" },
  { brand: "Society Tea", name: "Gold Tea", variant: "500g" },
  { brand: "Brooke Bond", name: "Taj Mahal Tea", variant: "500g" },
  { brand: "Tetley", name: "Long Leaf Tea", variant: "250g" },
  { brand: "Girnar", name: "Masala Chai", variant: "250g" },
  { brand: "Patanjali", name: "Tulsi Green Tea", variant: "25 bags" },
  { brand: "Organic India", name: "Classic Green Tea", variant: "25 bags" },

  // ── Toothpaste (extended) ──
  { brand: "Colgate", name: "Sparkling White", variant: "200g" },
  { brand: "Colgate", name: "Kids Bubble Fruit", variant: "80g" },
  { brand: "Pepsodent", name: "Whitening Toothpaste", variant: "150g" },
  { brand: "Dabur", name: "Meswak Toothpaste", variant: "200g" },
  { brand: "Himalaya", name: "Whitening Toothpaste", variant: "100g" },
  { brand: "Patanjali", name: "Dant Kanti Advanced", variant: "200g" },
  { brand: "Oral-B", name: "Complete Care Toothpaste", variant: "40g" },

  // ── Chocolate (extended) ──
  { brand: "Cadbury", name: "Dairy Milk Silk", variant: "60g" },
  { brand: "Cadbury", name: "Celebrations Gift Pack", variant: "186g" },
  { brand: "Nestlé", name: "KitKat", variant: "73g" },
  { brand: "Nestlé", name: "Munch Pop Choc", variant: "50g" },
  { brand: "Ferrero Rocher", name: "T16 Box", variant: "200g" },
  { brand: "Amul", name: "Fruit & Nut Chocolate", variant: "150g" },
  { brand: "Hershey's", name: "Milk Chocolate Bar", variant: "40g" },
  { brand: "Lindt", name: "Lindor Milk Chocolate", variant: "200g" },

  // ── Skin cream & lotion (extended) ──
  { brand: "Pond's", name: "Bright Beauty Cream", variant: "50g" },
  { brand: "Vaseline", name: "Intensive Care Lotion", variant: "400ml" },
  { brand: "Lakme", name: "Absolute Matte Lotion", variant: "60ml" },
  { brand: "Dove", name: "Body Lotion", variant: "200ml" },
  { brand: "Parachute", name: "Advansed Body Lotion", variant: "250ml" },
  { brand: "Himalaya", name: "Soothing & Moisturizing Lotion", variant: "200ml" },
  { brand: "Nivea", name: "Body Lotion", variant: "200ml" },
  { brand: "Biotique", name: "Bio Papaya Scrub", variant: "75g" },

  // ── Cooking oil (extended) ──
  { brand: "Fortune", name: "Sunflower Oil", variant: "5L" },
  { brand: "Saffola", name: "Gold Oil", variant: "5L" },
  { brand: "P Mark", name: "Kachi Ghani Mustard Oil", variant: "1L" },
  { brand: "Patanjali", name: "Mustard Oil", variant: "5L" },
  { brand: "Emami", name: "Healthy & Tasty Sunflower Oil", variant: "1L" },
  { brand: "Gemini", name: "Refined Sunflower Oil", variant: "5L" },

  // ── Chips & namkeen (extended) ──
  { brand: "Haldiram's", name: "Khatta Meetha", variant: "200g" },
  { brand: "Haldiram's", name: "Mixture", variant: "200g" },
  { brand: "Haldiram's", name: "Chana Dal", variant: "150g" },
  { brand: "Bikaji", name: "Khatta Meetha Mix", variant: "200g" },
  { brand: "Balaji", name: "Wafers Chilli", variant: "55g" },
  { brand: "Lay's", name: "India's Magic Masala", variant: "52g" },
  { brand: "Kurkure", name: "Trianglez", variant: "60g" },
  { brand: "Bingo", name: "No Rulz Noodles Style", variant: "70g" },
  { brand: "Parle", name: "Wafers Salted", variant: "50g" },

  // ── Packaged juice (extended) ──
  { brand: "Real", name: "Apple Juice", variant: "1L" },
  { brand: "Real", name: "Orange Juice", variant: "1L" },
  { brand: "Paper Boat", name: "Rose Sharbat", variant: "250ml" },
  { brand: "Paper Boat", name: "Thandai", variant: "250ml" },
  { brand: "B Natural", name: "Pomegranate Juice", variant: "1L" },
  { brand: "Tropicana", name: "Apple Juice", variant: "1L" },
  { brand: "Dabur", name: "Real Pomegranate Juice", variant: "1L" },

  // ── Biscuits (extended) ──
  { brand: "Britannia", name: "Good Day Butter", variant: "200g" },
  { brand: "Britannia", name: "NutriChoice Sugar Free", variant: "100g" },
  { brand: "Britannia", name: "Little Hearts", variant: "75g" },
  { brand: "Parle", name: "Cream Cracker", variant: "100g" },
  { brand: "Parle", name: "Fab Choco Fills", variant: "75g" },
  { brand: "Sunfeast", name: "Mom's Magic Cashew & Almond", variant: "200g" },
  { brand: "Oreo", name: "Strawberry Cream", variant: "120g" },
  { brand: "McVitie's", name: "Gold Biscuits", variant: "250g" },
  { brand: "Dukes", name: "Waffy Vanilla", variant: "75g" },

  // ── Carbonated soft drinks (extended) ──
  { brand: "Coca-Cola", name: "Original", variant: "600ml" },
  { brand: "Pepsi", name: "Cola", variant: "600ml" },
  { brand: "Thums Up", name: "Strong", variant: "600ml" },
  { brand: "Sprite", name: "Lime", variant: "600ml" },
  { brand: "Pepsi", name: "Black Zero Sugar", variant: "330ml" },
  { brand: "Coca-Cola", name: "Zero Sugar", variant: "330ml" },
  { brand: "Mountain Dew", name: "Cola", variant: "600ml" },
  { brand: "Appy Fizz", name: "Apple Drink", variant: "600ml" },

  // ── Top-up to 400 ──
  { brand: "Maggi", name: "Masala Noodles", variant: "560g" },
  { brand: "Britannia", name: "50-50 Sweet & Salty", variant: "200g" },
  { brand: "Parle", name: "Hide & Seek Milano", variant: "100g" },
  { brand: "Colgate", name: "Zig Zag Charcoal Toothbrush", variant: "1 pc" },
  { brand: "Nescafé", name: "Classic Coffee", variant: "200g" },
  { brand: "Tata Tea", name: "Premium", variant: "1kg" },
  { brand: "Wagh Bakri", name: "Premium Tea", variant: "1kg" },
  { brand: "Amul", name: "Taaza Toned Milk", variant: "1L" },
  { brand: "Surf Excel", name: "Matic Liquid", variant: "1L" },
  { brand: "Ariel", name: "Matic Liquid", variant: "1L" },
  { brand: "Himalaya", name: "Protein Shampoo", variant: "200ml" },
  { brand: "Dove", name: "Elixir Hair Oil", variant: "100ml" },
  { brand: "Fortune", name: "Soyabean Oil", variant: "5L" },
  { brand: "Parachute", name: "Coconut Oil", variant: "200ml" },
  { brand: "Cadbury", name: "Dairy Milk", variant: "160g" },
  { brand: "Haldiram's", name: "Takatak Mix", variant: "150g" },
  { brand: "Lay's", name: "Spanish Tomato Tango", variant: "52g" },
  { brand: "Tropicana", name: "Orange Juice", variant: "200ml" },
  { brand: "Paper Boat", name: "Nimbu Pani", variant: "250ml" },
  { brand: "Real", name: "Mixed Fruit Juice", variant: "200ml" },

  // ── High-demand pre-seed (post-launch searches) ──
  // Hygiene / healthcare
  { brand: "Dettol", name: "Antiseptic Liquid", variant: "250ml" },
  { brand: "Dettol", name: "Handwash", variant: "200ml" },
  { brand: "Savlon", name: "Antiseptic Liquid", variant: "200ml" },
  // Patanjali vs mainstream — comparison bait
  { brand: "Patanjali", name: "Dant Kanti Natural Toothpaste", variant: "200g" },
  { brand: "Patanjali", name: "Kesh Kanti Hair Oil", variant: "200ml" },
  { brand: "Patanjali", name: "Saundarya Aloe Vera Gel", variant: "150ml" },
  // Dairy
  { brand: "Amul", name: "Butter", variant: "500g" },
  { brand: "Amul", name: "Processed Cheese", variant: "200g" },
  { brand: "Amul", name: "Dahi", variant: "400g" },
  { brand: "Mother Dairy", name: "Mishti Doi", variant: "100g" },
  // Snacks people search
  { brand: "Haldiram's", name: "Bhel", variant: "200g" },
  { brand: "Haldiram's", name: "Chaat Chaska", variant: "150g" },
  { brand: "Bikaji", name: "Namkeen Mixture", variant: "200g" },
  { brand: "Bingo", name: "Mad Angles Achaari Masti", variant: "90g" },
  // Beverages
  { brand: "Horlicks", name: "Health & Nutrition Drink", variant: "500g" },
  { brand: "Bournvita", name: "Health Drink", variant: "500g" },
  { brand: "Complan", name: "Nutrition Drink", variant: "500g" },
  { brand: "Boost", name: "Health Drink", variant: "500g" },
  // More soft drinks
  { brand: "Limca", name: "Lemon", variant: "600ml" },
  { brand: "Fanta", name: "Orange", variant: "600ml" },
  // Noodles variants
  { brand: "Maggi", name: "Oats Noodles", variant: "75g" },
  { brand: "Yippee", name: "Long Slurpy Noodles", variant: "70g" },
  // Oils
  { brand: "Dabur", name: "Vatika Hair Oil", variant: "300ml" },
  { brand: "Parachute", name: "Advansed Jasmine Hair Oil", variant: "300ml" },

  // ── Atta & wheat flour ──
  { brand: "Aashirvaad", name: "Whole Wheat Atta", variant: "5kg" },
  { brand: "Aashirvaad", name: "Whole Wheat Atta", variant: "1kg" },
  { brand: "Aashirvaad", name: "Multigrain Atta", variant: "5kg" },
  { brand: "Pilsbury", name: "Chakki Fresh Atta", variant: "5kg" },
  { brand: "Shakti Bhog", name: "Whole Wheat Atta", variant: "10kg" },
  { brand: "Fortune", name: "Chakki Fresh Atta", variant: "5kg" },
  { brand: "Annapurna", name: "Atta", variant: "5kg" },
  { brand: "Patanjali", name: "Sampoorn Chakki Atta", variant: "5kg" },
  { brand: "Rajdhani", name: "Whole Wheat Atta", variant: "5kg" },
  { brand: "Tata Sampann", name: "Unpolished Whole Wheat Atta", variant: "5kg" },

  // ── Spices & masala ──
  { brand: "MDH", name: "Chaat Masala", variant: "100g" },
  { brand: "MDH", name: "Rajma Masala", variant: "100g" },
  { brand: "MDH", name: "Garam Masala", variant: "100g" },
  { brand: "MDH", name: "Chicken Masala", variant: "100g" },
  { brand: "MDH", name: "Chole Masala", variant: "100g" },
  { brand: "Everest", name: "Chaat Masala", variant: "100g" },
  { brand: "Everest", name: "Chicken Masala", variant: "100g" },
  { brand: "Everest", name: "Garam Masala", variant: "100g" },
  { brand: "Catch", name: "Black Pepper Powder", variant: "100g" },
  { brand: "Catch", name: "Chaat Masala", variant: "100g" },
  { brand: "Tata Sampann", name: "Turmeric Powder", variant: "200g" },
  { brand: "Tata Sampann", name: "Chilli Powder", variant: "200g" },
  { brand: "Badshah", name: "Pav Bhaji Masala", variant: "100g" },
  { brand: "Badshah", name: "Kitchen King Masala", variant: "100g" },
  { brand: "Suhana", name: "Biryani Masala", variant: "50g" },

  // ── Energy drinks (CSD category) ──
  { brand: "Sting", name: "Energy Drink", variant: "250ml" },
  { brand: "Sting", name: "Energy Drink", variant: "500ml" },
  { brand: "Monster Energy", name: "Original", variant: "330ml" },
  { brand: "Red Bull", name: "Energy Drink", variant: "250ml" },
  { brand: "Hell Energy", name: "Original", variant: "250ml" },

  // ── Face wash (skin_cream category) ──
  { brand: "Himalaya", name: "Purifying Neem Face Wash", variant: "150ml" },
  { brand: "Garnier", name: "Bright Complete Face Wash", variant: "100ml" },
  { brand: "Ponds", name: "Bright Beauty Face Wash", variant: "100ml" },
  { brand: "Neutrogena", name: "Deep Clean Face Wash", variant: "100ml" },
  { brand: "Clean & Clear", name: "Morning Energy Face Wash", variant: "100ml" },
  { brand: "Cetaphil", name: "Gentle Skin Cleanser", variant: "125ml" },
  { brand: "Mamaearth", name: "Vitamin C Face Wash", variant: "100ml" },
  { brand: "Wow", name: "Ubtan Face Wash", variant: "100ml" },
  { brand: "Patanjali", name: "Aloe Vera Face Wash", variant: "60ml" },

  // ── More dairy ──
  { brand: "Amul", name: "Pure Ghee", variant: "500ml" },
  { brand: "Amul", name: "Pure Ghee", variant: "1L" },
  { brand: "Mother Dairy", name: "Pure Ghee", variant: "500ml" },
  { brand: "Nestlé", name: "Milkmaid Sweetened Condensed Milk", variant: "400g" },
  { brand: "Amul", name: "Fresh Cream", variant: "200ml" },
  { brand: "Amul", name: "Taaza Full Cream Milk", variant: "1L" },
  { brand: "Nandini", name: "Full Cream Milk", variant: "500ml" },

  // ── More liquid soap ──
  { brand: "Lifebuoy", name: "Total Handwash", variant: "190ml" },
  { brand: "Himalaya", name: "Pure Hands Handwash", variant: "250ml" },
  { brand: "Dettol", name: "Skincare Handwash", variant: "250ml" },
  { brand: "Pears", name: "Soft & Fresh Handwash", variant: "250ml" },

  // ── More health drinks ──
  { brand: "Horlicks", name: "Health & Nutrition Drink", variant: "1kg" },
  { brand: "Bournvita", name: "Health Drink", variant: "1kg" },
  { brand: "Complan", name: "Nutrition Drink", variant: "1kg" },
  { brand: "Protinex", name: "Tasty Chocolate Drink", variant: "400g" },
  { brand: "Pediasure", name: "Nutrition Drink", variant: "400g" },

  // ── Hair oil ──
  { brand: "Parachute", name: "Coconut Hair Oil", variant: "175ml" },
  { brand: "Parachute", name: "Advansed Coconut Hair Oil", variant: "300ml" },
  { brand: "Parachute", name: "Advansed Jasmine Hair Oil", variant: "175ml" },
  { brand: "Parachute", name: "Advansed Aloe Vera Hair Oil", variant: "150ml" },
  { brand: "Nihar", name: "Naturals Shanti Amla Hair Oil", variant: "175ml" },
  { brand: "Nihar", name: "Naturals Coconut Hair Oil", variant: "175ml" },
  { brand: "Dabur", name: "Amla Hair Oil", variant: "275ml" },
  { brand: "Dabur", name: "Amla Hair Oil", variant: "450ml" },
  { brand: "Dabur", name: "Vatika Enriched Coconut Hair Oil", variant: "300ml" },
  { brand: "Dabur", name: "Almond Hair Oil", variant: "200ml" },
  { brand: "Bajaj", name: "Almond Drops Hair Oil", variant: "200ml" },
  { brand: "Bajaj", name: "Brahmi Amla Hair Oil", variant: "200ml" },
  { brand: "Navratna", name: "Cool Hair Oil", variant: "200ml" },
  { brand: "Navratna", name: "Ayurvedic Cool Hair Oil", variant: "100ml" },
  { brand: "Keo Karpin", name: "Hair Oil", variant: "200ml" },
  { brand: "Indulekha", name: "Bringha Hair Oil", variant: "100ml" },
  { brand: "Kesh King", name: "Ayurvedic Hair Oil", variant: "100ml" },
  { brand: "Sesa", name: "Ayurvedic Hair Oil", variant: "200ml" },
  { brand: "Hair & Care", name: "Aloe Vera Hair Oil", variant: "300ml" },
  { brand: "Patanjali", name: "Kesh Kanti Hair Oil", variant: "120ml" },
  { brand: "Patanjali", name: "Almond Hair Oil", variant: "100ml" },
  { brand: "Himalaya", name: "Anti-Hair Fall Hair Oil", variant: "200ml" },
  { brand: "WOW", name: "Onion Hair Oil", variant: "200ml" },
  { brand: "Mamaearth", name: "Onion Hair Oil", variant: "150ml" },

  // ── Rice ──
  { brand: "India Gate", name: "Basmati Rice Classic", variant: "1kg" },
  { brand: "India Gate", name: "Basmati Rice Super", variant: "5kg" },
  { brand: "Daawat", name: "Rozana Basmati Rice", variant: "5kg" },
  { brand: "Daawat", name: "Super Basmati Rice", variant: "1kg" },
  { brand: "Kohinoor", name: "Super Silver Basmati Rice", variant: "1kg" },
  { brand: "Fortune", name: "Everyday Basmati Rice", variant: "5kg" },
  { brand: "Lal Qilla", name: "Basmati Rice", variant: "1kg" },
  { brand: "Tata Sampann", name: "Sona Masoori Rice", variant: "5kg" },
  { brand: "Shrilalmahal", name: "Empire Basmati Rice", variant: "1kg" },
  { brand: "Double Horse", name: "Matta Rice", variant: "5kg" },
  { brand: "Tilda", name: "Pure Basmati Rice", variant: "1kg" },

  // ── Pulses & dal ──
  { brand: "Tata Sampann", name: "Toor Dal", variant: "1kg" },
  { brand: "Tata Sampann", name: "Moong Dal", variant: "1kg" },
  { brand: "Tata Sampann", name: "Chana Dal", variant: "1kg" },
  { brand: "Tata Sampann", name: "Urad Dal", variant: "500g" },
  { brand: "Tata Sampann", name: "Masoor Dal", variant: "1kg" },
  { brand: "Fortune", name: "Toor Dal", variant: "1kg" },
  { brand: "Fortune", name: "Moong Dal", variant: "1kg" },
  { brand: "Organic Tattva", name: "Toor Dal", variant: "500g" },
  { brand: "Organic Tattva", name: "Chana Dal", variant: "500g" },
  { brand: "Patanjali", name: "Arhar Dal", variant: "1kg" },

  // ── Edible salt ──
  { brand: "Tata Salt", name: "Iodised Salt", variant: "1kg" },
  { brand: "Tata Salt", name: "Lite Low Sodium Salt", variant: "1kg" },
  { brand: "Aashirvaad", name: "Iodised Salt", variant: "1kg" },
  { brand: "Nirma", name: "Shudh Iodised Salt", variant: "1kg" },
  { brand: "Tata Salt", name: "Rock Salt Sendha Namak", variant: "1kg" },
  { brand: "Patanjali", name: "Sendha Namak", variant: "1kg" },
  { brand: "Surya", name: "Crystal Salt", variant: "1kg" },

  // ── Sugar ──
  { brand: "Madhur", name: "Pure & Hygienic Sugar", variant: "1kg" },
  { brand: "Madhur", name: "Pure & Hygienic Sugar", variant: "5kg" },
  { brand: "Dhampure", name: "Sulphurless Sugar", variant: "1kg" },
  { brand: "Trust", name: "Sulphurless Sugar", variant: "1kg" },
  { brand: "Uttam", name: "Sugar", variant: "1kg" },
  { brand: "Mawana", name: "Sulphurless Sugar", variant: "1kg" },
  { brand: "Madhur", name: "Brown Sugar", variant: "500g" },
  { brand: "Trust", name: "Icing Sugar", variant: "500g" },

  // ── Sauces & ketchup ──
  { brand: "Kissan", name: "Fresh Tomato Ketchup", variant: "950g" },
  { brand: "Kissan", name: "No Onion No Garlic Ketchup", variant: "850g" },
  { brand: "Maggi", name: "Rich Tomato Ketchup", variant: "900g" },
  { brand: "Heinz", name: "Tomato Ketchup", variant: "700g" },
  { brand: "Veeba", name: "Tomato Ketchup", variant: "950g" },
  { brand: "Veeba", name: "Sweet Onion Sauce", variant: "350g" },
  { brand: "Del Monte", name: "Tomato Ketchup", variant: "900g" },
  { brand: "Ching's Secret", name: "Schezwan Chutney", variant: "250g" },
  { brand: "Ching's Secret", name: "Green Chilli Sauce", variant: "190g" },
  { brand: "Wingreens", name: "Pizza Pasta Sauce", variant: "450g" },
  { brand: "Cremica", name: "Tomato Ketchup", variant: "1kg" },

  // ── Pickle & achaar ──
  { brand: "Mother's Recipe", name: "Mango Pickle", variant: "300g" },
  { brand: "Mother's Recipe", name: "Mixed Pickle", variant: "300g" },
  { brand: "Mother's Recipe", name: "Lime Pickle", variant: "300g" },
  { brand: "Priya", name: "Avakkai Mango Pickle", variant: "300g" },
  { brand: "Priya", name: "Gongura Pickle", variant: "300g" },
  { brand: "Nilon's", name: "Mango Pickle", variant: "350g" },
  { brand: "Bedekar", name: "Mango Pickle", variant: "400g" },
  { brand: "Patanjali", name: "Mixed Achaar", variant: "500g" },
  { brand: "Tops", name: "Mango Pickle", variant: "400g" },
  { brand: "Ruchi", name: "Gongura Pickle", variant: "300g" },

  // ── Jam & spreads ──
  { brand: "Kissan", name: "Mixed Fruit Jam", variant: "500g" },
  { brand: "Kissan", name: "Strawberry Jam", variant: "200g" },
  { brand: "Mapro", name: "Mixed Fruit Jam", variant: "500g" },
  { brand: "Mapro", name: "Strawberry Jam", variant: "200g" },
  { brand: "Pintola", name: "Peanut Butter Creamy", variant: "1kg" },
  { brand: "Sundrop", name: "Peanut Butter Crunchy", variant: "462g" },
  { brand: "Hershey's", name: "Chocolate Spread", variant: "350g" },
  { brand: "Nutella", name: "Hazelnut Spread", variant: "350g" },
  { brand: "Veeba", name: "Peanut Butter", variant: "400g" },

  // ── Honey ──
  { brand: "Dabur", name: "Honey", variant: "500g" },
  { brand: "Dabur", name: "Honey", variant: "1kg" },
  { brand: "Patanjali", name: "Pure Honey", variant: "500g" },
  { brand: "Apis", name: "Himalaya Honey", variant: "500g" },
  { brand: "Saffola", name: "Honey Active", variant: "500g" },
  { brand: "Zandu", name: "Pure Honey", variant: "500g" },
  { brand: "Himalaya", name: "Forest Honey", variant: "350g" },
  { brand: "Hitkari", name: "Natural Honey", variant: "500g" },

  // ── Breakfast cereal ──
  { brand: "Kellogg's", name: "Corn Flakes", variant: "475g" },
  { brand: "Kellogg's", name: "Chocos", variant: "375g" },
  { brand: "Kellogg's", name: "Muesli Fruit & Nut", variant: "500g" },
  { brand: "Bagrry's", name: "Crunchy Muesli", variant: "500g" },
  { brand: "Bagrry's", name: "White Oats", variant: "1kg" },
  { brand: "Saffola", name: "Masala Oats", variant: "400g" },
  { brand: "Saffola", name: "Classic Oats", variant: "1kg" },
  { brand: "Quaker", name: "Oats", variant: "1kg" },
  { brand: "Soulfull", name: "Millet Muesli", variant: "400g" },
  { brand: "Kellogg's", name: "Corn Flakes", variant: "875g" },
  { brand: "Nestlé", name: "Koko Krunch", variant: "300g" },
  { brand: "True Elements", name: "Rolled Oats", variant: "1.2kg" },

  // ── Pasta & vermicelli ──
  { brand: "Sunfeast", name: "Yippee Pasta Tricolor", variant: "65g" },
  { brand: "Bambino", name: "Vermicelli Roasted", variant: "900g" },
  { brand: "Bambino", name: "Macaroni", variant: "400g" },
  { brand: "Weikfield", name: "Penne Pasta", variant: "400g" },
  { brand: "Weikfield", name: "Macaroni Pasta", variant: "400g" },
  { brand: "Borges", name: "Penne Rigate Pasta", variant: "500g" },
  { brand: "Borges", name: "Spaghetti", variant: "500g" },
  { brand: "Del Monte", name: "Fusilli Pasta", variant: "500g" },
  { brand: "MTR", name: "Roasted Vermicelli", variant: "440g" },
  { brand: "Bambino", name: "Seviyan", variant: "400g" },

  // ── Ice cream ──
  { brand: "Amul", name: "Vanilla Ice Cream", variant: "1L" },
  { brand: "Amul", name: "Butterscotch Ice Cream", variant: "1L" },
  { brand: "Amul", name: "Chocolate Ice Cream Tub", variant: "700ml" },
  { brand: "Kwality Wall's", name: "Cornetto Chocolate", variant: "110ml" },
  { brand: "Kwality Wall's", name: "Cassata", variant: "700ml" },
  { brand: "Vadilal", name: "Vanilla Ice Cream", variant: "1L" },
  { brand: "Vadilal", name: "Gulab Jamun Ice Cream", variant: "1L" },
  { brand: "Mother Dairy", name: "Vanilla Ice Cream", variant: "1L" },
  { brand: "Havmor", name: "Rajbhog Ice Cream", variant: "1L" },
  { brand: "Cream Bell", name: "Butterscotch Ice Cream", variant: "1L" },
  { brand: "Baskin Robbins", name: "Choco Almond Ice Cream", variant: "450ml" },

  // ── Frozen foods ──
  { brand: "McCain", name: "French Fries", variant: "420g" },
  { brand: "McCain", name: "Smiles", variant: "415g" },
  { brand: "McCain", name: "Aloo Tikki", variant: "400g" },
  { brand: "Safal", name: "Green Peas", variant: "500g" },
  { brand: "Safal", name: "Mixed Vegetables", variant: "500g" },
  { brand: "ITC Master Chef", name: "Chicken Nuggets", variant: "400g" },
  { brand: "Godrej Yummiez", name: "Veg Fingers", variant: "400g" },
  { brand: "Godrej Yummiez", name: "Chicken Nuggets", variant: "400g" },
  { brand: "McCain", name: "Veg Spring Roll", variant: "400g" },

  // ── Bread & bakery ──
  { brand: "Britannia", name: "Brown Bread", variant: "400g" },
  { brand: "Britannia", name: "Whole Wheat Bread", variant: "400g" },
  { brand: "Britannia", name: "Bread Pav", variant: "400g" },
  { brand: "Modern", name: "Milk Bread", variant: "400g" },
  { brand: "Harvest Gold", name: "Sandwich Bread", variant: "400g" },
  { brand: "English Oven", name: "Multigrain Bread", variant: "400g" },
  { brand: "Bonn", name: "Brown Bread", variant: "400g" },
  { brand: "Britannia", name: "Toastea Rusk", variant: "300g" },
  { brand: "Parle", name: "Rusk", variant: "300g" },

  // ── Dishwash ──
  { brand: "Vim", name: "Dishwash Bar", variant: "300g" },
  { brand: "Vim", name: "Dishwash Gel Lemon", variant: "500ml" },
  { brand: "Exo", name: "Dishwash Bar", variant: "300g" },
  { brand: "Exo", name: "Dishwash Gel", variant: "500ml" },
  { brand: "Pril", name: "Dishwash Liquid", variant: "425ml" },
  { brand: "Patanjali", name: "Dishwash Bar", variant: "200g" },
  { brand: "Xpert", name: "Dishwash Bar", variant: "300g" },
  { brand: "Vim", name: "Dishwash Liquid Refill", variant: "1.8L" },

  // ── Floor & toilet cleaner ──
  { brand: "Harpic", name: "Power Plus Toilet Cleaner", variant: "1L" },
  { brand: "Harpic", name: "Disinfectant Toilet Cleaner", variant: "500ml" },
  { brand: "Lizol", name: "Floor Cleaner Citrus", variant: "975ml" },
  { brand: "Lizol", name: "Floor Cleaner Floral", variant: "500ml" },
  { brand: "Domex", name: "Toilet Cleaner", variant: "1L" },
  { brand: "Colin", name: "Glass Cleaner", variant: "500ml" },
  { brand: "Patanjali", name: "Floor Cleaner", variant: "1L" },
  { brand: "Dettol", name: "Floor Cleaner Jasmine", variant: "1L" },

  // ── Mosquito repellent ──
  { brand: "Good Knight", name: "Activ+ Liquid Vaporiser", variant: "45ml" },
  { brand: "Good Knight", name: "Gold Flash Refill", variant: "45ml" },
  { brand: "All Out", name: "Ultra Liquid Vaporiser", variant: "45ml" },
  { brand: "Mortein", name: "Insta5 Liquid Vaporiser", variant: "45ml" },
  { brand: "Hit", name: "Anti Mosquito Spray", variant: "400ml" },
  { brand: "Good Knight", name: "Coil", variant: "10 coils" },
  { brand: "Odomos", name: "Mosquito Repellent Cream", variant: "100g" },
  { brand: "Mortein", name: "Mosquito Coil", variant: "10 coils" },

  // ── Agarbatti & dhoop ──
  { brand: "Cycle", name: "Three in One Agarbatti", variant: "100 sticks" },
  { brand: "Cycle", name: "Lia Floral Agarbatti", variant: "100 sticks" },
  { brand: "Mangaldeep", name: "Sandal Agarbatti", variant: "100 sticks" },
  { brand: "Mangaldeep", name: "Tulsi Dhoop", variant: "20 sticks" },
  { brand: "Zed Black", name: "Manthan Agarbatti", variant: "100 sticks" },
  { brand: "Hem", name: "Precious Chandan Incense", variant: "100 sticks" },
  { brand: "Moksh", name: "Sambrani Dhoop Cups", variant: "12 cups" },
  { brand: "Patanjali", name: "Aastha Agarbatti", variant: "100 sticks" },

  // ── Deodorant & perfume ──
  { brand: "Axe", name: "Signature Dark Body Spray", variant: "150ml" },
  { brand: "Fogg", name: "Scent Xpressio Body Spray", variant: "150ml" },
  { brand: "Fogg", name: "Fresh Deodorant", variant: "150ml" },
  { brand: "Engage", name: "Urge Body Spray", variant: "165ml" },
  { brand: "Wild Stone", name: "Ultra Sensual Deodorant", variant: "150ml" },
  { brand: "Park Avenue", name: "Good Morning Deodorant", variant: "150ml" },
  { brand: "Nivea", name: "Fresh Active Deodorant", variant: "150ml" },
  { brand: "Denver", name: "Hamilton Deodorant", variant: "165ml" },
  { brand: "Rexona", name: "Powder Dry Roll On", variant: "50ml" },

  // ── Sanitary pads ──
  { brand: "Whisper", name: "Ultra Clean XL Wings", variant: "30 pads" },
  { brand: "Whisper", name: "Ultra Soft XL+", variant: "15 pads" },
  { brand: "Stayfree", name: "Secure XL Wings", variant: "20 pads" },
  { brand: "Stayfree", name: "Dry Max All Night", variant: "14 pads" },
  { brand: "Sofy", name: "Bodyfit Anti Bacteria XL", variant: "15 pads" },
  { brand: "Nine", name: "Sanitary Napkins XL", variant: "15 pads" },
  { brand: "Sirona", name: "Ultra Thin Sanitary Pads", variant: "15 pads" },
  { brand: "Sanfe", name: "Cottony Soft Pads XL", variant: "15 pads" },

  // ── Baby diapers ──
  { brand: "Pampers", name: "All Round Protection Pants M", variant: "62 pants" },
  { brand: "Pampers", name: "Premium Care Pants L", variant: "44 pants" },
  { brand: "Huggies", name: "Wonder Pants M", variant: "56 pants" },
  { brand: "MamyPoko", name: "Pants Extra Absorb L", variant: "50 pants" },
  { brand: "Teddyy", name: "Easy Diaper Pants M", variant: "54 pants" },
  { brand: "Himalaya", name: "Total Care Baby Pants M", variant: "54 pants" },
  { brand: "Bumtum", name: "Baby Diaper Pants L", variant: "62 pants" },

  // ── Talcum powder ──
  { brand: "Ponds", name: "Dreamflower Talc", variant: "300g" },
  { brand: "Navratna", name: "Cool Talc", variant: "300g" },
  { brand: "Dermicool", name: "Prickly Heat Powder", variant: "150g" },
  { brand: "Gokul", name: "Santoor Talc", variant: "300g" },
  { brand: "Cinthol", name: "Original Talc", variant: "300g" },
  { brand: "Johnson's", name: "Baby Powder", variant: "200g" },
  { brand: "Himalaya", name: "Baby Powder", variant: "200g" },

  // ── Pet food ──
  { brand: "Pedigree", name: "Adult Chicken & Vegetables", variant: "3kg" },
  { brand: "Pedigree", name: "Puppy Chicken & Milk", variant: "1.2kg" },
  { brand: "Drools", name: "Adult Chicken & Egg", variant: "3kg" },
  { brand: "Drools", name: "Puppy Chicken & Egg", variant: "1.2kg" },
  { brand: "Whiskas", name: "Adult Ocean Fish Cat Food", variant: "1.2kg" },
  { brand: "Royal Canin", name: "Maxi Adult Dog Food", variant: "4kg" },
  { brand: "Purepet", name: "Adult Chicken & Vegetable", variant: "3kg" },
  { brand: "Meat Up", name: "Adult Chicken Dog Food", variant: "3kg" },

  // ════════ FILL BATCH 1 — real top SKUs into existing categories ════════

  // ── Biscuits ──
  { brand: "Britannia", name: "Marie Gold", variant: "120g" },
  { brand: "Britannia", name: "Good Day Chocochip Cookies", variant: "150g" },
  { brand: "Britannia", name: "Bourbon Bliss", variant: "100g" },
  { brand: "Britannia", name: "Milk Bikis", variant: "120g" },
  { brand: "Britannia", name: "Treat Cream Biscuit", variant: "120g" },
  { brand: "Parle", name: "20-20 Cashew Cookies", variant: "200g" },
  { brand: "Parle", name: "Happy Happy Choco-Chip", variant: "150g" },
  { brand: "Sunfeast", name: "Bourbon", variant: "100g" },
  { brand: "Sunfeast", name: "Marie Light Oats", variant: "150g" },
  { brand: "Unibic", name: "Choco Chip Cookies", variant: "150g" },
  { brand: "Cadbury", name: "Oreo Vanilla Crème", variant: "150g" },
  { brand: "Patanjali", name: "Marie Biscuit", variant: "250g" },

  // ── Chips & namkeen ──
  { brand: "Lay's", name: "American Style Cream & Onion", variant: "52g" },
  { brand: "Lay's", name: "Chile Limon", variant: "52g" },
  { brand: "Bingo", name: "Original Style Chaat Masala", variant: "90g" },
  { brand: "Kurkure", name: "Chilli Chatka", variant: "90g" },
  { brand: "Haldiram's", name: "Aloo Bhujia", variant: "400g" },
  { brand: "Haldiram's", name: "All in One", variant: "200g" },
  { brand: "Bikaji", name: "Gulab Jamun", variant: "1kg" },
  { brand: "Balaji", name: "Simply Salted Wafers", variant: "55g" },
  { brand: "Pringles", name: "Original", variant: "107g" },
  { brand: "Too Yumm", name: "Karare Masala", variant: "55g" },

  // ── Chocolate ──
  { brand: "Cadbury", name: "Dairy Milk Roast Almond", variant: "36g" },
  { brand: "Cadbury", name: "Fuse", variant: "25g" },
  { brand: "Cadbury", name: "Temptations Almond Treat", variant: "72g" },
  { brand: "Nestlé", name: "Milkybar Moo", variant: "40g" },
  { brand: "Amul", name: "Tropical Orange Chocolate", variant: "150g" },
  { brand: "Lindt", name: "Lindor Assorted", variant: "100g" },
  { brand: "Snickers", name: "Chocolate Bar", variant: "50g" },
  { brand: "Bournville", name: "Rich Cocoa Dark", variant: "80g" },

  // ── Carbonated soft drinks ──
  { brand: "Coca-Cola", name: "Original", variant: "750ml" },
  { brand: "Sprite", name: "Lime", variant: "750ml" },
  { brand: "Thums Up", name: "Charged", variant: "250ml" },
  { brand: "Mountain Dew", name: "Cola", variant: "250ml" },
  { brand: "7Up", name: "Lime", variant: "600ml" },
  { brand: "Sprite", name: "Zero Sugar", variant: "300ml" },
  { brand: "Paper Boat", name: "Fizz Jaljeera", variant: "250ml" },
  { brand: "Bovonto", name: "Grape Soda", variant: "300ml" },

  // ── Shampoo ──
  { brand: "Clinic Plus", name: "Strong & Long Health", variant: "340ml" },
  { brand: "Dove", name: "Dryness Care Shampoo", variant: "340ml" },
  { brand: "Head & Shoulders", name: "Smooth & Silky", variant: "340ml" },
  { brand: "Sunsilk", name: "Stunning Black Shine", variant: "340ml" },
  { brand: "Pantene", name: "Long Black Shampoo", variant: "340ml" },
  { brand: "Tresemme", name: "Keratin Smooth", variant: "580ml" },
  { brand: "Mamaearth", name: "Rice Water Shampoo", variant: "250ml" },
  { brand: "Indulekha", name: "Bringha Shampoo", variant: "200ml" },

  // ── Bar soap ──
  { brand: "Lifebuoy", name: "Total 10 Soap", variant: "125g" },
  { brand: "Lux", name: "Velvet Glow Rose Soap", variant: "100g" },
  { brand: "Santoor", name: "Sandal & Turmeric Soap", variant: "125g" },
  { brand: "Mysore Sandal", name: "Gold Soap", variant: "125g" },
  { brand: "Dettol", name: "Cool Soap", variant: "125g" },
  { brand: "Pears", name: "Soft & Fresh Soap", variant: "125g" },
  { brand: "Chandrika", name: "Ayurvedic Soap", variant: "75g" },
  { brand: "Vivel", name: "Sandal & Sakura Soap", variant: "100g" },

  // ── Toothpaste ──
  { brand: "Colgate", name: "Visible White", variant: "100g" },
  { brand: "Colgate", name: "Cibaca Anticavity", variant: "175g" },
  { brand: "Pepsodent", name: "2in1 Toothpaste", variant: "150g" },
  { brand: "Dabur", name: "Red Paste", variant: "200g" },
  { brand: "Patanjali", name: "Dant Kanti Medicated", variant: "100g" },
  { brand: "Sensodyne", name: "Rapid Relief", variant: "80g" },
  { brand: "Closeup", name: "Diamond Attraction", variant: "150g" },

  // ── Instant noodles ──
  { brand: "Maggi", name: "2-Minute Masala Noodles", variant: "140g" },
  { brand: "Maggi", name: "Cuppa Mania Masala", variant: "70g" },
  { brand: "Yippee", name: "Magic Masala Noodles", variant: "140g" },
  { brand: "Top Ramen", name: "Super Noodles Masala", variant: "70g" },
  { brand: "Ching's Secret", name: "Veg Hakka Noodles", variant: "150g" },
  { brand: "Nissin", name: "Cup Noodles Masala", variant: "70g" },

  // ── Packaged juice ──
  { brand: "Real", name: "Pomegranate Juice", variant: "1L" },
  { brand: "Tropicana", name: "Litchi Delight", variant: "1L" },
  { brand: "Maaza", name: "Mango Drink", variant: "1.2L" },
  { brand: "Frooti", name: "Mango Drink", variant: "1L" },
  { brand: "Slice", name: "Alphonso Mango", variant: "1.2L" },
  { brand: "Paper Boat", name: "Coconut Water", variant: "200ml" },
  { brand: "Storia", name: "Coconut Water", variant: "200ml" },
  { brand: "Raw Pressery", name: "Cold Pressed Orange", variant: "250ml" },

  // ── Cooking oil ──
  { brand: "Fortune", name: "Rice Bran Health Oil", variant: "1L" },
  { brand: "Saffola", name: "Tasty Blended Oil", variant: "1L" },
  { brand: "Sundrop", name: "Heart Sunflower Oil", variant: "1L" },
  { brand: "Dhara", name: "Refined Sunflower Oil", variant: "1L" },
  { brand: "Nature Fresh", name: "Acti Cook Oil", variant: "1L" },
  { brand: "Gemini", name: "Filtered Groundnut Oil", variant: "1L" },
  { brand: "Idhayam", name: "Sesame Oil", variant: "500ml" },

  // ── Packaged tea ──
  { brand: "Red Label", name: "Natural Care", variant: "1kg" },
  { brand: "Tata Tea", name: "Gold Care", variant: "250g" },
  { brand: "Brooke Bond", name: "Taaza", variant: "500g" },
  { brand: "Wagh Bakri", name: "Good Morning Tea", variant: "250g" },
  { brand: "Lipton", name: "Darjeeling Tea", variant: "100g" },
  { brand: "Society Tea", name: "Masala Tea", variant: "250g" },

  // ── Instant coffee ──
  { brand: "Nescafé", name: "Sunrise Rich Aroma", variant: "100g" },
  { brand: "Bru", name: "Instant Coffee", variant: "100g" },
  { brand: "Continental Coffee", name: "Premium", variant: "100g" },
  { brand: "Davidoff", name: "Rich Aroma Coffee", variant: "100g" },

  // ── Hair oil ──
  { brand: "Dabur", name: "Amla Hair Oil", variant: "180ml" },
  { brand: "Bajaj", name: "Almond Drops Hair Oil", variant: "100ml" },
  { brand: "Parachute", name: "Advansed Ayurvedic Hair Oil", variant: "190ml" },
  { brand: "Kesh King", name: "Scalp & Hair Medicine Oil", variant: "300ml" },

  // ── Spices & masala ──
  { brand: "MDH", name: "Deggi Mirch", variant: "100g" },
  { brand: "MDH", name: "Kasuri Methi", variant: "100g" },
  { brand: "Everest", name: "Tikhalal Chilli", variant: "200g" },
  { brand: "Everest", name: "Turmeric Powder", variant: "200g" },
  { brand: "Catch", name: "Garam Masala", variant: "100g" },
  { brand: "Tata Sampann", name: "Coriander Powder", variant: "200g" },
  { brand: "Eastern", name: "Sambar Powder", variant: "200g" },
  { brand: "Aachi", name: "Chicken Masala", variant: "200g" },

  // ── Dairy products ──
  { brand: "Amul", name: "Cheese Slices", variant: "100g" },
  { brand: "Amul", name: "Masti Dahi", variant: "400g" },
  { brand: "Britannia", name: "Cheese Slices", variant: "100g" },
  { brand: "Mother Dairy", name: "Paneer", variant: "200g" },
  { brand: "Amul", name: "Paneer", variant: "200g" },
  { brand: "Go", name: "Cheese Spread", variant: "200g" },

  // ── Atta & flour ──
  { brand: "Aashirvaad", name: "Whole Wheat Atta", variant: "10kg" },
  { brand: "Fortune", name: "Chakki Fresh Atta", variant: "10kg" },
  { brand: "Pilsbury", name: "Gold Chakki Atta", variant: "5kg" },
  { brand: "Tata Sampann", name: "Besan", variant: "500g" },
  { brand: "Rajdhani", name: "Besan", variant: "500g" },

  // ── Liquid soap / handwash ──
  { brand: "Dettol", name: "Original Handwash", variant: "750ml" },
  { brand: "Lifebuoy", name: "Total Handwash Refill", variant: "750ml" },
  { brand: "Savlon", name: "Moisture Shield Handwash", variant: "750ml" },
  { brand: "Godrej", name: "Protekt Handwash", variant: "750ml" },
  { brand: "Palmolive", name: "Aroma Handwash", variant: "250ml" },

  // ── Health drinks ──
  { brand: "Horlicks", name: "Chocolate Health Drink", variant: "500g" },
  { brand: "Bournvita", name: "5 Star Magic", variant: "500g" },
  { brand: "Boost", name: "Health Drink Refill", variant: "750g" },
  { brand: "Horlicks", name: "Women's Plus", variant: "400g" },

  // ── Bottled water ──
  { brand: "Bisleri", name: "Mineral Water", variant: "2L" },
  { brand: "Kinley", name: "Water", variant: "2L" },
  { brand: "Aquafina", name: "Water", variant: "2L" },
  { brand: "Bisleri", name: "Mineral Water", variant: "5L" },

  // ── Detergent powder ──
  { brand: "Surf Excel", name: "Quick Wash Detergent", variant: "500g" },
  { brand: "Tide", name: "Double Power Jasmine", variant: "1kg" },
  { brand: "Ariel", name: "Complete Detergent", variant: "2kg" },
  { brand: "Rin", name: "Detergent Powder", variant: "2kg" },

  // ════════ FILL BATCH 2 — grow new + existing categories to 1,000 ════════

  // ── Rice (more) ──
  { brand: "India Gate", name: "Feast Rozana Basmati", variant: "5kg" },
  { brand: "Daawat", name: "Biryani Basmati Rice", variant: "1kg" },
  { brand: "Kohinoor", name: "Authentic Basmati", variant: "5kg" },
  { brand: "Fortune", name: "Biryani Special Basmati", variant: "1kg" },
  { brand: "Tata Sampann", name: "Brown Rice", variant: "1kg" },
  { brand: "Lal Qilla", name: "Super Basmati", variant: "5kg" },

  // ── Pulses & dal (more) ──
  { brand: "Tata Sampann", name: "Kabuli Chana", variant: "1kg" },
  { brand: "Tata Sampann", name: "Rajma", variant: "1kg" },
  { brand: "Fortune", name: "Chana Dal", variant: "1kg" },
  { brand: "Fortune", name: "Urad Dal", variant: "1kg" },
  { brand: "Organic Tattva", name: "Moong Whole", variant: "500g" },
  { brand: "24 Mantra", name: "Organic Toor Dal", variant: "1kg" },

  // ── Sugar & salt (more) ──
  { brand: "Madhur", name: "Pure Sugar", variant: "2kg" },
  { brand: "Uttam", name: "Sugar", variant: "5kg" },
  { brand: "Tata Salt", name: "Plus Iodised Salt", variant: "1kg" },
  { brand: "Aashirvaad", name: "Salt", variant: "1kg" },
  { brand: "Catch", name: "Black Salt", variant: "200g" },
  { brand: "Nirma", name: "Shudh Salt", variant: "1kg" },

  // ── Sauces & ketchup (more) ──
  { brand: "Kissan", name: "Tomato Ketchup Pichkoo", variant: "200g" },
  { brand: "Maggi", name: "Pichkoo Tomato Ketchup", variant: "90g" },
  { brand: "Veeba", name: "Chilli Garlic Sauce", variant: "310g" },
  { brand: "Ching's Secret", name: "Red Chilli Sauce", variant: "200g" },
  { brand: "Wingreens", name: "Peri Peri Mayo", variant: "180g" },
  { brand: "Fun Foods", name: "Mayonnaise Veg", variant: "275g" },
  { brand: "Dr. Oetker", name: "FunFoods Sandwich Spread", variant: "250g" },

  // ── Pickle & jam & honey (more) ──
  { brand: "Mother's Recipe", name: "Garlic Pickle", variant: "300g" },
  { brand: "Priya", name: "Lime Pickle", variant: "300g" },
  { brand: "Patanjali", name: "Mango Pickle", variant: "1kg" },
  { brand: "Kissan", name: "Pineapple Jam", variant: "490g" },
  { brand: "Mapro", name: "Pineapple Jam", variant: "500g" },
  { brand: "Pintola", name: "Peanut Butter Dark Chocolate", variant: "350g" },
  { brand: "MyFitness", name: "Peanut Butter Crunchy", variant: "510g" },
  { brand: "Dabur", name: "Honey Squeezy", variant: "400g" },
  { brand: "Patanjali", name: "Honey", variant: "1kg" },

  // ── Breakfast cereal (more) ──
  { brand: "Kellogg's", name: "Chocos Fills", variant: "250g" },
  { brand: "Kellogg's", name: "Special K", variant: "290g" },
  { brand: "Bagrry's", name: "Oats & Honey Granola", variant: "450g" },
  { brand: "Nestlé", name: "Koko Krunch", variant: "300g" },
  { brand: "Quaker", name: "Oats Plus Multigrain", variant: "1kg" },
  { brand: "Yoga Bar", name: "Dark Chocolate Muesli", variant: "400g" },

  // ── Pasta & ice cream (more) ──
  { brand: "Sunfeast", name: "Pasta Treat Cheese", variant: "65g" },
  { brand: "Disano", name: "Penne Pasta", variant: "500g" },
  { brand: "Bambino", name: "Vermicelli Plain", variant: "400g" },
  { brand: "Amul", name: "Strawberry Ice Cream", variant: "1L" },
  { brand: "Vadilal", name: "Badam Kulfi", variant: "60ml" },
  { brand: "Mother Dairy", name: "Chocolate Ice Cream", variant: "1L" },
  { brand: "Cream Bell", name: "Vanilla Ice Cream", variant: "700ml" },
  { brand: "Havmor", name: "Butterscotch Ice Cream", variant: "1L" },

  // ── Frozen & bread (more) ──
  { brand: "McCain", name: "Chilli Garlic Potato Bites", variant: "400g" },
  { brand: "Safal", name: "Sweet Corn", variant: "500g" },
  { brand: "ITC Master Chef", name: "Veg Spring Roll", variant: "400g" },
  { brand: "Godrej Yummiez", name: "Chicken Sausages", variant: "375g" },
  { brand: "Britannia", name: "Multigrain Bread", variant: "400g" },
  { brand: "Harvest Gold", name: "Brown Bread", variant: "400g" },
  { brand: "English Oven", name: "Zero Maida Bread", variant: "400g" },
  { brand: "Modern", name: "Brown Bread", variant: "400g" },

  // ── Dishwash & cleaners (more) ──
  { brand: "Vim", name: "Dishwash Gel Anti Smell", variant: "750ml" },
  { brand: "Exo", name: "Touch & Shine Dishwash Liquid", variant: "750ml" },
  { brand: "Pril", name: "Lime Dishwash Liquid", variant: "750ml" },
  { brand: "Harpic", name: "Bathroom Cleaner", variant: "500ml" },
  { brand: "Lizol", name: "Floor Cleaner Lavender", variant: "975ml" },
  { brand: "Colin", name: "Glass Cleaner Refill", variant: "500ml" },
  { brand: "Domex", name: "Floor Cleaner", variant: "1L" },
  { brand: "Patanjali", name: "Toilet Cleaner", variant: "500ml" },

  // ── Mosquito & agarbatti (more) ──
  { brand: "Good Knight", name: "Fast Card", variant: "10 cards" },
  { brand: "All Out", name: "Power+ Refill Twin", variant: "90ml" },
  { brand: "Mortein", name: "Power Booster Refill", variant: "45ml" },
  { brand: "Cycle", name: "Rhythm Agarbatti", variant: "100 sticks" },
  { brand: "Mangaldeep", name: "Rose Agarbatti", variant: "100 sticks" },
  { brand: "Zed Black", name: "3 in 1 Agarbatti", variant: "100 sticks" },

  // ── Deodorant (more) ──
  { brand: "Fogg", name: "Marco Body Spray", variant: "150ml" },
  { brand: "Axe", name: "Apollo Body Spray", variant: "150ml" },
  { brand: "Wild Stone", name: "Code Platinum Perfume", variant: "100ml" },
  { brand: "Engage", name: "W2 Perfume Spray", variant: "120ml" },
  { brand: "Nivea", name: "Deep Impact Deodorant", variant: "150ml" },
  { brand: "Set Wet", name: "Charm Avatar Deodorant", variant: "150ml" },

  // ── Pads, diapers, talc, pet food (more) ──
  { brand: "Whisper", name: "Bindazzz Night XL", variant: "20 pads" },
  { brand: "Stayfree", name: "Advanced All Night", variant: "28 pads" },
  { brand: "Sofy", name: "Anti Bacteria XXL", variant: "20 pads" },
  { brand: "Pampers", name: "Active Baby Taped XL", variant: "32 pcs" },
  { brand: "Huggies", name: "Complete Comfort Dry Pants L", variant: "42 pants" },
  { brand: "MamyPoko", name: "Standard Pants M", variant: "62 pants" },
  { brand: "Navratna", name: "Cool Talc", variant: "100g" },
  { brand: "Dermicool", name: "Prickly Heat Powder", variant: "75g" },
  { brand: "Pedigree", name: "Gravy Chicken & Liver", variant: "70g" },
  { brand: "Drools", name: "Cat Food Ocean Fish", variant: "1.2kg" },

  // ── Hair oil & shampoo (more) ──
  { brand: "Parachute", name: "Coconut Hair Oil", variant: "600ml" },
  { brand: "Dabur", name: "Vatika Black Shine Hair Oil", variant: "300ml" },
  { brand: "Nihar", name: "Naturals Almond Hair Oil", variant: "200ml" },
  { brand: "Mamaearth", name: "Onion Shampoo", variant: "400ml" },
  { brand: "WOW", name: "Red Onion Black Seed Shampoo", variant: "300ml" },
  { brand: "Dove", name: "Hair Fall Rescue Shampoo", variant: "650ml" },

  // ── Skin cream / face (more) ──
  { brand: "Nivea", name: "Soft Light Moisturiser", variant: "200ml" },
  { brand: "Pond's", name: "Super Light Gel", variant: "147g" },
  { brand: "Himalaya", name: "Purifying Neem Face Wash", variant: "200ml" },
  { brand: "Mamaearth", name: "Ubtan Face Wash", variant: "150ml" },
  { brand: "Garnier", name: "Men Acno Fight Face Wash", variant: "100g" },
  { brand: "Cetaphil", name: "Oily Skin Cleanser", variant: "250ml" },
  { brand: "Boroline", name: "Antiseptic Cream", variant: "20g" },
  { brand: "Nivea", name: "Men Dark Spot Face Wash", variant: "100ml" },

  // ── Biscuits / chips / chocolate (more) ──
  { brand: "Britannia", name: "50-50 Maska Chaska", variant: "200g" },
  { brand: "Parle", name: "Hide & Seek Black Bourbon", variant: "100g" },
  { brand: "Sunfeast", name: "Dark Fantasy Choco Fills", variant: "150g" },
  { brand: "McVitie's", name: "Digestive Original", variant: "400g" },
  { brand: "Lay's", name: "Sizzling Hot", variant: "52g" },
  { brand: "Bingo", name: "Tedhe Medhe Masala Tadka", variant: "130g" },
  { brand: "Haldiram's", name: "Nut Cracker", variant: "200g" },
  { brand: "Cadbury", name: "Dairy Milk Silk Hazelnut", variant: "58g" },
  { brand: "Nestlé", name: "KitKat Dessert Delight", variant: "50g" },
  { brand: "Ferrero Rocher", name: "T24 Box", variant: "300g" },

  // ── Soft drinks / juice / water (more) ──
  { brand: "Pepsi", name: "Cola", variant: "750ml" },
  { brand: "Thums Up", name: "Cola", variant: "1.25L" },
  { brand: "Coca-Cola", name: "Original", variant: "2L" },
  { brand: "Sprite", name: "Lime", variant: "2L" },
  { brand: "Real", name: "Activ Coconut Water", variant: "200ml" },
  { brand: "Minute Maid", name: "Pulpy Orange", variant: "1L" },
  { brand: "Bisleri", name: "Pop Fonzo", variant: "250ml" },
  { brand: "Himalayan", name: "Sparkling Water", variant: "500ml" },

  // ── Tea / coffee / milk / health drinks (more) ──
  { brand: "Tata Tea", name: "Premium", variant: "250g" },
  { brand: "Red Label", name: "Special Tea", variant: "250g" },
  { brand: "Bru", name: "Gold Coffee Jar", variant: "100g" },
  { brand: "Nescafé", name: "Classic Coffee", variant: "100g" },
  { brand: "Amul", name: "Gold Full Cream Milk", variant: "500ml" },
  { brand: "Mother Dairy", name: "Cow Milk", variant: "500ml" },
  { brand: "Bournvita", name: "Health Drink Jar", variant: "750g" },
  { brand: "Horlicks", name: "Classic Malt", variant: "750g" },

  // ── Cooking oil / atta / spices / dairy (more) ──
  { brand: "Fortune", name: "Premium Kachi Ghani Mustard Oil", variant: "1L" },
  { brand: "Saffola", name: "Gold Pro Healthy Lifestyle Oil", variant: "1L" },
  { brand: "Aashirvaad", name: "Multigrain Atta", variant: "5kg" },
  { brand: "Patanjali", name: "Chakki Atta", variant: "10kg" },
  { brand: "MDH", name: "Sabji Masala", variant: "100g" },
  { brand: "Everest", name: "Garam Masala", variant: "200g" },
  { brand: "Amul", name: "Butter", variant: "100g" },
  { brand: "Amul", name: "Pure Ghee", variant: "200ml" },
  { brand: "Mother Dairy", name: "Dahi", variant: "400g" },
  { brand: "Britannia", name: "Winkin Cow Thick Shake", variant: "180ml" },

  // ── Detergent / dishwash / handwash (more) ──
  { brand: "Surf Excel", name: "Matic Top Load", variant: "2kg" },
  { brand: "Ariel", name: "Matic Liquid", variant: "2L" },
  { brand: "Tide", name: "Plus Extra Power", variant: "4kg" },
  { brand: "Ghadi", name: "Detergent Powder", variant: "4kg" },
  { brand: "Dettol", name: "Sensitive Handwash", variant: "200ml" },
  { brand: "Savlon", name: "Glycerin Handwash", variant: "750ml" },

  // ════════ FILL BATCH 3 — top-up to 1,000 ════════

  // ── Skin care / face ──
  { brand: "Biotique", name: "Bio Papaya Scrub", variant: "75g" },
  { brand: "Mamaearth", name: "Vitamin C Face Serum", variant: "30ml" },
  { brand: "Ponds", name: "Bright Beauty Serum Cream", variant: "50g" },
  { brand: "Lakme", name: "9-to-5 Naturale Aloe Aqua Gel", variant: "50ml" },

  // ── Biscuits / snacks ──
  { brand: "Dukes", name: "Waffy Vanilla", variant: "150g" },
  { brand: "McVitie's", name: "Digestive Original", variant: "400g" },
  { brand: "Britannia", name: "Good Day Pista Badam", variant: "200g" },
  { brand: "Parle", name: "Kachha Mango Bite", variant: "100g" },

  // ── Sauces & condiments ──
  { brand: "Dr. Oetker", name: "FunFoods Sandwich Spread", variant: "250g" },
  { brand: "Kissan", name: "Squeezy Tomato Ketchup", variant: "500g" },
  { brand: "Del Monte", name: "Tomato Ketchup", variant: "1kg" },

  // ── Breakfast / health ──
  { brand: "Kellogg's", name: "Corn Flakes Original", variant: "875g" },
  { brand: "Saffola", name: "Oats Plain", variant: "1kg" },
  { brand: "Bagrry's", name: "White Oats", variant: "1kg" },

  // ── Beverages ──
  { brand: "Tata Tea", name: "Gold Jar", variant: "500g" },
  { brand: "Bru", name: "Instant Coffee", variant: "200g" },
  { brand: "Paper Boat", name: "Aam Panna", variant: "250ml" },
  { brand: "Coca-Cola", name: "Thums Up Charged", variant: "600ml" },

  // ── Personal care ──
  { brand: "Himalaya", name: "Nourishing Skin Cream", variant: "150ml" },
  { brand: "Dove", name: "Deeply Nourishing Body Wash", variant: "500ml" },
  { brand: "Head & Shoulders", name: "Cool Menthol Shampoo", variant: "675ml" },
  { brand: "Gillette", name: "Mach3 Razor", variant: "1 pc" },

  // ── Home care ──
  { brand: "Harpic", name: "Power Plus Citrus", variant: "1L" },
  { brand: "Lizol", name: "Disinfectant Floor Cleaner Pine", variant: "500ml" },
  { brand: "Domex", name: "Ultra Thick Bleach", variant: "1L" },
  { brand: "Colin", name: "Glass & Surface Cleaner", variant: "500ml" },

  // ── Dairy / staples ──
  { brand: "Amul", name: "Cheese Slices", variant: "200g" },
  { brand: "Nestlé", name: "Munch Bar", variant: "40g" },
  { brand: "Cadbury", name: "Gems Tube", variant: "26g" },
  { brand: "Fortune", name: "Sunflower Oil", variant: "1L" },
  { brand: "Aashirvaad", name: "Superior MP Atta", variant: "1kg" },
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
