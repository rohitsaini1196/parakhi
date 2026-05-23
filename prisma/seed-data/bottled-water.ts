import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Bisleri/Aquafina/Kinley filings, BIS norms, GST 18% on packaged
 * drinking water as of 2025. Needs human review.
 */
export const BOTTLED_WATER_TEMPLATE: CategoryTemplate = {
  slug: "bottled_water",
  displayName: "Bottled Drinking Water",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["22011010", "22011020", "22019090"],
  keywords: [
    "water", "drinking water", "mineral water", "packaged water",
    "bisleri", "kinley", "aquafina", "bailley", "rail neer", "himalayan",
    "packaged drinking water",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 1, highPct: 3 },
    packaging: { lowPct: 25, highPct: 40 },
    manufacturing: { lowPct: 5, highPct: 10 },
    logistics: { lowPct: 15, highPct: 25 },
    retailMargin: { lowPct: 12, highPct: 20 },
    brandMargin: { lowPct: 3, highPct: 6 },
    advertising: { lowPct: 2, highPct: 5 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: { lowPct: 5, highPct: 12 },
  },
  rawMaterials: [
    {
      name: "Water (extracted/processed)",
      sharePct: { low: 90, high: 98 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 100,
          notes: "Local groundwater / municipal source, treated on-site.",
        },
      ],
    },
    {
      name: "Trace minerals added back",
      sharePct: { low: 2, high: 8 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 80 },
        { country: "MIXED", countryName: "Imported salts", probabilityPct: 20 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 90, highPct: 98 },
  llmGuidance:
    "Bottled water is the clearest example of packaging-and-logistics dominating MRP. Almost no raw material cost. Premium mineral waters (Himalayan, Evian) shift packaging share lower and brand profit much higher. If the product is imported (Evian, Voss), Made-in-India score collapses — flip raw material origin accordingly.",
  sources: [
    {
      title: "GST 18% on packaged drinking water — HSN 2201",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "GST rate",
    },
    {
      title: "Bisleri International revenue / margin (Tofler)",
      url: "https://www.tofler.in/bisleri-international-private-limited",
      relevance: "Brand profit benchmark",
    },
    {
      title: "PET bottle cost share in packaged beverages (CII)",
      url: "https://www.cii.in/",
      relevance: "Packaging share benchmark",
    },
  ],
};
