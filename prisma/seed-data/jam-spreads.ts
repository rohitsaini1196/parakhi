import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Jam & spreads (fruit jam, peanut butter, chocolate spread).
 * Fruit and peanuts are domestic, but the category-leading jam brand (Kissan)
 * is HUL-owned and chocolate spreads (Nutella/Hershey's) are imported-brand. So
 * IVC is moderate-high: Indian peanut butter (Pintola, Sundrop) and Mapro jam
 * score well; foreign chocolate spreads drag. GST 12% (jam HSN 2007; peanut
 * butter 2008). Needs human review.
 */
export const JAM_SPREADS_TEMPLATE: CategoryTemplate = {
  slug: "jam_spreads",
  displayName: "Jam & Spreads",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 12.0,
  hsnCodes: ["2007", "20071000", "20079900", "2008"],
  keywords: [
    "jam", "mixed fruit jam", "strawberry jam", "marmalade", "fruit spread",
    "peanut butter", "chocolate spread", "kissan jam", "mapro", "pintola",
    "sundrop peanut butter", "hershey's spread", "nutella", "fruit preserve",
    "mango jam", "hazelnut spread",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 38, highPct: 55 },
    packaging: {
      lowPct: 10,
      highPct: 17,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 85 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15 },
      ],
    },
    manufacturing: { lowPct: 6, highPct: 10 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 8, highPct: 14 },
    brandMargin: { lowPct: 4, highPct: 8 },
    advertising: { lowPct: 2, highPct: 6 },
    gst: { lowPct: 12, highPct: 12 },
    brandProfit: {
      lowPct: 3,
      highPct: 7,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 60, notes: "Mapro, Pintola, Sundrop (peanut butter), Veeba — Indian." },
        { country: "NL", countryName: "Netherlands", probabilityPct: 22, notes: "Kissan jam owned by HUL (Unilever)." },
        { country: "US", countryName: "United States", probabilityPct: 10, notes: "Hershey's spreads." },
        { country: "IT", countryName: "Italy", probabilityPct: 8, notes: "Nutella (Ferrero), imported." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Fruit pulp / peanuts / cocoa",
      sharePct: { low: 55, high: 72 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 78, notes: "Mango, mixed fruit and groundnut are domestic (Gujarat/AP peanuts)." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 22, notes: "Cocoa for chocolate spreads is imported (West Africa); some imported fruit pulp." },
      ],
    },
    {
      name: "Sugar & pectin",
      sharePct: { low: 28, high: 42 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 88, notes: "Sugar domestic; pectin (citrus/apple-derived gelling agent) often imported." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 12 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 72, highPct: 88 },
  llmGuidance:
    "Jam & spreads are moderate-to-high IVC. Indian fruit jam (Mapro) and peanut butter (Pintola, Sundrop) score well — fruit and groundnuts are domestic. The drags are Kissan (HUL) leading fruit jam, imported chocolate spreads (Nutella/Ferrero, Hershey's) whose cocoa is West-African, and imported pectin. Jam is GST 12% (HSN 2007); peanut butter 12% (HSN 2008).",
  sources: [
    { title: "GST on jams & fruit preparations — HSN 2007 (12%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "12% GST on jam/spreads" },
    { title: "India groundnut production — Directorate of Oilseeds", url: "https://oilseeds.dac.gov.in/", relevance: "Domestic peanuts for peanut butter" },
  ],
};
