import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Pulses & dal (toor/arhar, moong, chana, urad, masoor).
 * India is the world's largest producer AND consumer of pulses — but also the
 * largest importer: ~10-15% of supply is imported (toor from Mozambique/Myanmar,
 * urad from Myanmar, masoor & yellow peas from Canada/Australia/Russia). So IVC
 * is high but with a real import drag, unlike rice/atta. Brands mostly Indian
 * (Tata Sampann, Fortune). GST 5% on branded packaged (0% loose, HSN 0713).
 * Needs human review.
 */
export const PULSES_DAL_TEMPLATE: CategoryTemplate = {
  slug: "pulses_dal",
  displayName: "Pulses & Dal",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 5.0,
  hsnCodes: ["0713", "07133100", "07136000", "07139010"],
  keywords: [
    "dal", "daal", "pulses", "toor dal", "arhar", "moong dal", "chana dal",
    "urad dal", "masoor dal", "rajma", "kabuli chana", "lobia", "moth",
    "tata sampann dal", "organic tattva", "fortune dal", "split pulses",
    "whole moong", "kala chana", "green moong",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 64, highPct: 78 },
    packaging: {
      lowPct: 4,
      highPct: 8,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 92 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 8 },
      ],
    },
    manufacturing: { lowPct: 4, highPct: 8 },
    logistics: { lowPct: 6, highPct: 10 },
    retailMargin: { lowPct: 6, highPct: 11 },
    brandMargin: { lowPct: 3, highPct: 6 },
    advertising: { lowPct: 1, highPct: 4 },
    gst: { lowPct: 5, highPct: 5 },
    brandProfit: {
      lowPct: 2,
      highPct: 5,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 90, notes: "Tata Sampann (Tata Consumer), Fortune (Adani Wilmar), Organic Tattva — Indian." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 10 },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Pulses / dal grain",
      sharePct: { low: 96, high: 100 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 85,
          notes: "India grows ~27 million tonnes of pulses (MP, Maharashtra, Rajasthan, UP). Chana, moong and most urad are domestic.",
        },
        {
          country: "MIXED",
          countryName: "Mixed",
          probabilityPct: 15,
          notes: "India imports ~10-15% of pulses: toor from Mozambique/Myanmar, urad from Myanmar, masoor & yellow peas from Canada/Australia/Russia.",
        },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 80, highPct: 92 },
  llmGuidance:
    "Pulses are high-IVC but with a genuine import drag — India is the largest producer yet also the largest importer (~10-15% of supply). Chana/moong are mostly domestic; toor, urad and masoor carry meaningful imports (Mozambique, Myanmar, Canada, Australia). Brands are Indian (Tata Sampann, Fortune). Branded packaged pulses are 5% GST; loose is 0%. IVC sits a notch below rice/atta because of the imported share.",
  sources: [
    {
      title: "India pulses production & imports — Ministry of Agriculture / DGCIS",
      url: "https://agricoop.nic.in/en/statistics",
      relevance: "Domestic production and import dependence on pulses",
    },
    {
      title: "GST on branded packaged pulses — HSN 0713",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "5% GST on branded packaged, 0% loose",
    },
  ],
};
