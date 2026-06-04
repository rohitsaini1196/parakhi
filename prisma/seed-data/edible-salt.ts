import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Edible salt (iodised/rock/sea).
 * Among the most Indian categories possible: India is the world's 3rd largest
 * salt producer (Gujarat/Rajasthan/TN coast), brands are Indian (Tata, Aashirvaad,
 * Catch, Nirma), and edible common salt is GST-EXEMPT (0%) — so there's no tax
 * slice at all. The only minor drag is imported potassium iodate for iodisation
 * and packaging film. HSN 2501. Needs human review.
 */
export const EDIBLE_SALT_TEMPLATE: CategoryTemplate = {
  slug: "edible_salt",
  displayName: "Edible Salt",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 0.0,
  hsnCodes: ["2501", "25010010", "25010020"],
  keywords: [
    "salt", "namak", "iodised salt", "iodized salt", "rock salt",
    "sendha namak", "black salt", "kala namak", "sea salt", "table salt",
    "tata salt", "aashirvaad salt", "catch salt", "nirma shudh", "annapurna salt",
    "crystal salt", "vacuum salt",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 30, highPct: 45 },
    packaging: {
      lowPct: 10,
      highPct: 18,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 90 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 10 },
      ],
    },
    manufacturing: { lowPct: 8, highPct: 14 },
    logistics: { lowPct: 8, highPct: 14 },
    retailMargin: { lowPct: 8, highPct: 14 },
    brandMargin: { lowPct: 4, highPct: 8 },
    advertising: { lowPct: 2, highPct: 6 },
    gst: { lowPct: 0, highPct: 0 },
    brandProfit: {
      lowPct: 3,
      highPct: 7,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 92, notes: "Tata Salt (Tata Chemicals), Aashirvaad (ITC), Catch (DS Group), Nirma — all Indian." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 8 },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Crude salt (solar/marine)",
      sharePct: { low: 88, high: 96 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 99,
          notes: "India is the 3rd largest salt producer (~30 MT), almost entirely from Gujarat, Rajasthan and the Tamil Nadu coast via solar evaporation.",
        },
      ],
    },
    {
      name: "Potassium iodate (iodisation)",
      sharePct: { low: 1, high: 4 },
      typicalOrigin: [
        { country: "CN", countryName: "China", probabilityPct: 55 },
        { country: "IN", countryName: "India", probabilityPct: 45 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 90, highPct: 98 },
  llmGuidance:
    "Edible salt is a near-maximum IVC category — crude salt is 100% domestic (Gujarat/TN solar pans), brands are Indian (Tata, ITC, DS Group, Nirma), and there is NO GST (common edible salt is exempt at 0%), so no tax leaves the system. The only small leak is imported potassium iodate for iodisation and some packaging film. Refined vacuum-evaporated salt has slightly higher manufacturing/energy cost but the same origins.",
  sources: [
    {
      title: "Salt production in India — Salt Commissioner / Ministry of Commerce",
      url: "https://saltcomindia.gov.in/",
      relevance: "India 3rd largest producer; Gujarat/TN domestic supply",
    },
    {
      title: "GST exemption on common salt — HSN 2501",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "Edible common salt is GST-exempt (0%)",
    },
  ],
};
