import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Packaged rice (basmati + non-basmati).
 * India is the world's largest rice exporter and 2nd largest producer; paddy is
 * grown and milled domestically. IVC is very high — the only drag is a few
 * foreign-owned brands (Kohinoor → McCormick US, Tilda → Ebro Foods ES) and
 * imported jute/packaging. GST 5% on branded packaged rice (0% loose/unbranded,
 * HSN 1006). Needs human review.
 */
export const RICE_TEMPLATE: CategoryTemplate = {
  slug: "rice",
  displayName: "Rice",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 5.0,
  hsnCodes: ["1006", "10063020", "10063090"],
  keywords: [
    "rice", "basmati", "basmati rice", "sona masoori", "kolam rice",
    "idli rice", "brown rice", "india gate", "daawat", "kohinoor",
    "lal qilla", "fortune rice", "tilda", "shrilalmahal", "kobra",
    "double horse", "ponni rice", "steam rice", "raw rice",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 62, highPct: 75 },
    packaging: {
      lowPct: 4,
      highPct: 9,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 90 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 10 },
      ],
    },
    manufacturing: { lowPct: 4, highPct: 8 },
    logistics: { lowPct: 6, highPct: 10 },
    retailMargin: { lowPct: 6, highPct: 11 },
    brandMargin: { lowPct: 3, highPct: 7 },
    advertising: { lowPct: 1, highPct: 4 },
    gst: { lowPct: 5, highPct: 5 },
    brandProfit: {
      lowPct: 2,
      highPct: 5,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 82, notes: "India Gate (KRBL), Daawat (LT Foods), Lal Qilla, Fortune (Adani Wilmar) — Indian." },
        { country: "US", countryName: "United States", probabilityPct: 12, notes: "Kohinoor brand owned by McCormick (US)." },
        { country: "ES", countryName: "Spain", probabilityPct: 6, notes: "Tilda owned by Ebro Foods (Spain)." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Paddy / rice grain",
      sharePct: { low: 96, high: 100 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 99,
          notes: "India produces ~135 million tonnes of rice annually (Punjab, WB, UP, AP, Telangana). Basmati is a GI crop grown only in the Indo-Gangetic plain. Zero import dependency.",
        },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 88, highPct: 96 },
  llmGuidance:
    "Rice is among the highest-IVC categories — paddy is 100% Indian, milling is domestic, and basmati is a protected Indian GI crop. The dominant brands (India Gate/KRBL, Daawat/LT Foods, Fortune) are Indian; the only drag is Kohinoor (McCormick, US) and Tilda (Ebro, Spain) brand profit, plus imported jute/poly packaging. Branded packaged rice is 5% GST; loose/unbranded is 0%.",
  sources: [
    {
      title: "India rice production & exports — APEDA",
      url: "https://apeda.gov.in/apedawebsite/SubHead_Products/Basmati_Rice.htm",
      relevance: "World's largest rice exporter; domestic paddy supply",
    },
    {
      title: "GST on branded packaged rice — HSN 1006",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "5% GST on branded packaged, 0% loose",
    },
  ],
};
