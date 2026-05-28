import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — HUL personal care segment, Godrej Consumer filings, palm oil
 * imports. Needs human review.
 */
export const BAR_SOAP_TEMPLATE: CategoryTemplate = {
  slug: "bar_soap",
  displayName: "Bar Soap",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["34011110", "34011190", "34011900"],
  keywords: [
    "soap", "bar soap", "bathing bar", "beauty bar", "lux", "lifebuoy",
    "dove", "pears", "santoor", "cinthol", "medimix", "mysore sandal",
    "dettol soap", "hamam", "margo", "fiama", "godrej no.1", "vivel", "savlon",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 25, highPct: 38 },
    packaging: { lowPct: 4, highPct: 8 },
    manufacturing: { lowPct: 6, highPct: 10 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 12, highPct: 18 },
    brandMargin: { lowPct: 4, highPct: 10 },
    advertising: { lowPct: 8, highPct: 15 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: { lowPct: 5, highPct: 12 },
  },
  rawMaterials: [
    {
      name: "Palm fatty acid / palm stearin",
      sharePct: { low: 35, high: 55 },
      typicalOrigin: [
        { country: "ID", countryName: "Indonesia", probabilityPct: 45 },
        { country: "MY", countryName: "Malaysia", probabilityPct: 45 },
        {
          country: "IN",
          countryName: "India (refined locally)",
          probabilityPct: 10,
        },
      ],
    },
    {
      name: "Tallow / animal fat (some brands)",
      sharePct: { low: 0, high: 20 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 60 },
        {
          country: "MIXED",
          countryName: "Imported (Australia/NZ)",
          probabilityPct: 40,
        },
      ],
    },
    {
      name: "Caustic soda (NaOH)",
      sharePct: { low: 10, high: 18 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 90 },
      ],
    },
    {
      name: "Perfume + colorants + glycerin",
      sharePct: { low: 8, high: 18 },
      typicalOrigin: [
        {
          country: "MIXED",
          countryName: "Mixed (mostly imported fragrance)",
          probabilityPct: 70,
        },
        { country: "IN", countryName: "India", probabilityPct: 30 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 45, highPct: 70 },
  llmGuidance:
    "Bar soap is the most palm-oil-heavy category we cover. Made-in-India scores hover 50-65%. Premium beauty bars (Dove, Pears) push advertising 12-18% and glycerin/oil share higher. Carbolic / antiseptic soaps (Dettol, Lifebuoy) skew toward higher fragrance/active-ingredient share. If 'glycerin', flag the higher imported share.",
  sources: [
    {
      title: "HUL Personal Care segment margins FY24",
      url: "https://www.hul.co.in/investor-relations/annual-reports/",
      relevance: "Margin and ad spend benchmarks",
    },
    {
      title: "Godrej Consumer Products FY24",
      url: "https://www.godrejcp.com/investor-information",
      relevance: "Soap segment margins",
    },
    {
      title: "GST 18% on soap — HSN 3401",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "GST rate",
    },
    {
      title: "India palm oil imports",
      url: "https://tradeint.com/insights/india-imports-palm-oil-from-which-country-2024-2025/",
      relevance: "Palm fatty acid origin split",
    },
  ],
};
