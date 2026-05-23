import type { CategoryTemplate } from "@/lib/schemas";

export const PACKAGED_BISCUITS_TEMPLATE: CategoryTemplate = {
  slug: "packaged_biscuits",
  displayName: "Packaged Biscuits",
  templateVersion: "1.0.0",
  defaultGstRate: 5.0,
  hsnCodes: ["19053100", "19053211", "19053219", "19053290", "19059020"],
  keywords: [
    "biscuit", "biscuits", "cookie", "cookies", "marie", "glucose",
    "cream cracker", "digestive", "nice", "bourbon", "rusk", "khari",
    "parle", "britannia", "good day", "monaco", "krackjack", "hide and seek",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 25, highPct: 35 },
    packaging: { lowPct: 6, highPct: 10 },
    manufacturing: { lowPct: 7, highPct: 12 },
    logistics: { lowPct: 7, highPct: 12 },
    retailMargin: { lowPct: 14, highPct: 22 },
    brandMargin: { lowPct: 3, highPct: 8 },
    advertising: { lowPct: 2, highPct: 5 },
    gst: { lowPct: 5, highPct: 5 },
    brandProfit: { lowPct: 3, highPct: 8 },
  },
  rawMaterials: [
    {
      name: "Refined wheat flour (maida)",
      sharePct: { low: 50, high: 70 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 100,
          notes: "Punjab, Haryana, MP, UP",
        },
      ],
    },
    {
      name: "Sugar",
      sharePct: { low: 10, high: 18 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 98,
          notes: "UP, Maharashtra, Karnataka",
        },
      ],
    },
    {
      name: "Palm oil",
      sharePct: { low: 8, high: 18 },
      typicalOrigin: [
        {
          country: "ID",
          countryName: "Indonesia",
          probabilityPct: 45,
          notes: "~37% of India's palm oil imports",
        },
        {
          country: "MY",
          countryName: "Malaysia",
          probabilityPct: 45,
          notes: "~39% of India's palm oil imports",
        },
        { country: "TH", countryName: "Thailand", probabilityPct: 7 },
      ],
    },
    {
      name: "Invert sugar syrup",
      sharePct: { low: 2, high: 5 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 100 },
      ],
    },
    {
      name: "Other (salt, milk solids, leavening, emulsifier, flavor)",
      sharePct: { low: 2, high: 5 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 90 },
        {
          country: "MIXED",
          countryName: "Mixed/Unknown",
          probabilityPct: 10,
        },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 82, highPct: 92 },
  llmGuidance:
    "For premium biscuits (cream/chocolate/cookie), push brand margin and advertising higher and raw material lower as % of MRP. For plain glucose biscuits, lean toward the lower end of brand margin and the higher end of raw materials. If the product mentions 'cocoa' or 'chocolate', add cocoa as an imported raw material (mostly from Ivory Coast / Ghana). For 'butter cookies', add dairy as a higher cost.",
  sources: [
    {
      title: "GST on Biscuits — Updated Tax Rate",
      url: "https://www.loansjagat.com/gst/gst-on-biscuits",
      relevance: "5% GST as of Sept 22, 2025",
    },
    {
      title: "Parle Biscuits FY24 results",
      url: "https://www.business-standard.com/companies/results/parle-biscuits-fy24-results-profit-jumps-twofold-to-rs-1-607-crore-124122300932_1.html",
      relevance: "Margin reference point",
    },
    {
      title: "India palm oil imports from Indonesia, Malaysia",
      url: "https://tradeint.com/insights/india-imports-palm-oil-from-which-country-2024-2025/",
      relevance: "Palm oil origin split",
    },
    {
      title: "Open Food Facts: Parle-G ingredients",
      url: "https://world.openfoodfacts.org/product/8901719128462/parle-g",
      relevance: "Ingredient percentages",
    },
    {
      title: "newsonair.gov.in GST 2.0 rate cuts",
      url: "https://www.newsonair.gov.in/gst-rate-cuts-from-september-22-relief-for-common-man-boost-for-businesses",
      relevance: "Government source on GST change",
    },
  ],
};
