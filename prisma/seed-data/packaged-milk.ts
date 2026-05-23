import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Amul, Mother Dairy, Nandini margins; NDDB price-spread data.
 * Needs human review.
 */
export const PACKAGED_MILK_TEMPLATE: CategoryTemplate = {
  slug: "packaged_milk",
  displayName: "Packaged Milk (Pouch / Tetra)",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 0.0,
  hsnCodes: ["04011000", "04012000", "04014000", "04015000"],
  keywords: [
    "milk", "toned milk", "full cream milk", "double toned", "cow milk",
    "buffalo milk", "amul milk", "mother dairy milk", "nandini", "verka",
    "pouch milk", "tetra pack milk", "a2 milk",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 60, highPct: 75 },
    packaging: { lowPct: 4, highPct: 10 },
    manufacturing: { lowPct: 4, highPct: 8 },
    logistics: { lowPct: 6, highPct: 12 },
    retailMargin: { lowPct: 4, highPct: 8 },
    brandMargin: { lowPct: 1, highPct: 4 },
    advertising: { lowPct: 1, highPct: 3 },
    gst: { lowPct: 0, highPct: 0 },
    brandProfit: { lowPct: 1, highPct: 4 },
  },
  rawMaterials: [
    {
      name: "Raw milk (paid to farmers)",
      sharePct: { low: 95, high: 99 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 100,
          notes:
            "India is the world's largest milk producer; near-zero dairy imports. Cooperative model (Amul/NDDB) routes 70-75% of MRP back to farmers.",
        },
      ],
    },
    {
      name: "Fortification (Vitamin A, D)",
      sharePct: { low: 0.5, high: 2 },
      typicalOrigin: [
        {
          country: "MIXED",
          countryName: "Imported vitamin premix",
          probabilityPct: 80,
        },
        { country: "IN", countryName: "India", probabilityPct: 20 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 95, highPct: 99 },
  llmGuidance:
    "Packaged milk is the highest Made-in-India category we cover — farmer share is huge, GST is zero, brand margin is razor-thin (the cooperative model deliberately keeps it so). Premium variants (A2, organic) shift brand margin and advertising higher but raw material share remains dominant. Flavoured milk (Amul Kool) is a different category — flag it.",
  sources: [
    {
      title: "NDDB Price Spread data — share of consumer rupee to farmers",
      url: "https://www.nddb.coop/information/stats",
      relevance: "Raw milk cost share",
    },
    {
      title: "GST exemption on fresh milk — HSN 0401",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "0% GST",
    },
    {
      title: "Amul Federation (GCMMF) FY24 results",
      url: "https://amul.com/m/about-us",
      relevance: "Brand margin reference",
    },
    {
      title: "Mother Dairy operating margin (Tofler)",
      url: "https://www.tofler.in/mother-dairy-fruit-vegetable-private-limited",
      relevance: "Margin benchmark",
    },
  ],
};
