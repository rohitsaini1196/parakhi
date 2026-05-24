import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Refined cooking oil.
 * The oil itself is 80%+ of cost. India imports ~55-60% of its edible oil —
 * palm (Indonesia/Malaysia) + sunflower (Russia/Ukraine/Argentina) + soybean
 * (Argentina/Brazil). Mustard and groundnut are domestic. So oil *type* drives
 * the score. GST 5% (HSN 1507/1511/1512/1517). Needs human review.
 */
export const COOKING_OIL_TEMPLATE: CategoryTemplate = {
  slug: "cooking_oil",
  displayName: "Cooking Oil",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 5.0,
  hsnCodes: ["15079010", "15119010", "15121110", "15122910", "15179010"],
  keywords: [
    "oil", "cooking oil", "refined oil", "sunflower oil", "soybean oil",
    "mustard oil", "groundnut oil", "rice bran oil", "fortune", "saffola",
    "sundrop", "dhara", "gemini", "nature fresh", "freedom", "kachi ghani",
    "vanaspati", "dalda",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 70, highPct: 85 },
    packaging: { lowPct: 4, highPct: 9 },
    manufacturing: { lowPct: 3, highPct: 7 },
    logistics: { lowPct: 4, highPct: 8 },
    retailMargin: { lowPct: 5, highPct: 10 },
    brandMargin: { lowPct: 2, highPct: 5 },
    advertising: { lowPct: 2, highPct: 6 },
    gst: { lowPct: 5, highPct: 5 },
    brandProfit: { lowPct: 2, highPct: 6 },
  },
  rawMaterials: [
    {
      name: "Edible oil (the oil itself)",
      sharePct: { low: 92, high: 99 },
      typicalOrigin: [
        { country: "ID", countryName: "Indonesia", probabilityPct: 25, notes: "Palm." },
        { country: "MY", countryName: "Malaysia", probabilityPct: 15, notes: "Palm." },
        { country: "RU", countryName: "Russia", probabilityPct: 10, notes: "Sunflower." },
        { country: "IN", countryName: "India", probabilityPct: 40, notes: "Domestic mustard, groundnut, rice-bran, some soy." },
      ],
    },
    {
      name: "Refining inputs, antioxidants, fortification (Vit A/D)",
      sharePct: { low: 1, high: 4 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 60 },
        { country: "MIXED", countryName: "Imported vitamin premix", probabilityPct: 40 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 35, highPct: 70 },
  llmGuidance:
    "Oil TYPE is everything. Palm / sunflower / soybean oils are heavily imported → IVC can fall below 50%. Mustard (kachi ghani), groundnut, and rice-bran are largely Indian → higher IVC. Blended 'refined oil' is usually palm+soy = import-heavy. Fortune (Adani Wilmar, Singapore-Indian JV), Saffola (Marico, Indian), Dhara (Mother Dairy, Indian), Sundrop (Indian). Brand margins are thin — this is a low-margin commodity category.",
  sources: [
    { title: "CBIC GST — edible oils HSN 1507/1511/1512", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "5% GST" },
    { title: "India edible oil imports (~55-60% of consumption)", url: "https://www.dgft.gov.in/CP/", relevance: "Palm/sunflower/soy import dependence" },
    { title: "Solvent Extractors' Association of India", url: "https://www.seaofindia.com/", relevance: "Oil import + domestic split" },
    { title: "Adani Wilmar / Marico filings", url: "https://www.mca.gov.in/", relevance: "Brand margin benchmark" },
  ],
};
