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
