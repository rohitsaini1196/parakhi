import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Honey.
 * India is a major honey producer and exporter; bee-keeping is domestic and the
 * leading brands are Indian (Dabur, Patanjali, Apis, Saffola/Marico, Zandu).
 * High IVC — the only leaks are imported glass/PET packaging and a debated
 * history of imported Chinese syrup adulteration (origin honestly flagged as
 * mixed for the cheapest tiers). GST 5% (HSN 0409). Needs human review.
 */
export const HONEY_TEMPLATE: CategoryTemplate = {
  slug: "honey",
  displayName: "Honey",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 5.0,
  hsnCodes: ["0409", "04090000"],
  keywords: [
    "honey", "shahad", "natural honey", "raw honey", "organic honey",
    "dabur honey", "patanjali honey", "apis honey", "saffola honey",
    "zandu honey", "himalaya honey", "forest honey", "multifloral honey",
    "acacia honey",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 40, highPct: 58 },
    packaging: {
      lowPct: 10,
      highPct: 18,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 85 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15 },
      ],
    },
    manufacturing: { lowPct: 5, highPct: 9 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 8, highPct: 14 },
    brandMargin: { lowPct: 4, highPct: 8 },
    advertising: { lowPct: 2, highPct: 6 },
    gst: { lowPct: 5, highPct: 5 },
    brandProfit: {
      lowPct: 3,
      highPct: 7,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 92, notes: "Dabur, Patanjali, Apis, Saffola (Marico), Zandu (Emami), Himalaya — Indian." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 8 },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Raw honey",
      sharePct: { low: 88, high: 98 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 85, notes: "India produces ~130k tonnes of honey annually (UP, Punjab, WB, Bihar); domestic apiaries supply branded packers." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15, notes: "Cheapest tiers have a documented history of imported invert-sugar/Chinese-syrup adulteration — flagged honestly." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 84, highPct: 94 },
  llmGuidance:
    "Honey is a high-IVC category — bee-keeping is domestic, India is a major producer/exporter, and the brands are Indian (Dabur, Patanjali, Apis, Marico, Emami). The leaks are imported packaging and, for the cheapest products, a real history of imported sugar-syrup adulteration (kept honest as a mixed-origin share, not hidden). GST 5% under HSN 0409.",
  sources: [
    { title: "GST on natural honey — HSN 0409 (5%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "5% GST on honey" },
    { title: "National Bee Board — India honey production", url: "https://nbb.gov.in/", relevance: "Domestic apiary production" },
  ],
};
