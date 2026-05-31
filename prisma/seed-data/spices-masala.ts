import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Packaged spices and masala blends.
 * India grows ~75% of world's spices. MDH, Everest, Catch are fully Indian.
 * IVC is among the highest of any FMCG category.
 * GST 5% on spices. Needs human review.
 */
export const SPICES_MASALA_TEMPLATE: CategoryTemplate = {
  slug: "spices_masala",
  displayName: "Spices & Masala",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 5.0,
  hsnCodes: ["09041110", "09042210", "09103010", "09109100", "21039090", "21031000"],
  keywords: [
    "masala", "spices", "chaat masala", "garam masala", "rajma masala",
    "chole masala", "chicken masala", "biryani masala", "pav bhaji masala",
    "sambar powder", "rasam powder", "turmeric", "haldi", "chilli powder",
    "mirchi powder", "coriander powder", "cumin powder", "jeera powder",
    "pepper", "black pepper", "cardamom", "elaichi", "cloves",
    "mdh", "everest", "catch", "tata sampann", "Eastern masala",
    "suhana", "badshah masala", "priya", "aachi",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 45, highPct: 58 },
    packaging: {
      lowPct: 8,
      highPct: 14,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 90 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 10 },
      ],
    },
    manufacturing: { lowPct: 5, highPct: 9 },
    logistics: { lowPct: 5, highPct: 8 },
    retailMargin: { lowPct: 10, highPct: 16 },
    brandMargin: { lowPct: 6, highPct: 12 },
    advertising: { lowPct: 3, highPct: 8 },
    gst: { lowPct: 5, highPct: 5 },
    brandProfit: {
      lowPct: 4,
      highPct: 8,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 95, notes: "MDH (Mahashian Di Hatti, Delhi), Everest (Mumbai), Catch (DS Group, Noida), Tata Sampann (Tata Consumer) — all Indian." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 5 },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Spices — chilli, coriander, turmeric, cumin (primary)",
      sharePct: { low: 55, high: 75 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 95,
          notes: "India produces ~75% of world spice output. Chilli from AP/Telangana, turmeric from Erode/Nizamabad, cumin from Rajasthan/Gujarat, coriander from MP/Rajasthan. Near-zero import.",
        },
        { country: "MIXED", countryName: "Mixed (China/Vietnam)", probabilityPct: 5, notes: "Some pepper and cardamom from Vietnam/Guatemala for premium blends." },
      ],
    },
    {
      name: "Salt, anti-caking agents",
      sharePct: { low: 3, high: 8 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 98 },
      ],
    },
    {
      name: "Edible oil (binding, moisture control)",
      sharePct: { low: 2, high: 6 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 60 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 40 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 88, highPct: 96 },
  llmGuidance:
    "Spices & masala is among the most Indian categories on the platform — raw materials are overwhelmingly Indian-grown, all major brands (MDH, Everest, Catch, Tata Sampann) are Indian-owned companies. MDH founder story is famous; it's a privately held Indian company with no foreign ownership. The only import leakage is specialty spices (cardamom from Guatemala, black pepper variants from Vietnam) and some oil in blends. GST 5% on packaged whole/ground spices. Brand margins are higher than commodity spices suggest — MDH commands 20-30% retail premium over unbranded.",
  sources: [
    {
      title: "Spices Board of India — production statistics",
      url: "https://www.indianspices.com/statistics",
      relevance: "India ~75% of world spice production",
    },
    {
      title: "MDH Masala — company background",
      url: "https://www.mdhmasala.com/about.php",
      relevance: "Fully Indian private company",
    },
    {
      title: "GST on spices — HSN 0904/0910/2103",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "5% GST on packaged spices",
    },
  ],
};
