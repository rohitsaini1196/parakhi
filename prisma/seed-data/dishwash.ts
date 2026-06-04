import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Dishwash (bar, gel, liquid, powder).
 * Mid-IVC like detergent: surfactants (LAB-derived) and some raw chemicals are
 * partly imported petrochemicals, and the leading brand Vim is HUL-owned. Indian
 * players (Exo, Xpert — Jyothy Labs; Patanjali) score higher. Manufacturing and
 * fillers are domestic. GST 18% (HSN 3402). Needs human review.
 */
export const DISHWASH_TEMPLATE: CategoryTemplate = {
  slug: "dishwash",
  displayName: "Dishwash",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["3402", "34022000", "34022090"],
  keywords: [
    "dishwash", "dish wash", "dishwashing", "vim", "exo", "pril",
    "utensil cleaner", "dish bar", "dishwash gel", "dishwash liquid",
    "scrub bar", "xpert dishwash", "patanjali dishwash", "lemon dishwash",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 32, highPct: 48 },
    packaging: {
      lowPct: 8,
      highPct: 15,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 85 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15 },
      ],
    },
    manufacturing: { lowPct: 7, highPct: 12 },
    logistics: { lowPct: 6, highPct: 10 },
    retailMargin: { lowPct: 9, highPct: 15 },
    brandMargin: { lowPct: 4, highPct: 8 },
    advertising: { lowPct: 4, highPct: 9 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: {
      lowPct: 3,
      highPct: 7,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 55, notes: "Exo, Xpert (Jyothy Labs), Patanjali — Indian." },
        { country: "NL", countryName: "Netherlands", probabilityPct: 30, notes: "Vim owned by HUL (Unilever)." },
        { country: "DE", countryName: "Germany", probabilityPct: 15, notes: "Pril owned by Henkel." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Surfactants (LAB / SLES) & active cleaners",
      sharePct: { low: 45, high: 62 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 60, notes: "LAB is produced domestically (Reliance, Nirma), but feedstock and some specialty surfactants are imported." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 40, notes: "Petrochemical feedstock and specialty surfactants partly imported." },
      ],
    },
    {
      name: "Fillers, salt, fragrance, colour",
      sharePct: { low: 30, high: 48 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 80, notes: "Soda ash, salt, fillers domestic; fragrance partly imported." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 20 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 62, highPct: 80 },
  llmGuidance:
    "Dishwash mirrors detergent — mid-IVC. Surfactant chemistry leans on partly-imported petrochemical feedstock, and the leader Vim is HUL-owned. Indian brands (Exo, Xpert/Jyothy, Patanjali) and dish bars (mostly fillers) score higher. GST 18% under HSN 3402.",
  sources: [
    { title: "GST on cleaning preparations — HSN 3402 (18%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "18% GST on dishwash" },
    { title: "Jyothy Labs — Exo/Pril Indian manufacturing", url: "https://www.jyothylabs.com/", relevance: "Domestic manufacturing of dishwash brands" },
  ],
};
