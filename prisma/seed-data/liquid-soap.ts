import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Liquid soap, handwash, antiseptic liquids.
 * Surfactants (SLS/SLES) are the dominant import: China + Germany.
 * Active ingredients (chloroxylenol, triclosan) imported.
 * Water is ~50% of volume but low cost share.
 * Needs human review.
 */
export const LIQUID_SOAP_TEMPLATE: CategoryTemplate = {
  slug: "liquid_soap",
  displayName: "Liquid Soap & Handwash",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["34012000", "34022090", "34013000", "34029019"],
  keywords: [
    "handwash", "hand wash", "liquid soap", "antiseptic liquid",
    "dettol", "lifebuoy handwash", "savlon handwash", "himalaya handwash",
    "foaming hand wash", "hand sanitizer", "sanitiser", "sanitizer",
    "antibacterial wash", "germ protection wash",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 30, highPct: 42 },
    packaging: {
      lowPct: 8,
      highPct: 14,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 80, notes: "HDPE/PET bottles largely domestic." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 20 },
      ],
    },
    manufacturing: { lowPct: 6, highPct: 10 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 12, highPct: 20 },
    brandMargin: { lowPct: 5, highPct: 10 },
    advertising: { lowPct: 6, highPct: 12 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: {
      lowPct: 4,
      highPct: 8,
      origins: [
        { country: "GB", countryName: "United Kingdom", probabilityPct: 60, notes: "Reckitt (Dettol, Savlon) HQ London; P&G (Safeguard) US." },
        { country: "NL", countryName: "Netherlands", probabilityPct: 25, notes: "HUL (Lifebuoy) parent Unilever." },
        { country: "IN", countryName: "India", probabilityPct: 15, notes: "Himalaya Drug Company — fully Indian." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Surfactants (SLS, SLES, cocamidopropyl betaine)",
      sharePct: { low: 35, high: 50 },
      typicalOrigin: [
        { country: "CN", countryName: "China", probabilityPct: 55, notes: "China dominant in SLS/SLES; also large Indian capacity (Godrej, Aarti)." },
        { country: "IN", countryName: "India", probabilityPct: 30, notes: "Godrej Industries, Aarti Surfactants — growing domestic capacity." },
        { country: "DE", countryName: "Germany", probabilityPct: 15, notes: "Specialty surfactants from BASF/Clariant for premium variants." },
      ],
    },
    {
      name: "Active ingredients (chloroxylenol, triclosan, benzalkonium chloride)",
      sharePct: { low: 3, high: 10 },
      typicalOrigin: [
        { country: "CN", countryName: "China", probabilityPct: 75, notes: "China is dominant producer of chloroxylenol (PCMX) used in Dettol." },
        { country: "IN", countryName: "India", probabilityPct: 25 },
      ],
    },
    {
      name: "Water",
      sharePct: { low: 30, high: 50 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 100 },
      ],
    },
    {
      name: "Glycerin, fragrance, preservatives",
      sharePct: { low: 5, high: 12 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 50, notes: "Glycerin largely domestic (soap byproduct)." },
        { country: "MIXED", countryName: "Mixed (EU/China)", probabilityPct: 50, notes: "Fragrance compounds often imported." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 60, highPct: 75 },
  llmGuidance:
    "Liquid soap IVC is dragged down by surfactant imports (China/Germany) and foreign brand profit (Reckitt for Dettol, HUL for Lifebuoy). Water is ~50% of volume but contributes little to cost. Himalaya is the outlier — Indian brand, higher IVC. For antiseptic liquids (Dettol Antiseptic) the active ingredient (chloroxylenol) is almost entirely imported from China. GST 18% on all variants.",
  sources: [
    {
      title: "India surfactant industry — Aarti Surfactants IPO prospectus",
      url: "https://www.sebi.gov.in/sebi_data/attachdocs/feb-2021/1613462785540.pdf",
      relevance: "Domestic surfactant capacity; import share",
    },
    {
      title: "Reckitt India annual report (Dettol parent)",
      url: "https://www.reckitt.com/investors/reports-and-presentations/",
      relevance: "Brand profit attribution",
    },
    {
      title: "GST rate on liquid soap — HSN 3401/3402",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "18% GST",
    },
  ],
};
