import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Butter, ghee, cheese, dahi (curd), paneer.
 * India is the world's largest milk producer — raw material is overwhelmingly
 * domestic. IVC is very high, similar to packaged milk.
 * GST varies: butter/ghee 12%, cheese 12%, dahi 5% (packaged).
 * Needs human review.
 */
export const DAIRY_PRODUCTS_TEMPLATE: CategoryTemplate = {
  slug: "dairy_products",
  displayName: "Dairy Products",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 12.0,
  hsnCodes: ["04051000", "04052000", "04061000", "04069090", "04031000", "04039090", "21050000"],
  keywords: [
    "butter", "ghee", "cheese", "dahi", "curd", "yogurt", "yoghurt",
    "paneer", "cream", "whey", "amul butter", "amul cheese", "amul ghee",
    "processed cheese", "spreadable cheese", "slice cheese", "cheese spread",
    "mishti doi", "greek yogurt", "flavoured yogurt", "ice cream",
    "amul dahi", "mother dairy dahi", "nestle yogurt",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 55, highPct: 70 },
    packaging: {
      lowPct: 5,
      highPct: 12,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 85 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15 },
      ],
    },
    manufacturing: { lowPct: 5, highPct: 10 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 8, highPct: 14 },
    brandMargin: { lowPct: 2, highPct: 6 },
    advertising: { lowPct: 1, highPct: 4 },
    gst: { lowPct: 12, highPct: 12 },
    brandProfit: {
      lowPct: 2,
      highPct: 5,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 75, notes: "Amul (GCMMF cooperative), Mother Dairy — fully Indian." },
        { country: "CH", countryName: "Switzerland", probabilityPct: 25, notes: "Nestlé India (Milkmaid, a+ cheese) parent Nestlé SA, Vevey." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Milk / cream (primary raw material)",
      sharePct: { low: 90, high: 98 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 100,
          notes: "India produces ~230 million tonnes of milk annually. No meaningful dairy imports. Amul sources from 3.6 million farmers across Gujarat.",
        },
      ],
    },
    {
      name: "Bacterial cultures & enzymes (for dahi, cheese)",
      sharePct: { low: 0.5, high: 2 },
      typicalOrigin: [
        { country: "DK", countryName: "Denmark", probabilityPct: 50, notes: "Chr. Hansen, Novozymes — global leaders in dairy cultures." },
        { country: "FR", countryName: "France", probabilityPct: 30, notes: "Danisco/DuPont culture supply." },
        { country: "IN", countryName: "India", probabilityPct: 20 },
      ],
    },
    {
      name: "Salt, annatto colour, other additives",
      sharePct: { low: 0.5, high: 3 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 90 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 10 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 88, highPct: 96 },
  llmGuidance:
    "Dairy products are among the highest IVC categories — milk is 100% Indian, processing is domestic, and major brands (Amul, Mother Dairy) are Indian cooperatives or state-owned. The only import leakage is bacterial cultures (Danish/French suppliers dominate globally) and Nestlé India's brand profit routing to Switzerland. GST varies: butter/ghee 12%, unpackaged curd 0% but packaged dahi 5%, cheese 12%, ice cream 18%. Default 12% is appropriate for butter/cheese products.",
  sources: [
    {
      title: "NDDB Annual Statistics — milk production and procurement",
      url: "https://www.nddb.coop/information/stats",
      relevance: "India dairy raw material supply chain",
    },
    {
      title: "GCMMF (Amul) Annual Report — farmer procurement price",
      url: "https://amul.com/m/about-us",
      relevance: "Raw milk cost share for cooperative model",
    },
    {
      title: "GST rates — dairy products HSN 0403/0405/0406",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "GST rates by product type",
    },
  ],
};
