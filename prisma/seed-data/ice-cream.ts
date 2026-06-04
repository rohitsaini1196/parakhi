import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Ice cream & frozen dessert.
 * Milk/sugar are domestic and India's largest brand (Amul) is a farmer
 * co-operative — so true dairy ice cream is high-IVC. Drags: foreign-owned
 * brands (Kwality Wall's→HUL, Havmor→Lotte KR, Baskin Robbins→US), imported
 * cocoa/flavours/stabilisers, and "frozen desserts" that swap milk fat for
 * imported vegetable oil. GST 18% (HSN 2105). Needs human review.
 */
export const ICE_CREAM_TEMPLATE: CategoryTemplate = {
  slug: "ice_cream",
  displayName: "Ice Cream",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["2105", "21050000"],
  keywords: [
    "ice cream", "icecream", "frozen dessert", "kulfi", "cassata", "cornetto",
    "amul ice cream", "kwality wall's", "kwality walls", "vadilal", "havmor",
    "cream bell", "baskin robbins", "naturals ice cream", "mother dairy ice cream",
    "choco bar", "ice cream tub", "ice cream cone",
    "butterscotch ice cream", "vanilla ice cream", "chocolate ice cream",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 35, highPct: 50 },
    packaging: {
      lowPct: 8,
      highPct: 14,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 86 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 14 },
      ],
    },
    manufacturing: { lowPct: 8, highPct: 14 },
    logistics: { lowPct: 7, highPct: 13 },
    retailMargin: { lowPct: 9, highPct: 15 },
    brandMargin: { lowPct: 3, highPct: 7 },
    advertising: { lowPct: 3, highPct: 8 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: {
      lowPct: 3,
      highPct: 7,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 60, notes: "Amul (GCMMF co-op), Vadilal, Mother Dairy, Cream Bell, Naturals — Indian." },
        { country: "NL", countryName: "Netherlands", probabilityPct: 20, notes: "Kwality Wall's owned by HUL (Unilever)." },
        { country: "KR", countryName: "South Korea", probabilityPct: 12, notes: "Havmor owned by Lotte." },
        { country: "US", countryName: "United States", probabilityPct: 8, notes: "Baskin Robbins." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Milk solids / cream (or veg fat for frozen dessert)",
      sharePct: { low: 55, high: 72 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 82, notes: "Milk and cream are domestic — India is the world's largest milk producer." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 18, notes: "'Frozen desserts' substitute imported palm/vegetable oil for milk fat." },
      ],
    },
    {
      name: "Sugar, cocoa, flavours, stabilisers",
      sharePct: { low: 25, high: 40 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 65, notes: "Sugar domestic." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 35, notes: "Cocoa (West Africa), vanilla/flavours and stabilisers/emulsifiers are imported." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 74, highPct: 88 },
  llmGuidance:
    "Ice cream is moderate-to-high IVC. Real dairy ice cream from Amul (a farmer co-operative) and Indian brands (Vadilal, Mother Dairy) scores high — milk is domestic. Drags: foreign-owned brands (Kwality Wall's/HUL, Havmor/Lotte, Baskin Robbins), imported cocoa/flavours, and 'frozen desserts' that replace milk fat with imported vegetable oil (a real distinction worth flagging). GST 18% under HSN 2105.",
  sources: [
    { title: "GST on ice cream — HSN 2105 (18%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "18% GST on ice cream" },
    { title: "India milk production — NDDB", url: "https://www.nddb.coop/information/stats/milkprodindia", relevance: "World's largest milk producer — domestic dairy base" },
  ],
};
