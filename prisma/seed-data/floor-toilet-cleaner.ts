import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Floor & toilet cleaners (Lizol, Harpic, Domex, Colin).
 * Lower-IVC home care: the category is dominated by foreign-owned brands
 * (Reckitt UK — Harpic, Lizol, Colin; HUL — Domex), and acids/biocides/
 * surfactants are partly imported chemicals. Water, fillers, bottles and
 * manufacturing are domestic. GST 18% (HSN 3402). Needs human review.
 */
export const FLOOR_TOILET_CLEANER_TEMPLATE: CategoryTemplate = {
  slug: "floor_toilet_cleaner",
  displayName: "Floor & Toilet Cleaner",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["3402", "34029091", "34029099"],
  keywords: [
    "floor cleaner", "toilet cleaner", "surface cleaner", "phenyl",
    "harpic", "lizol", "domex", "colin", "glass cleaner", "disinfectant cleaner",
    "toilet cleaning", "floor cleaning", "bathroom cleaner", "sanitiser cleaner",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 28, highPct: 42 },
    packaging: {
      lowPct: 10,
      highPct: 18,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 86 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 14 },
      ],
    },
    manufacturing: { lowPct: 7, highPct: 12 },
    logistics: { lowPct: 6, highPct: 11 },
    retailMargin: { lowPct: 9, highPct: 15 },
    brandMargin: { lowPct: 4, highPct: 9 },
    advertising: { lowPct: 5, highPct: 11 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: {
      lowPct: 3,
      highPct: 8,
      origins: [
        { country: "GB", countryName: "United Kingdom", probabilityPct: 50, notes: "Harpic, Lizol, Colin owned by Reckitt (UK)." },
        { country: "NL", countryName: "Netherlands", probabilityPct: 20, notes: "Domex owned by HUL (Unilever)." },
        { country: "IN", countryName: "India", probabilityPct: 30, notes: "Patanjali, Dr. Beckmann distrib., local phenyl makers." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Acids / biocides / surfactants",
      sharePct: { low: 40, high: 58 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 55, notes: "HCl, pine oil and some surfactants domestic." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 45, notes: "Specialty biocides (e.g. benzalkonium chloride) and fragrances partly imported (China/EU)." },
      ],
    },
    {
      name: "Water, fillers, fragrance, colour",
      sharePct: { low: 35, high: 55 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 85 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 55, highPct: 74 },
  llmGuidance:
    "Floor & toilet cleaners are lower-IVC home care because the category is overwhelmingly foreign-owned (Reckitt UK runs Harpic/Lizol/Colin; HUL runs Domex), so brand profit and royalties flow abroad, and specialty biocides/fragrances are imported. The bulk (water, fillers, bottles, manufacturing) is Indian. Local phenyl and Patanjali score higher. GST 18% under HSN 3402.",
  sources: [
    { title: "GST on cleaning preparations — HSN 3402 (18%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "18% GST on floor/toilet cleaners" },
    { title: "Reckitt India — Harpic/Lizol brand ownership", url: "https://www.reckitt.com/", relevance: "Foreign brand ownership (UK)" },
  ],
};
