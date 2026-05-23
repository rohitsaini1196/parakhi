import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Packaged chips and namkeen.
 *
 * Wide category — potato chips (Lay's, Bingo), extruded snacks (Kurkure,
 * Cheetos), traditional namkeen / bhujia / mixture (Haldiram's, Bikaji, Balaji).
 * GST 12% on chips post-2025; 18% on roasted/savoury "namkeen" — we use 12%
 * default and let HSN lookup override per product.
 *
 * Palm oil dominates the imported-input story (frying medium, ~20% by weight).
 * Brand-profit attribution is the swing: Lay's/Kurkure flow to PepsiCo (US),
 * Bingo to ITC (IN), Haldiram's/Bikaji/Balaji are domestic.
 *
 * Needs human review.
 */
export const CHIPS_NAMKEEN_TEMPLATE: CategoryTemplate = {
  slug: "chips_namkeen",
  displayName: "Chips & Namkeen",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 12.0,
  // Potato chips: HSN 20052000. Extruded / namkeen / bhujia: HSN 21069099.
  hsnCodes: ["20052000", "21069099", "21069060"],
  keywords: [
    "chips", "potato chips", "wafers", "lays", "lay's",
    "kurkure", "bingo", "uncle chipps", "uncle chips", "pringles",
    "namkeen", "bhujia", "sev", "mixture", "dal moth", "papdi",
    "haldiram", "haldiram's", "bikaji", "balaji", "yellow diamond",
    "cheetos", "doritos", "cornitos",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 22, highPct: 32 },
    packaging: {
      lowPct: 12,
      highPct: 18,
      // Metalised BOPP film + nitrogen flush. BOPP film mostly Indian
      // (Cosmo Films, Jindal Poly, Uflex). Metalising done domestically.
      origins: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 90,
          notes: "Cosmo Films, Uflex, Jindal Poly — India is a major BOPP exporter.",
        },
        { country: "MIXED", countryName: "Mixed (small imports)", probabilityPct: 10 },
      ],
    },
    manufacturing: { lowPct: 6, highPct: 11 },
    logistics: { lowPct: 8, highPct: 12 },
    retailMargin: { lowPct: 12, highPct: 18 },
    brandMargin: { lowPct: 4, highPct: 8 },
    advertising: { lowPct: 6, highPct: 12 },
    gst: { lowPct: 12, highPct: 12 },
    brandProfit: { lowPct: 5, highPct: 12 },
  },
  rawMaterials: [
    {
      name: "Potato / corn / pulses / besan (chickpea flour)",
      sharePct: { low: 55, high: 75 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 100,
          notes: "UP, MP, Punjab for potato; Karnataka, Maharashtra for corn; Rajasthan, MP for chickpea.",
        },
      ],
    },
    {
      name: "Palm oil (frying medium)",
      sharePct: { low: 15, high: 25 },
      typicalOrigin: [
        { country: "ID", countryName: "Indonesia", probabilityPct: 45 },
        { country: "MY", countryName: "Malaysia", probabilityPct: 45 },
        { country: "TH", countryName: "Thailand", probabilityPct: 7 },
        { country: "IN", countryName: "India (refined locally)", probabilityPct: 3 },
      ],
    },
    {
      name: "Salt",
      sharePct: { low: 2, high: 4 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 100 },
      ],
    },
    {
      name: "Seasoning blend (spices, MSG, hydrolyzed protein, dehydrated veg)",
      sharePct: { low: 5, high: 10 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 70 },
        {
          country: "CN",
          countryName: "China",
          probabilityPct: 25,
          notes: "MSG and hydrolyzed protein largely imported.",
        },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 5 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 75, highPct: 90 },
  llmGuidance:
    "Single-serve sachets (₹5-10) carry higher packaging share. Premium/imported variants (Pringles, Doritos, Cheetos) may have higher US royalty + actually-imported finished product — check brand origin. Traditional namkeen (Haldiram's, Bikaji) leans toward besan/dal raw materials, Indian end-to-end, brand-profit fully Indian. Multigrain / baked variants are healthier-marketed = higher advertising share.",
  sources: [
    {
      title: "PepsiCo India (Lay's/Kurkure) FY24 — Varun Beverages-style data",
      url: "https://www.pepsico.com/who-we-are/our-company",
      relevance: "Lay's/Kurkure brand origin attribution",
    },
    {
      title: "ITC Limited FNB segment (Bingo, Sunfeast)",
      url: "https://www.itcportal.com/businesses/fmcg/",
      relevance: "Bingo brand margin + Indian attribution",
    },
    {
      title: "Haldiram's company snapshot (Tofler)",
      url: "https://www.tofler.in/haldiram-snacks-private-limited",
      relevance: "Indian namkeen margin benchmark",
    },
    {
      title: "CBIC GST — HSN 2005 / 2106 (snacks, namkeen)",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "12% GST on packaged chips",
    },
    {
      title: "India palm oil imports — Indonesia & Malaysia",
      url: "https://tradeint.com/insights/india-imports-palm-oil-from-which-country-2024-2025/",
      relevance: "Frying medium origin split",
    },
    {
      title: "Cosmo Films / Uflex — BOPP packaging",
      url: "https://www.cosmofilms.com/",
      relevance: "Indian domestic flexible packaging supply",
    },
  ],
};
