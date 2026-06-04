import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Deodorant & body spray / perfume.
 * Lower-IVC personal care: heavy foreign brand ownership (Axe/Rexona→HUL,
 * Nivea→Beiersdorf DE), imported fragrance compounds and aerosol/propellant,
 * plus heavy advertising. Indian challengers (Fogg/Vini, Engage/ITC, Wild Stone/
 * McNROE, Park Avenue) score higher. GST 18% (HSN 3307). Needs human review.
 */
export const DEODORANT_TEMPLATE: CategoryTemplate = {
  slug: "deodorant",
  displayName: "Deodorant & Perfume",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["3307", "33072000", "33074900"],
  keywords: [
    "deodorant", "deo", "body spray", "perfume", "fragrance spray",
    "roll on", "antiperspirant", "axe", "fogg", "engage", "wild stone",
    "park avenue", "nivea deo", "rexona", "denver", "body mist", "pocket perfume",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 25, highPct: 40 },
    packaging: {
      lowPct: 12,
      highPct: 22,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 80 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 20 },
      ],
    },
    manufacturing: { lowPct: 6, highPct: 11 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 10, highPct: 16 },
    brandMargin: { lowPct: 5, highPct: 10 },
    advertising: { lowPct: 6, highPct: 13 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: {
      lowPct: 3,
      highPct: 8,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 45, notes: "Fogg (Vini), Engage (ITC), Wild Stone (McNROE), Park Avenue (Raymond) — Indian." },
        { country: "NL", countryName: "Netherlands", probabilityPct: 35, notes: "Axe, Rexona owned by HUL (Unilever)." },
        { country: "DE", countryName: "Germany", probabilityPct: 20, notes: "Nivea owned by Beiersdorf." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Fragrance concentrate & alcohol",
      sharePct: { low: 50, high: 68 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 45, notes: "Denatured alcohol domestic." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 55, notes: "Fragrance compounds are largely imported from EU/Singapore fragrance houses." },
      ],
    },
    {
      name: "Aerosol propellant (LPG/butane)",
      sharePct: { low: 20, high: 35 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 85, notes: "LPG propellant domestic." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 54, highPct: 74 },
  llmGuidance:
    "Deodorant is lower-IVC personal care: imported fragrance dominates the raw-material cost, the category is led by foreign brands (Axe/Rexona/HUL, Nivea/Beiersdorf), and advertising is heavy. Indian brands (Fogg, Engage, Wild Stone, Park Avenue) and locally-filled aerosols score higher. GST 18% under HSN 3307.",
  sources: [
    { title: "GST on deodorants/perfumes — HSN 3307 (18%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "18% GST on deodorant/perfume" },
    { title: "Vini Cosmetics — Fogg Indian manufacturing", url: "https://www.vinicosmetics.com/", relevance: "Domestic deodorant manufacturing" },
  ],
};
