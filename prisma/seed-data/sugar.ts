import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Sugar (white/refined cane sugar).
 * India is the world's largest sugar producer and consumer; cane is grown
 * domestically (UP, Maharashtra, Karnataka) and milled in domestic mills.
 * Brands are Indian (Madhur, Dhampure, Trust, Uttam, Mawana — mostly mill
 * co-operatives). Very high IVC; the only drag is imported packaging film.
 * GST 5% (HSN 1701). Needs human review.
 */
export const SUGAR_TEMPLATE: CategoryTemplate = {
  slug: "sugar",
  displayName: "Sugar",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 5.0,
  hsnCodes: ["1701", "17019100", "17019910"],
  keywords: [
    "sugar", "cheeni", "chini", "refined sugar", "white sugar", "sulphurless sugar",
    "madhur", "dhampure", "trust sugar", "uttam sugar", "mawana", "daurala",
    "boora", "tagar", "icing sugar", "demerara", "brown sugar",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 60, highPct: 74 },
    packaging: {
      lowPct: 5,
      highPct: 10,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 90 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 10 },
      ],
    },
    manufacturing: { lowPct: 6, highPct: 11 },
    logistics: { lowPct: 6, highPct: 10 },
    retailMargin: { lowPct: 6, highPct: 11 },
    brandMargin: { lowPct: 2, highPct: 6 },
    advertising: { lowPct: 1, highPct: 3 },
    gst: { lowPct: 5, highPct: 5 },
    brandProfit: {
      lowPct: 2,
      highPct: 5,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 95, notes: "Madhur, Dhampure, Trust, Uttam, Mawana — Indian sugar mills/co-operatives." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 5 },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Sugarcane",
      sharePct: { low: 97, high: 100 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 99,
          notes: "India is the world's largest sugarcane and sugar producer (~360 MT cane, UP/Maharashtra/Karnataka). Mills crush local cane; effectively zero import.",
        },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 90, highPct: 97 },
  llmGuidance:
    "Sugar is a top-tier IVC staple — cane is 100% domestic, milling is domestic, and brands are Indian sugar mills/co-operatives (Madhur, Dhampure, Trust, Uttam, Mawana). Margins and advertising are thin (commodity), so raw-material share of MRP is high. The only leak is imported packaging film. GST 5%. Boora/tagar/icing sugar follow the same origins.",
  sources: [
    {
      title: "India sugar production — ISMA / Ministry of Food",
      url: "https://www.indiansugar.com/",
      relevance: "World's largest producer; domestic cane supply",
    },
    {
      title: "GST on sugar — HSN 1701",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "5% GST on sugar",
    },
  ],
};
