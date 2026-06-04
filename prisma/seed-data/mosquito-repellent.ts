import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Mosquito repellent (liquid vaporisers, coils, cards, creams).
 * Mixed-IVC: the leaders are split between Indian (Good Knight, Hit — Godrej;
 * Odomos — Dabur) and foreign (All Out — SC Johnson US; Mortein — Reckitt UK).
 * The active ingredient (prallethrin/allethrin/transfluthrin) is largely
 * imported (China). Devices, coils base and manufacturing are domestic. GST 18%
 * (HSN 3808). Needs human review.
 */
export const MOSQUITO_REPELLENT_TEMPLATE: CategoryTemplate = {
  slug: "mosquito_repellent",
  displayName: "Mosquito Repellent",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["3808", "38089161", "38089191"],
  keywords: [
    "mosquito", "repellent", "mosquito coil", "vaporiser", "vaporizer",
    "good knight", "all out", "mortein", "hit", "odomos", "liquid refill",
    "mosquito racket", "incense coil", "kachua chaap", "fast card",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 30, highPct: 45 },
    packaging: {
      lowPct: 9,
      highPct: 16,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 85 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15 },
      ],
    },
    manufacturing: { lowPct: 7, highPct: 12 },
    logistics: { lowPct: 5, highPct: 10 },
    retailMargin: { lowPct: 8, highPct: 14 },
    brandMargin: { lowPct: 4, highPct: 9 },
    advertising: { lowPct: 5, highPct: 11 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: {
      lowPct: 3,
      highPct: 7,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 55, notes: "Good Knight, Hit (Godrej), Odomos (Dabur) — Indian." },
        { country: "US", countryName: "United States", probabilityPct: 25, notes: "All Out owned by SC Johnson." },
        { country: "GB", countryName: "United Kingdom", probabilityPct: 20, notes: "Mortein owned by Reckitt." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Active insecticide (prallethrin / allethrin / transfluthrin)",
      sharePct: { low: 25, high: 45 },
      typicalOrigin: [
        { country: "CN", countryName: "China", probabilityPct: 65, notes: "Pyrethroid actives are largely imported from China." },
        { country: "IN", countryName: "India", probabilityPct: 35, notes: "Some domestic pyrethroid synthesis (e.g. by Indian agrochem makers)." },
      ],
    },
    {
      name: "Device / coil base / solvent / packaging",
      sharePct: { low: 55, high: 75 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 82, notes: "Coil powder base, liquid solvent, plastic devices and machines are domestic." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 18 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 58, highPct: 76 },
  llmGuidance:
    "Mosquito repellents are mixed-IVC. The active pyrethroid (prallethrin/allethrin) is mostly imported from China, but devices, coil base, solvent and manufacturing are domestic. Brand ownership is split — Godrej (Good Knight, Hit) and Dabur (Odomos) are Indian; All Out (SC Johnson) and Mortein (Reckitt) are foreign. GST 18% under HSN 3808.",
  sources: [
    { title: "GST on insecticides — HSN 3808 (18%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "18% GST on mosquito repellents" },
    { title: "Godrej Consumer — Good Knight Indian manufacturing", url: "https://www.godrejcp.com/", relevance: "Domestic device manufacturing; imported actives" },
  ],
};
