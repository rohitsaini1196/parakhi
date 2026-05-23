import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — author with LLM assistance, needs human review before launch.
 * Numbers are sourced from public industry reports and HUL/Nirma annual filings
 * (FY24). GST rate from CBIC notifications (Sept 2025 GST 2.0).
 */
export const DETERGENT_POWDER_TEMPLATE: CategoryTemplate = {
  slug: "detergent_powder",
  displayName: "Laundry Detergent Powder",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["34022090", "34022010", "34029020"],
  keywords: [
    "detergent", "washing powder", "detergent powder", "surf", "surf excel",
    "ariel", "tide", "wheel", "rin", "ghadi", "nirma", "henko", "fena",
    "matic", "laundry", "washing", "detergent bar",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 28, highPct: 40 },
    packaging: { lowPct: 5, highPct: 10 },
    manufacturing: { lowPct: 5, highPct: 10 },
    logistics: { lowPct: 6, highPct: 10 },
    retailMargin: { lowPct: 10, highPct: 16 },
    brandMargin: { lowPct: 3, highPct: 7 },
    advertising: { lowPct: 6, highPct: 12 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: { lowPct: 4, highPct: 10 },
  },
  rawMaterials: [
    {
      name: "LAB (Linear Alkyl Benzene) / Surfactants",
      sharePct: { low: 25, high: 40 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 85,
          notes: "Reliance, IOC, NOCL are domestic LAB producers.",
        },
        {
          country: "MIXED",
          countryName: "Imported (US/Middle East)",
          probabilityPct: 15,
        },
      ],
    },
    {
      name: "Soda ash (sodium carbonate)",
      sharePct: { low: 15, high: 25 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 65,
          notes: "Tata Chemicals, GHCL — Gujarat.",
        },
        {
          country: "TR",
          countryName: "Turkey",
          probabilityPct: 20,
          notes: "Large import share via natural soda ash.",
        },
        { country: "US", countryName: "United States", probabilityPct: 15 },
      ],
    },
    {
      name: "Sodium sulphate (filler)",
      sharePct: { low: 20, high: 35 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 90 },
      ],
    },
    {
      name: "Zeolites, enzymes, optical brighteners",
      sharePct: { low: 5, high: 12 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 50 },
        {
          country: "MIXED",
          countryName: "Imported (EU/China)",
          probabilityPct: 50,
          notes: "Specialty enzymes mostly from Novozymes (DK) / China.",
        },
      ],
    },
    {
      name: "Perfume + colorants",
      sharePct: { low: 2, high: 5 },
      typicalOrigin: [
        {
          country: "MIXED",
          countryName: "Mixed (mostly imported)",
          probabilityPct: 70,
        },
        { country: "IN", countryName: "India", probabilityPct: 30 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 70, highPct: 85 },
  llmGuidance:
    "Premium brands (Ariel, Surf Excel Matic) push advertising and brand profit higher (12-15%) and reduce filler share. Value brands (Wheel, Ghadi, Nirma) lean heavily on sodium sulphate filler and have lower advertising. If the product mentions 'enzymes' or 'matic'/'front load', increase imported specialty enzyme share.",
  sources: [
    {
      title: "HUL FY24 Annual Report — Home Care segment margins",
      url: "https://www.hul.co.in/investor-relations/annual-reports/",
      relevance: "Brand profit and advertising spend benchmarks",
    },
    {
      title: "GST rate notification — Soaps & detergents (HSN 3402)",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "18% GST as of Sept 2025",
    },
    {
      title: "India LAB market size & domestic production",
      url: "https://www.mordorintelligence.com/industry-reports/india-linear-alkyl-benzene-market",
      relevance: "Domestic LAB supply share",
    },
    {
      title: "India soda ash imports — Turkey, US",
      url: "https://www.business-standard.com/article/companies/tata-chemicals-soda-ash-imports-china-119112000045_1.html",
      relevance: "Soda ash import composition",
    },
  ],
};
