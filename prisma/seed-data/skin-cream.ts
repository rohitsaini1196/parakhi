import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Skin cream & lotion (face/body moisturisers, fairness creams).
 * Water + humectants + oils + actives + fragrance. Actives and fragrance are
 * largely imported. Brand profit swings: HUL (Pond's, Glow & Lovely, Vaseline,
 * Lakmé) → NL; Nivea → DE; Boroline / Himalaya → IN. GST 18% (HSN 3304).
 * Needs human review.
 */
export const SKIN_CREAM_TEMPLATE: CategoryTemplate = {
  slug: "skin_cream",
  displayName: "Skin Cream & Lotion",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["33049910", "33049920", "33049990", "33042000"],
  keywords: [
    "cream", "face cream", "moisturiser", "moisturizer", "lotion",
    "ponds", "pond's", "glow & lovely", "fair & lovely", "fair and lovely",
    "nivea", "vaseline", "boroline", "lakme", "himalaya", "olay", "garnier",
    "body lotion", "cold cream", "night cream",
    "face wash", "facewash", "face scrub", "scrub", "biotique", "cleanser", "clean & clear",
    "himalaya face wash", "garnier face wash", "neutrogena face wash",
    "cetaphil cleanser", "ponds face wash", "neem face wash",
    "aloe vera gel", "aloe gel", "sunscreen", "spf", "sunblock",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 18, highPct: 30 },
    packaging: { lowPct: 12, highPct: 18 },
    manufacturing: { lowPct: 6, highPct: 10 },
    logistics: { lowPct: 6, highPct: 10 },
    retailMargin: { lowPct: 12, highPct: 18 },
    brandMargin: { lowPct: 5, highPct: 9 },
    advertising: { lowPct: 10, highPct: 18 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: { lowPct: 6, highPct: 14 },
  },
  rawMaterials: [
    {
      name: "Water",
      sharePct: { low: 50, high: 70 },
      typicalOrigin: [{ country: "IN", countryName: "India", probabilityPct: 100 }],
    },
    {
      name: "Humectants & emollients (glycerin, oils, waxes)",
      sharePct: { low: 18, high: 30 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 45 },
        { country: "CN", countryName: "China", probabilityPct: 35, notes: "Glycerin largely imported." },
        { country: "MIXED", countryName: "Mixed (palm-derived, SE Asia)", probabilityPct: 20 },
      ],
    },
    {
      name: "Actives (niacinamide, vitamins, SPF, whitening agents)",
      sharePct: { low: 3, high: 10 },
      typicalOrigin: [
        { country: "MIXED", countryName: "Mixed (EU/China/Japan)", probabilityPct: 80 },
        { country: "IN", countryName: "India", probabilityPct: 20 },
      ],
    },
    {
      name: "Fragrance, preservatives, emulsifiers",
      sharePct: { low: 2, high: 5 },
      typicalOrigin: [
        { country: "MIXED", countryName: "Mixed (imported)", probabilityPct: 75 },
        { country: "IN", countryName: "India", probabilityPct: 25 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 55, highPct: 78 },
  llmGuidance:
    "Fairness/whitening + anti-ageing creams have higher imported-active share. Boroline and Himalaya keep brand profit Indian; Pond's/Glow & Lovely/Vaseline/Lakmé → Unilever NL; Nivea → Beiersdorf DE; Olay → P&G US. Small jars push packaging share higher.",
  sources: [
    { title: "CBIC GST — beauty/skin preparations HSN 3304", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "18% GST" },
    { title: "HUL FY24 — Beauty & Wellbeing segment", url: "https://www.hul.co.in/investor-relations/annual-reports/", relevance: "Margin + foreign parent" },
    { title: "India cosmetic actives & glycerin imports", url: "https://www.dgft.gov.in/CP/", relevance: "Active-ingredient origin" },
  ],
};
