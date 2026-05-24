import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Instant coffee.
 * India grows coffee (Karnataka, Kerala, TN — 3rd largest Asian producer), so
 * the bean is largely domestic. The swing is brand profit: Nescafé → Nestlé
 * (CH), Bru → HUL/Unilever (NL); Tata Coffee / Continental are Indian.
 * GST 18% on extracts/instant (HSN 2101). Needs human review.
 */
export const INSTANT_COFFEE_TEMPLATE: CategoryTemplate = {
  slug: "instant_coffee",
  displayName: "Instant Coffee",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["21011110", "21011120", "21011200"],
  keywords: [
    "coffee", "instant coffee", "nescafe", "nescafé", "bru", "sunrise",
    "tata coffee", "continental", "classic coffee", "gold coffee",
    "filter coffee", "coffee powder",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 30, highPct: 45 },
    packaging: { lowPct: 10, highPct: 16 },
    manufacturing: { lowPct: 8, highPct: 14 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 10, highPct: 16 },
    brandMargin: { lowPct: 4, highPct: 9 },
    advertising: { lowPct: 6, highPct: 12 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: { lowPct: 5, highPct: 12 },
  },
  rawMaterials: [
    {
      name: "Coffee beans (robusta / arabica)",
      sharePct: { low: 60, high: 80 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 85, notes: "Karnataka, Kerala, Tamil Nadu — India is a major coffee grower." },
        { country: "MIXED", countryName: "Imported (Vietnam blend)", probabilityPct: 15 },
      ],
    },
    {
      name: "Chicory",
      sharePct: { low: 10, high: 30 },
      typicalOrigin: [{ country: "IN", countryName: "India", probabilityPct: 95, notes: "Gujarat — common in Indian coffee blends." }],
    },
    {
      name: "Additives (flavour, anti-caking)",
      sharePct: { low: 1, high: 4 },
      typicalOrigin: [
        { country: "MIXED", countryName: "Mixed", probabilityPct: 60 },
        { country: "IN", countryName: "India", probabilityPct: 40 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 65, highPct: 88 },
  llmGuidance:
    "The bean is mostly Indian, so composition-MII is high. IVC is pulled down chiefly by brand profit: Nescafé → Nestlé (CH), Bru → HUL/Unilever (NL). Tata Coffee, Continental, Sunrise keep it Indian. Pure-coffee premium SKUs raise raw-material share; high-chicory blends lower per-cup cost.",
  sources: [
    { title: "CBIC GST — coffee extracts/instant HSN 2101", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "18% GST" },
    { title: "Coffee Board of India — production stats", url: "https://www.indiacoffee.org/", relevance: "India's domestic coffee crop" },
    { title: "Nestlé India / HUL filings", url: "https://www.mca.gov.in/", relevance: "Nescafé/Bru brand margin + foreign parent" },
  ],
};
