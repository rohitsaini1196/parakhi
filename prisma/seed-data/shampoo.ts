import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Shampoo & hair wash.
 * Mostly water; the actives (surfactants SLES/SLS, silicones, fragrance) are
 * largely imported, mostly from China + EU. Brand profit swings: HUL (Sunsilk,
 * Clinic Plus, Dove, TRESemmé) → NL Unilever; P&G (Pantene, Head & Shoulders)
 * → US; Patanjali → IN. GST 18% (HSN 3305). Needs human review.
 */
export const SHAMPOO_TEMPLATE: CategoryTemplate = {
  slug: "shampoo",
  displayName: "Shampoo",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["33051010", "33051090", "33059011", "33059019"],
  keywords: [
    "shampoo", "hair wash", "conditioner", "sunsilk", "clinic plus",
    "clinic all clear", "dove shampoo", "tresemme", "pantene",
    "head & shoulders", "head and shoulders", "chik", "clear",
    "patanjali kesh kanti", "kesh kanti", "vatika", "indulekha",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 18, highPct: 28 },
    packaging: { lowPct: 10, highPct: 16 },
    manufacturing: { lowPct: 6, highPct: 10 },
    logistics: { lowPct: 7, highPct: 11 },
    retailMargin: { lowPct: 12, highPct: 18 },
    brandMargin: { lowPct: 5, highPct: 9 },
    advertising: { lowPct: 12, highPct: 18 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: { lowPct: 6, highPct: 12 },
  },
  rawMaterials: [
    {
      name: "Water",
      sharePct: { low: 70, high: 80 },
      typicalOrigin: [{ country: "IN", countryName: "India", probabilityPct: 100 }],
    },
    {
      name: "Surfactants (SLES / SLS / cocamidopropyl betaine)",
      sharePct: { low: 10, high: 16 },
      typicalOrigin: [
        { country: "CN", countryName: "China", probabilityPct: 65, notes: "China dominates global SLES/SLS." },
        { country: "IN", countryName: "India", probabilityPct: 25 },
        { country: "MIXED", countryName: "Mixed (SE Asia/EU)", probabilityPct: 10 },
      ],
    },
    {
      name: "Silicones & conditioning agents",
      sharePct: { low: 3, high: 6 },
      typicalOrigin: [
        { country: "MIXED", countryName: "Mixed (EU/US/China)", probabilityPct: 80 },
        { country: "IN", countryName: "India", probabilityPct: 20 },
      ],
    },
    {
      name: "Fragrance, preservatives, colour",
      sharePct: { low: 1, high: 3 },
      typicalOrigin: [
        { country: "MIXED", countryName: "Mixed (imported fragrance houses)", probabilityPct: 75 },
        { country: "IN", countryName: "India", probabilityPct: 25 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 60, highPct: 80 },
  llmGuidance:
    "Sachets (₹1-3) push packaging share up. Anti-dandruff / premium variants raise active-ingredient cost. Herbal lines (Patanjali Kesh Kanti, Indulekha, Vatika) shift toward Indian botanicals + Indian brand profit. Mass brands (Sunsilk, Clinic Plus, Pantene, H&S) route brand profit to Unilever NL / P&G US.",
  sources: [
    { title: "CBIC GST — hair preparations HSN 3305", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "18% GST" },
    { title: "HUL FY24 — Beauty & Personal Care margins", url: "https://www.hul.co.in/investor-relations/annual-reports/", relevance: "Brand margin + ad spend" },
    { title: "India SLES/SLS imports from China", url: "https://www.dgft.gov.in/CP/", relevance: "Surfactant origin" },
    { title: "P&G India financials (Tofler)", url: "https://www.tofler.in/", relevance: "Pantene/H&S foreign parent" },
  ],
};
