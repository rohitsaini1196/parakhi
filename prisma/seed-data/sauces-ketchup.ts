import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Sauces & ketchup (tomato ketchup, chilli/soy/other sauces).
 * Tomatoes are grown in India, but ketchup leans on tomato paste/concentrate
 * that is frequently imported (China is the dominant global paste exporter),
 * and several big brands are foreign-owned (Kissan→HUL, Maggi→Nestlé,
 * Heinz→Kraft Heinz US). So IVC is moderate, lower than pickles/honey. GST 12%
 * (HSN 2103). Needs human review.
 */
export const SAUCES_KETCHUP_TEMPLATE: CategoryTemplate = {
  slug: "sauces_ketchup",
  displayName: "Sauces & Ketchup",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 12.0,
  hsnCodes: ["2103", "21032000", "21039040"],
  keywords: [
    "ketchup", "tomato ketchup", "sauce", "chilli sauce", "soy sauce",
    "schezwan", "pasta sauce", "hot sauce", "kissan", "maggi sauce",
    "heinz", "veeba", "del monte ketchup", "wingreens", "ching's sauce",
    "tomato sauce", "mayonnaise", "mayo", "salsa",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 35, highPct: 50 },
    packaging: {
      lowPct: 9,
      highPct: 16,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 85 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15 },
      ],
    },
    manufacturing: { lowPct: 6, highPct: 10 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 8, highPct: 14 },
    brandMargin: { lowPct: 4, highPct: 8 },
    advertising: { lowPct: 3, highPct: 8 },
    gst: { lowPct: 12, highPct: 12 },
    brandProfit: {
      lowPct: 3,
      highPct: 7,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 55, notes: "Veeba, Wingreens, Ching's (Capital Foods/Tata) — Indian." },
        { country: "NL", countryName: "Netherlands", probabilityPct: 18, notes: "Kissan owned by HUL (Unilever)." },
        { country: "CH", countryName: "Switzerland", probabilityPct: 15, notes: "Maggi sauces owned by Nestlé." },
        { country: "US", countryName: "United States", probabilityPct: 12, notes: "Heinz owned by Kraft Heinz." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Tomato paste / concentrate",
      sharePct: { low: 45, high: 65 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 55, notes: "Domestic tomatoes (MP, Karnataka, AP) processed into paste." },
        { country: "CN", countryName: "China", probabilityPct: 40, notes: "China is the world's largest tomato-paste exporter; cheaper paste is widely imported." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 5 },
      ],
    },
    {
      name: "Sugar, salt, vinegar, spices",
      sharePct: { low: 25, high: 40 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 92, notes: "Sugar, salt, spices domestic." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 68, highPct: 84 },
  llmGuidance:
    "Sauces & ketchup sit mid-IVC. Tomatoes grow in India but a large share of tomato paste is imported from China, and the category is dominated by foreign-owned brands (Kissan/HUL, Maggi/Nestlé, Heinz). Indian challengers (Veeba, Wingreens, Ching's) score higher. Sugar/salt/vinegar/spices are domestic. GST 12% under HSN 2103.",
  sources: [
    { title: "GST on sauces & condiments — HSN 2103 (12%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "12% GST on sauces/ketchup" },
    { title: "India tomato-paste imports — DGCIS trade data", url: "https://tradestat.commerce.gov.in/", relevance: "Imported tomato paste share" },
  ],
};
