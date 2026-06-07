import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Breakfast cereal (cornflakes, muesli, oats, granola).
 * Corn and wheat are domestic, but oats are largely imported (Australia/Canada),
 * and the category leader Kellogg's is US-owned (Quaker/PepsiCo too). Indian
 * players (Bagrry's, Saffola/Marico, Soulfull/Tata) score higher. Heavy
 * advertising + branding keep raw-material share modest. GST 18% (HSN 1904).
 * Needs human review.
 */
export const BREAKFAST_CEREAL_TEMPLATE: CategoryTemplate = {
  slug: "breakfast_cereal",
  displayName: "Breakfast Cereal",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["1904", "19041090", "19042000"],
  keywords: [
    "cornflakes", "corn flakes", "muesli", "oats", "granola", "breakfast cereal",
    "chocos", "kellogg's", "bagrry's", "saffola oats", "quaker", "soulfull",
    "rolled oats", "instant oats", "wheat flakes", "porridge", "kelloggs",
    "masala oats", "classic oats", "white oats", "millet muesli",
    "koko krunch", "chocos", "honey loops", "flakes cereal",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 30, highPct: 45 },
    packaging: {
      lowPct: 9,
      highPct: 16,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 85 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15 },
      ],
    },
    manufacturing: { lowPct: 6, highPct: 11 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 8, highPct: 14 },
    brandMargin: { lowPct: 4, highPct: 9 },
    advertising: { lowPct: 5, highPct: 11 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: {
      lowPct: 3,
      highPct: 7,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 55, notes: "Bagrry's, Saffola (Marico), Soulfull (Tata), True Elements — Indian." },
        { country: "US", countryName: "United States", probabilityPct: 38, notes: "Kellogg's (Kellanova) and Quaker (PepsiCo) dominate cornflakes/oats." },
        { country: "CH", countryName: "Switzerland", probabilityPct: 7, notes: "Nestlé cereals." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Grain (corn / wheat / oats)",
      sharePct: { low: 80, high: 92 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 62, notes: "Corn (maize) and wheat are domestic." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 38, notes: "Oats are largely imported (Australia, Canada) — India grows very little oats." },
      ],
    },
    {
      name: "Sugar, malt, vitamins",
      sharePct: { low: 8, high: 20 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 75 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 25, notes: "Added vitamins/minerals frequently imported (China)." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 60, highPct: 80 },
  llmGuidance:
    "Breakfast cereal is mid-IVC. Corn/wheat cornflakes are mostly domestic, but oats are largely imported and the segment is led by US brands (Kellogg's, Quaker). Indian brands (Bagrry's, Saffola, Soulfull) and corn-based products score higher; imported-oat muesli/granola score lower. High advertising and branding shrink raw-material share. GST 18% under HSN 1904.",
  sources: [
    { title: "GST on prepared cereals — HSN 1904 (18%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "18% GST on breakfast cereals" },
    { title: "India oats imports — DGCIS trade data", url: "https://tradestat.commerce.gov.in/", relevance: "Imported oats dependence" },
  ],
};
