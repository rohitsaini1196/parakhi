import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Carbonated soft drinks (Coke, Pepsi, Thums Up, Sprite, Diet
 * Coke, etc.). Sourced from Coca-Cola India + Varun Beverages annual filings,
 * CBIC notifications on aerated drinks GST + compensation cess.
 *
 * Notable: India taxes aerated drinks heavily (sin-goods category). Post the
 * Sept 2025 GST 2.0 restructure, carbonated sugar drinks fall in the demerit
 * 40% slab. Sugar-free / diet variants have historically attracted the same
 * rate. Verify the exact applicable rate against CBIC before launch.
 *
 * Needs human review before promoting out of draft.
 */
export const CARBONATED_SOFT_DRINKS_TEMPLATE: CategoryTemplate = {
  slug: "carbonated_soft_drinks",
  displayName: "Carbonated Soft Drinks",
  templateVersion: "0.1.0-draft",
  // GST 40% on aerated drinks (demerit/sin slab) post GST 2.0, Sept 2025.
  defaultGstRate: 40.0,
  hsnCodes: ["22021010", "22021090", "22029920", "22029990"],
  keywords: [
    "cola", "soft drink", "soft drinks", "aerated", "carbonated", "soda",
    "coke", "coca-cola", "coca cola", "diet coke", "pepsi", "thums up",
    "thums up", "sprite", "fanta", "limca", "mirinda", "7up", "mountain dew",
    "campa", "soft drink can",
    "energy drink", "sting", "monster energy", "red bull", "redbull",
    "hell energy", "cloud 9", "xxxx energy", "tzinga",
  ],
  typicalStructure: {
    // Raw materials look small because syrup concentrate is the dominant line
    // and is treated as a separate brand-margin item by bottlers — but here
    // we lump syrup into rawMaterials for honesty about ingredient origin.
    rawMaterials: { lowPct: 15, highPct: 25 },
    packaging: {
      lowPct: 12,
      highPct: 22,
      // 330ml aluminum cans for Indian beverage majors are largely imported
      // from the Middle East (Emirates Global Aluminium UAE, Alba Bahrain,
      // Ma'aden Saudi Arabia). Some can-making capacity sits in India
      // (Ball Beverage Can Pune, Can-Pack Aurangabad) but feedstock is still
      // imported. PET-bottle SKUs are mostly Indian. Default below skews
      // toward the can story since the canonical "Diet Coke can" prompted
      // this template; PET-heavy variants should override.
      origins: [
        {
          country: "AE",
          countryName: "UAE",
          probabilityPct: 35,
          notes: "EGA — Emirates Global Aluminium, dominant ME can-feedstock supplier to India.",
        },
        { country: "BH", countryName: "Bahrain", probabilityPct: 20, notes: "Alba." },
        { country: "SA", countryName: "Saudi Arabia", probabilityPct: 10, notes: "Ma'aden." },
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 35,
          notes: "Domestic can-making (Ball, Can-Pack) on imported feedstock; PET bottle SKUs are fully Indian.",
        },
      ],
    },
    manufacturing: { lowPct: 6, highPct: 12 },
    logistics: { lowPct: 6, highPct: 12 },
    retailMargin: { lowPct: 10, highPct: 18 },
    brandMargin: { lowPct: 4, highPct: 10 },
    advertising: { lowPct: 5, highPct: 10 },
    gst: { lowPct: 40, highPct: 40 },
    brandProfit: {
      lowPct: 3,
      highPct: 10,
      // Royalty and brand-side profit on Coca-Cola Atlanta / PepsiCo NY
      // products flows mostly to the foreign parent through the concentrate
      // price and trademark fees. The Indian bottler (HCCBPL, Varun) keeps a
      // sliver. For Indian-origin aerated brands (Bovonto, Bindu, regional
      // colas) brand profit stays domestic — override per-product if needed.
      origins: [
        {
          country: "US",
          countryName: "United States",
          probabilityPct: 80,
          notes: "Royalty/trademark flows to Coca-Cola Atlanta or PepsiCo NY.",
        },
        { country: "IN", countryName: "India (bottler share)", probabilityPct: 20 },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Water (carbonated)",
      sharePct: { low: 85, high: 92 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 100,
          notes: "Local groundwater treated to potable spec on-site.",
        },
      ],
    },
    {
      name: "Sugar (in regular variants)",
      sharePct: { low: 0, high: 12 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 98,
          notes: "Indian sugar mills (UP, Maharashtra, Karnataka).",
        },
      ],
    },
    {
      name: "Artificial sweeteners (aspartame, acesulfame-K, sucralose) — diet/sugar-free variants",
      sharePct: { low: 0, high: 2 },
      typicalOrigin: [
        {
          country: "CN",
          countryName: "China",
          probabilityPct: 70,
          notes: "China dominates global aspartame and ace-K production.",
        },
        { country: "MIXED", countryName: "Mixed (EU/US)", probabilityPct: 30 },
      ],
    },
    {
      name: "Flavor concentrate (proprietary syrup)",
      sharePct: { low: 1, high: 4 },
      typicalOrigin: [
        {
          country: "US",
          countryName: "United States",
          probabilityPct: 70,
          notes:
            "Coca-Cola concentrate is manufactured by The Coca-Cola Company (Atlanta) and shipped to Indian bottlers; PepsiCo uses a similar global model. Often blended/finished in India.",
        },
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 30,
          notes:
            "Final blending and some flavor inputs sourced domestically.",
        },
      ],
    },
    {
      name: "Caffeine (in cola variants)",
      sharePct: { low: 0, high: 0.5 },
      typicalOrigin: [
        {
          country: "CN",
          countryName: "China",
          probabilityPct: 80,
          notes:
            "Synthetic caffeine — China is the dominant global producer.",
        },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 20 },
      ],
    },
    {
      name: "Carbonation (CO2 / carbon dioxide)",
      sharePct: { low: 0.5, high: 1.5 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 100 },
      ],
    },
    {
      name: "Phosphoric acid, citric acid, caramel color, preservatives",
      sharePct: { low: 0.5, high: 2 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 60 },
        {
          country: "CN",
          countryName: "China",
          probabilityPct: 30,
          notes: "Phosphoric acid and food-grade citric acid largely imported.",
        },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 10 },
      ],
    },
  ],
  // The concentrate import + caffeine/sweetener imports drag this category
  // well below typical FMCG. Most of the *value* (brand, syrup, royalty) is
  // foreign even though water/sugar/manufacturing happen locally.
  madeInIndiaBand: { lowPct: 55, highPct: 75 },
  llmGuidance:
    "Diet / sugar-free variants (Diet Coke, Coke Zero, Pepsi Black) replace sugar with imported sweeteners — sugar share goes to ~0, sweetener share rises, and made-in-India dips because sweeteners are largely Chinese. Indian-origin brands (Thums Up, Limca, Maaza-style carbonates) still pay royalty/concentrate to a global parent if owned by Coca-Cola but the foreign concentrate share is similar. Smaller can/glass variants push packaging share higher (16-22%); 2L PET shifts it lower (~10-13%). For 'lemon-lime' (Sprite, 7Up) drop caffeine to 0. For 'cola' include caffeine. Brand profit at the parent-company level (Coca-Cola Atlanta / PepsiCo NY) is paid through the concentrate price and shows up in raw materials, not in brandProfit.",
  sources: [
    {
      title: "CBIC GST rate schedule — aerated waters HSN 2202",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "GST + compensation cess on aerated drinks",
    },
    {
      title: "Varun Beverages FY24 Annual Report (PepsiCo's India bottler)",
      url: "https://varunpepsi.com/investor-relations/",
      relevance: "Bottler margin, packaging share, distribution cost",
    },
    {
      title: "Hindustan Coca-Cola Beverages financials (Tofler)",
      url: "https://www.tofler.in/hindustan-coca-cola-beverages-private-limited",
      relevance: "Indian bottler margin reference",
    },
    {
      title: "Coca-Cola India concentrate plant (Pune) — supply chain",
      url: "https://www.coca-colaindia.com/our-company/our-business-in-india",
      relevance: "Concentrate manufacturing footprint",
    },
    {
      title: "India aspartame & sweetener imports from China",
      url: "https://www.dgft.gov.in/CP/",
      relevance: "Sweetener / caffeine import data",
    },
    {
      title: "newsonair.gov.in GST 2.0 rate cuts (Sept 2025)",
      url: "https://www.newsonair.gov.in/gst-rate-cuts-from-september-22-relief-for-common-man-boost-for-businesses",
      relevance: "Demerit-slab placement for aerated drinks",
    },
  ],
};
