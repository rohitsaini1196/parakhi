import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Frozen foods (peas, fries, nuggets, parathas, snacks).
 * Frozen peas and vegetable snacks are largely domestic (Safal, ITC, Godrej);
 * the drags are McCain (Canadian brand, though it manufactures in India) and
 * imported processing/packaging. Cold-chain logistics is a big cost bucket.
 * GST 12-18% (HSN 2004). Needs human review.
 */
export const FROZEN_FOODS_TEMPLATE: CategoryTemplate = {
  slug: "frozen_foods",
  displayName: "Frozen Foods",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 12.0,
  hsnCodes: ["2004", "20049000", "07108000"],
  keywords: [
    "frozen", "frozen peas", "french fries", "frozen fries", "nuggets",
    "frozen paratha", "aloo tikki", "spring roll", "smileys", "mccain",
    "safal", "yummiez", "itc master chef", "frozen snacks", "veg fingers",
    "frozen corn", "frozen vegetables",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 38, highPct: 52 },
    packaging: {
      lowPct: 8,
      highPct: 14,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 86 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 14 },
      ],
    },
    manufacturing: { lowPct: 8, highPct: 13 },
    logistics: { lowPct: 9, highPct: 16 },
    retailMargin: { lowPct: 8, highPct: 14 },
    brandMargin: { lowPct: 3, highPct: 7 },
    advertising: { lowPct: 2, highPct: 6 },
    gst: { lowPct: 12, highPct: 12 },
    brandProfit: {
      lowPct: 3,
      highPct: 6,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 75, notes: "Safal (Mother Dairy), ITC Master Chef, Godrej Yummiez — Indian." },
        { country: "CA", countryName: "Canada", probabilityPct: 18, notes: "McCain (Canadian) — though it runs an Indian plant in Gujarat." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 7 },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Vegetables / potato / grain",
      sharePct: { low: 70, high: 88 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 90, notes: "Peas, potato, corn, wheat for parathas — domestically grown (UP, Punjab, Gujarat)." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 10 },
      ],
    },
    {
      name: "Oil, batter, seasonings",
      sharePct: { low: 12, high: 28 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 70 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 30, notes: "Frying oil may be imported palm; some seasonings imported." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 72, highPct: 86 },
  llmGuidance:
    "Frozen foods are moderate-to-high IVC. Frozen peas, parathas, aloo tikki and veg snacks from Safal/ITC/Godrej are largely domestic. The drag is McCain (Canadian brand, but it manufactures fries in Gujarat — so most value is still Indian), imported frying palm oil, and packaging. Cold-chain logistics is unusually large. GST 12% under HSN 2004.",
  sources: [
    { title: "GST on prepared/frozen vegetables — HSN 2004 (12%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "12% GST on frozen prepared foods" },
    { title: "Mother Dairy Safal — frozen vegetable sourcing", url: "https://www.motherdairy.com/safal", relevance: "Domestic frozen-vegetable supply chain" },
  ],
};
