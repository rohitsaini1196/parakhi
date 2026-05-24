import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Chocolate & cocoa confectionery.
 * Cocoa is the import story: India grows very little; cocoa beans/butter/
 * liquor come from West Africa (Ivory Coast, Ghana) + some SE Asia. Brand
 * profit is the swing: Mondelez (Cadbury Dairy Milk, Oreo, 5 Star) → US,
 * Nestlé (KitKat, Munch) → CH, Ferrero → IT; Amul → IN.
 * GST 18% (HSN 1806). Needs human review.
 */
export const CHOCOLATE_TEMPLATE: CategoryTemplate = {
  slug: "chocolate",
  displayName: "Chocolate",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["18063100", "18063200", "18069010", "18069020", "18069090"],
  keywords: [
    "chocolate", "dairy milk", "cadbury", "kitkat", "kit kat", "munch",
    "5 star", "five star", "perk", "gems", "milky bar", "milkybar",
    "ferrero", "nutella", "snickers", "bournville", "amul chocolate",
    "dark chocolate", "silk", "fuse",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 28, highPct: 42 },
    packaging: { lowPct: 8, highPct: 14 },
    manufacturing: { lowPct: 6, highPct: 10 },
    logistics: { lowPct: 6, highPct: 10 },
    retailMargin: { lowPct: 12, highPct: 18 },
    brandMargin: { lowPct: 4, highPct: 9 },
    advertising: { lowPct: 6, highPct: 12 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: { lowPct: 5, highPct: 12 },
  },
  rawMaterials: [
    {
      name: "Cocoa (beans / butter / liquor)",
      sharePct: { low: 25, high: 45 },
      typicalOrigin: [
        { country: "CI", countryName: "Ivory Coast", probabilityPct: 40, notes: "World's largest cocoa producer." },
        { country: "GH", countryName: "Ghana", probabilityPct: 30 },
        { country: "ID", countryName: "Indonesia", probabilityPct: 15 },
        { country: "IN", countryName: "India (small Kerala/AP crop)", probabilityPct: 15 },
      ],
    },
    {
      name: "Sugar",
      sharePct: { low: 30, high: 45 },
      typicalOrigin: [{ country: "IN", countryName: "India", probabilityPct: 98 }],
    },
    {
      name: "Milk solids",
      sharePct: { low: 15, high: 30 },
      typicalOrigin: [{ country: "IN", countryName: "India", probabilityPct: 95 }],
    },
    {
      name: "Emulsifiers, flavour (lecithin, vanillin)",
      sharePct: { low: 1, high: 4 },
      typicalOrigin: [
        { country: "MIXED", countryName: "Mixed (mostly imported)", probabilityPct: 70 },
        { country: "IN", countryName: "India", probabilityPct: 30 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 55, highPct: 78 },
  llmGuidance:
    "Dark chocolate has higher cocoa share (more imported) → lower IVC. Milk chocolate leans on Indian milk + sugar. Wafer/filled bars (KitKat, 5 Star) cut cocoa share with biscuit/caramel. Brand profit attribution dominates: Cadbury/Oreo → Mondelez (US), KitKat/Munch → Nestlé (CH). Amul is fully Indian.",
  sources: [
    { title: "CBIC GST — cocoa products HSN 1806", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "18% GST" },
    { title: "India cocoa imports (Ivory Coast, Ghana)", url: "https://www.dgft.gov.in/CP/", relevance: "Cocoa origin split" },
    { title: "Mondelez India / Nestlé India filings", url: "https://www.mca.gov.in/", relevance: "Brand margin + foreign parent" },
    { title: "Directorate of Cashewnut & Cocoa Development", url: "https://dccd.gov.in/", relevance: "India's small domestic cocoa crop" },
  ],
};
