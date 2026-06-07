import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Pickle & achaar (mango, lime, mixed, chilli).
 * One of the most Indian categories: mango/lime/chilli/mustard-oil are all
 * domestic, and brands are overwhelmingly Indian (Mother's Recipe, Priya,
 * Nilon's, Bedekar, Patanjali, Tops). High IVC; the only minor leak is imported
 * glass/packaging and some acetic acid. GST 12% (HSN 2001). Needs human review.
 */
export const PICKLE_ACHAAR_TEMPLATE: CategoryTemplate = {
  slug: "pickle_achaar",
  displayName: "Pickle & Achaar",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 12.0,
  hsnCodes: ["2001", "20019000", "20059900"],
  keywords: [
    "pickle", "achaar", "achar", "mango pickle", "lime pickle", "mixed pickle",
    "chilli pickle", "aam ka achaar", "nimbu achaar", "mother's recipe",
    "priya pickle", "nilon's", "bedekar", "tops pickle", "ruchi pickle",
    "gongura", "avakkai", "garlic pickle",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 45, highPct: 60 },
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
    retailMargin: { lowPct: 8, highPct: 13 },
    brandMargin: { lowPct: 3, highPct: 7 },
    advertising: { lowPct: 2, highPct: 5 },
    gst: { lowPct: 12, highPct: 12 },
    brandProfit: {
      lowPct: 3,
      highPct: 6,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 95, notes: "Mother's Recipe, Priya (Desai Brothers), Nilon's, Bedekar, Patanjali, Tops — Indian." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 5 },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Mango / lime / vegetables & chilli",
      sharePct: { low: 55, high: 72 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 99, notes: "Raw mango, lime, green chilli, carrot, garlic — all domestically grown and seasonal." },
      ],
    },
    {
      name: "Mustard/sesame oil, salt & spices",
      sharePct: { low: 28, high: 42 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 95, notes: "Mustard oil, salt, mustard seed, fenugreek, turmeric, asafoetida — domestic." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 84, highPct: 93 },
  llmGuidance:
    "Pickle/achaar is a high-IVC category — every core input (raw mango, lime, chilli, mustard oil, spices, salt) is domestic and seasonal, and the brands are Indian (Mother's Recipe, Priya, Nilon's, Bedekar, Patanjali). The only small leaks are imported glass jars / packaging and some food-grade acetic acid. GST 12% under HSN 2001.",
  sources: [
    { title: "GST on pickles (vinegar-preserved) — HSN 2001 (12%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "12% GST on pickle/achaar" },
    { title: "India mango & horticulture production — APEDA/NHB", url: "https://apeda.gov.in/", relevance: "Domestic raw-material supply for pickles" },
  ],
};
