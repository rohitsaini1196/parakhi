import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Nestle India FY24 (Maggi-dominant), ITC Yippee filings, public
 * palm oil import data. Needs human review before launch.
 */
export const INSTANT_NOODLES_TEMPLATE: CategoryTemplate = {
  slug: "instant_noodles",
  displayName: "Instant Noodles",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 12.0,
  hsnCodes: ["19023010", "19023090"],
  keywords: [
    "noodles", "instant noodles", "maggi", "yippee", "top ramen", "ramen",
    "atta noodles", "cup noodles", "knorr", "wai wai", "hakka noodles",
    "instant pasta",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 22, highPct: 32 },
    packaging: { lowPct: 8, highPct: 14 },
    manufacturing: { lowPct: 8, highPct: 13 },
    logistics: { lowPct: 7, highPct: 11 },
    retailMargin: { lowPct: 12, highPct: 18 },
    brandMargin: { lowPct: 4, highPct: 9 },
    advertising: { lowPct: 4, highPct: 9 },
    gst: { lowPct: 12, highPct: 12 },
    brandProfit: { lowPct: 5, highPct: 12 },
  },
  rawMaterials: [
    {
      name: "Refined wheat flour (maida)",
      sharePct: { low: 55, high: 70 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 100 },
      ],
    },
    {
      name: "Palm oil",
      sharePct: { low: 15, high: 25 },
      typicalOrigin: [
        { country: "ID", countryName: "Indonesia", probabilityPct: 45 },
        { country: "MY", countryName: "Malaysia", probabilityPct: 45 },
        { country: "TH", countryName: "Thailand", probabilityPct: 7 },
      ],
    },
    {
      name: "Salt",
      sharePct: { low: 2, high: 4 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 100 },
      ],
    },
    {
      name: "Tastemaker (spices, MSG, hydrolyzed protein, dehydrated veg)",
      sharePct: { low: 8, high: 15 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 70 },
        {
          country: "CN",
          countryName: "China",
          probabilityPct: 25,
          notes: "MSG and hydrolyzed protein largely imported.",
        },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 5 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 75, highPct: 88 },
  llmGuidance:
    "Single-serve sachets (₹12-15) have higher packaging share. Premium variants (atta noodles, cup noodles) have higher raw material differentiation. Multi-packs distribute packaging cost. If 'cup' or 'tub', add ~3-5% to packaging share.",
  sources: [
    {
      title: "Nestle India FY24 Annual Report — Prepared Dishes margins",
      url: "https://www.nestle.in/investors/annual-reports",
      relevance: "Brand profit, advertising spend on Maggi segment",
    },
    {
      title: "GST 12% on instant noodles — HSN 1902",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "GST rate",
    },
    {
      title: "India palm oil imports",
      url: "https://tradeint.com/insights/india-imports-palm-oil-from-which-country-2024-2025/",
      relevance: "Palm oil origin split",
    },
    {
      title: "India MSG imports from China",
      url: "https://www.dgft.gov.in/CP/",
      relevance: "MSG / hydrolyzed protein import data",
    },
  ],
};
