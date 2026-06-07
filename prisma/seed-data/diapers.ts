import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Baby diapers.
 * Lower-IVC: dominated by foreign brands (Pampers→P&G US, Huggies→Kimberly-Clark
 * US, MamyPoko→Unicharm JP), and the absorbent core (fluff pulp + SAP) is largely
 * imported. Assembly is domestic and Indian brands (Himalaya, Bumtum, Teddyy/
 * Nobel) exist. Unlike pads, diapers are GST 12% (HSN 9619). Needs human review.
 */
export const DIAPERS_TEMPLATE: CategoryTemplate = {
  slug: "diapers",
  displayName: "Baby Diapers",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 12.0,
  hsnCodes: ["9619", "96190020", "96190030"],
  keywords: [
    "diaper", "diapers", "baby diaper", "pants diaper", "taped diaper",
    "pampers", "huggies", "mamypoko", "teddyy", "bumtum", "suples",
    "baby pants", "newborn diaper", "diaper pants", "nappy",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 40, highPct: 55 },
    packaging: {
      lowPct: 7,
      highPct: 13,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 85 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15 },
      ],
    },
    manufacturing: { lowPct: 8, highPct: 14 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 8, highPct: 14 },
    brandMargin: { lowPct: 5, highPct: 10 },
    advertising: { lowPct: 4, highPct: 10 },
    gst: { lowPct: 12, highPct: 12 },
    brandProfit: {
      lowPct: 3,
      highPct: 8,
      origins: [
        { country: "US", countryName: "United States", probabilityPct: 50, notes: "Pampers (P&G), Huggies (Kimberly-Clark) lead." },
        { country: "JP", countryName: "Japan", probabilityPct: 22, notes: "MamyPoko owned by Unicharm." },
        { country: "IN", countryName: "India", probabilityPct: 28, notes: "Himalaya, Bumtum, Teddyy (Nobel Hygiene), Suples — Indian." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Fluff pulp & SAP (super-absorbent polymer)",
      sharePct: { low: 50, high: 68 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 28, notes: "Limited domestic SAP/fluff." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 72, notes: "Fluff pulp and SAP largely imported (US, Japan, Korea, Germany)." },
      ],
    },
    {
      name: "Non-woven, elastics, films, adhesive",
      sharePct: { low: 28, high: 45 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 68, notes: "Non-woven and films increasingly domestic." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 32 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 44, highPct: 66 },
  llmGuidance:
    "Baby diapers are lower-IVC than pads — same imported absorbent core (fluff pulp + SAP), same foreign-dominated market (Pampers/P&G, Huggies/KC, MamyPoko/Unicharm), but diapers carry 12% GST (not exempt). Indian brands (Himalaya, Teddyy, Bumtum) and locally-assembled lines score a little higher. GST 12% under HSN 9619.",
  sources: [
    { title: "GST on baby diapers — HSN 9619 (12%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "12% GST on diapers" },
    { title: "India SAP & fluff pulp imports — DGCIS", url: "https://tradestat.commerce.gov.in/", relevance: "Imported absorbent raw materials" },
  ],
};
