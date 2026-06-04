import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Sanitary pads.
 * Mixed-IVC: the category is led by foreign brands (Whisper→P&G US,
 * Stayfree→Kenvue US, Sofy→Unicharm JP) and the core absorbents (fluff pulp,
 * SAP super-absorbent polymer) are largely imported. But assembly is domestic,
 * Indian brands (Nine, Sirona, Sanfe, RIO) are growing, and pads are GST-EXEMPT
 * (0%) since 2018 — so no tax leaves the system. HSN 9619. Needs human review.
 */
export const SANITARY_PADS_TEMPLATE: CategoryTemplate = {
  slug: "sanitary_pads",
  displayName: "Sanitary Pads",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 0.0,
  hsnCodes: ["9619", "96190010", "96190090"],
  keywords: [
    "sanitary pad", "sanitary napkin", "pad", "whisper", "stayfree", "sofy",
    "ultra pads", "maxi pads", "nine pads", "sirona", "sanfe", "panty liner",
    "menstrual pad", "wings pad", "rio pad",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 38, highPct: 52 },
    packaging: {
      lowPct: 8,
      highPct: 14,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 85 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15 },
      ],
    },
    manufacturing: { lowPct: 8, highPct: 14 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 9, highPct: 15 },
    brandMargin: { lowPct: 5, highPct: 10 },
    advertising: { lowPct: 5, highPct: 11 },
    gst: { lowPct: 0, highPct: 0 },
    brandProfit: {
      lowPct: 3,
      highPct: 8,
      origins: [
        { country: "US", countryName: "United States", probabilityPct: 45, notes: "Whisper (P&G), Stayfree (Kenvue) lead the market." },
        { country: "JP", countryName: "Japan", probabilityPct: 15, notes: "Sofy owned by Unicharm." },
        { country: "IN", countryName: "India", probabilityPct: 40, notes: "Nine, Sirona, Sanfe, RIO and many regional/SHG brands — Indian." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Fluff pulp & SAP (super-absorbent polymer)",
      sharePct: { low: 50, high: 68 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 30, notes: "Some domestic non-woven; limited domestic SAP." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 70, notes: "Fluff pulp (US/Nordic) and SAP (Japan/Korea/Germany) are largely imported." },
      ],
    },
    {
      name: "Non-woven topsheet, adhesive, back film",
      sharePct: { low: 28, high: 45 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 70, notes: "Non-woven and films increasingly domestic." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 30 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 48, highPct: 70 },
  llmGuidance:
    "Sanitary pads are mixed-IVC. The absorbent core (fluff pulp + SAP) is largely imported and the market is led by US brands (Whisper/P&G, Stayfree/Kenvue), but assembly is domestic, Indian brands (Nine, Sirona, Sanfe) are rising, and — importantly — pads carry 0% GST (exempt since 2018), so no tax leaves the system. GST exempt under HSN 9619.",
  sources: [
    { title: "GST exemption on sanitary napkins — HSN 9619 (0%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "Sanitary pads GST-exempt since 2018" },
    { title: "India SAP & fluff pulp imports — DGCIS", url: "https://tradestat.commerce.gov.in/", relevance: "Imported absorbent raw materials" },
  ],
};
