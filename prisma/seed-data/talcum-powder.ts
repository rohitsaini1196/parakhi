import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Talcum & body powder.
 * Mid-IVC: talc is mined in India (Rajasthan), and several brands are Indian
 * (Navratna/Emami, Gokul, Cinthol/Godrej, Dermicool/Emami). Drags are foreign
 * brands (Ponds→HUL, Johnson's→Kenvue US) and imported fragrance. GST 18%
 * (HSN 3304). Needs human review.
 */
export const TALCUM_POWDER_TEMPLATE: CategoryTemplate = {
  slug: "talcum_powder",
  displayName: "Talcum Powder",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["3304", "33049190", "33049910"],
  keywords: [
    "talcum powder", "talc", "body powder", "prickly heat powder",
    "cool talc", "ponds powder", "navratna powder", "gokul", "dermicool",
    "cinthol talc", "johnson's baby powder", "after bath powder", "dusting powder",
    "dreamflower talc", "original talc", "santoor talc", "baby powder",
    "prickly heat powder", "cool talcum",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 30, highPct: 45 },
    packaging: {
      lowPct: 10,
      highPct: 18,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 88 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 12 },
      ],
    },
    manufacturing: { lowPct: 6, highPct: 11 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 9, highPct: 15 },
    brandMargin: { lowPct: 4, highPct: 9 },
    advertising: { lowPct: 4, highPct: 10 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: {
      lowPct: 3,
      highPct: 7,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 55, notes: "Navratna/Dermicool (Emami), Gokul, Cinthol (Godrej) — Indian." },
        { country: "NL", countryName: "Netherlands", probabilityPct: 25, notes: "Ponds owned by HUL (Unilever)." },
        { country: "US", countryName: "United States", probabilityPct: 20, notes: "Johnson's owned by Kenvue." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Talc (mineral)",
      sharePct: { low: 70, high: 86 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 85, notes: "Talc is mined domestically (Rajasthan, Uttarakhand); India is a significant talc producer." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15 },
      ],
    },
    {
      name: "Fragrance, menthol, additives",
      sharePct: { low: 14, high: 30 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 55, notes: "Menthol is domestic (India is the largest mint producer)." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 45, notes: "Synthetic fragrance partly imported." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 62, highPct: 80 },
  llmGuidance:
    "Talcum powder is mid-IVC. Talc is mined domestically (Rajasthan) and menthol for cool/prickly-heat powders is Indian (India is the largest mint producer), so Indian brands (Navratna, Dermicool, Gokul, Cinthol) score well. The drag is foreign brands (Ponds/HUL, Johnson's/Kenvue) and imported fragrance. GST 18% under HSN 3304.",
  sources: [
    { title: "GST on talcum/cosmetic powder — HSN 3304 (18%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "18% GST on talcum powder" },
    { title: "India talc production & mint — IBM / Spices Board", url: "https://ibm.gov.in/", relevance: "Domestic talc and menthol supply" },
  ],
};
