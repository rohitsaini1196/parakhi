import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Bread & bakery (sliced bread, pav, buns, rusk).
 * Among the most domestic packaged categories: wheat flour is Indian, bakeries
 * are local/regional, and brands are Indian (Britannia, Modern, Harvest Gold,
 * English Oven, Bonn). Very high IVC; minor leaks are imported yeast/improvers
 * and packaging. GST 5% (HSN 1905; plain bread is exempt). Needs human review.
 */
export const BREAD_BAKERY_TEMPLATE: CategoryTemplate = {
  slug: "bread_bakery",
  displayName: "Bread & Bakery",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 5.0,
  hsnCodes: ["1905", "19059010", "19054000"],
  keywords: [
    "bread", "sliced bread", "brown bread", "pav", "bun", "rusk", "toast",
    "milk bread", "multigrain bread", "britannia bread", "modern bread",
    "harvest gold", "english oven", "bonn", "fruit bread", "garlic bread",
    "wheat bread",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 42, highPct: 58 },
    packaging: {
      lowPct: 7,
      highPct: 13,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 90 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 10 },
      ],
    },
    manufacturing: { lowPct: 8, highPct: 14 },
    logistics: { lowPct: 7, highPct: 12 },
    retailMargin: { lowPct: 8, highPct: 13 },
    brandMargin: { lowPct: 3, highPct: 6 },
    advertising: { lowPct: 1, highPct: 4 },
    gst: { lowPct: 5, highPct: 5 },
    brandProfit: {
      lowPct: 2,
      highPct: 5,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 92, notes: "Britannia, Modern, Harvest Gold, English Oven (Bonn), regional bakeries — Indian." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 8 },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Wheat flour (maida / atta)",
      sharePct: { low: 78, high: 90 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 98, notes: "Maida/atta milled from domestic wheat — India is the 2nd-largest wheat producer." },
      ],
    },
    {
      name: "Yeast, sugar, oil, improvers",
      sharePct: { low: 10, high: 22 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 78, notes: "Sugar/oil domestic." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 22, notes: "Baker's yeast and dough conditioners/improvers are often imported." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 84, highPct: 93 },
  llmGuidance:
    "Bread & bakery is a high-IVC, hyper-local category — wheat flour is domestic, bread is baked regionally (short shelf life forces local production), and brands are Indian (Britannia, Modern, Harvest Gold, English Oven/Bonn). The only leaks are imported baker's yeast/dough improvers and packaging. Plain bread is GST-exempt; rusk/buns/pastry are 5% (HSN 1905).",
  sources: [
    { title: "GST on bread & bakers' wares — HSN 1905 (5%, bread exempt)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "Bread exempt; rusk/pastry 5%" },
    { title: "India wheat production — Ministry of Agriculture", url: "https://agricoop.nic.in/en/statistics", relevance: "Domestic wheat/flour supply for bakeries" },
  ],
};
