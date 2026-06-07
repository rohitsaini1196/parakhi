import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Hair oil.
 * One of India's most domestic personal-care categories: coconut / mustard /
 * sesame / amla bases are grown and pressed in India, and the big brands are
 * Indian (Marico/Parachute, Dabur, Bajaj, Emami/Navratna, Keo Karpin). IVC drag
 * is small — some perfumed "light" oils use imported liquid paraffin (mineral
 * oil) + fragrance, and a few brands have foreign parents (Indulekha → HUL).
 * It's a heavy-advertising, high-margin category, so raw-material share of MRP
 * is modest. GST 18% (HSN 3305 hair preparations). Needs human review.
 */
export const HAIR_OIL_TEMPLATE: CategoryTemplate = {
  slug: "hair_oil",
  displayName: "Hair Oil",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["3305", "33059011", "33059019", "33059040"],
  keywords: [
    "hair oil", "amla hair oil", "almond hair oil", "coconut hair oil",
    "jasmine hair oil", "ayurvedic hair oil", "bhringraj", "bringha",
    "parachute", "advansed", "nihar", "dabur amla", "vatika hair oil",
    "bajaj almond", "almond drops", "navratna", "keo karpin", "indulekha",
    "kesh kanti hair oil", "kesh king", "sesa", "hair & care", "livon",
    "mahabhringraj", "brahmi amla", "onion hair oil",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 28, highPct: 45 },
    packaging: {
      lowPct: 8,
      highPct: 14,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 92 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 8 },
      ],
    },
    manufacturing: { lowPct: 5, highPct: 9 },
    logistics: { lowPct: 5, highPct: 8 },
    retailMargin: { lowPct: 8, highPct: 14 },
    brandMargin: { lowPct: 4, highPct: 8 },
    advertising: { lowPct: 6, highPct: 12 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: {
      lowPct: 3,
      highPct: 7,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 85, notes: "Marico (Parachute/Nihar/Hair&Care), Dabur (Amla/Vatika), Bajaj, Emami (Navratna/Kesh King), Keo Karpin (Dey's), Patanjali — all Indian." },
        { country: "NL", countryName: "Netherlands", probabilityPct: 15, notes: "Indulekha owned by HUL (Unilever, NL/UK). A handful of MNC oils." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Base oil (coconut / mustard / sesame / mineral)",
      sharePct: { low: 70, high: 88 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 88,
          notes: "Coconut (Kerala/TN/Karnataka), mustard (Rajasthan/UP) and sesame are domestically grown and pressed. India is the world's largest coconut producer.",
        },
        {
          country: "MIXED",
          countryName: "Mixed",
          probabilityPct: 12,
          notes: "Perfumed 'light/non-sticky' oils blend in liquid paraffin (mineral oil), a petroleum derivative often imported.",
        },
      ],
    },
    {
      name: "Herbal actives (amla, bhringraj, brahmi, onion)",
      sharePct: { low: 5, high: 18 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 95, notes: "Amla, bhringraj, brahmi and other Ayurvedic herbs are sourced domestically." },
      ],
    },
    {
      name: "Fragrance & additives",
      sharePct: { low: 2, high: 8 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 55 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 45, notes: "Aroma chemicals / fragrance compounds are frequently imported (EU, China, SG fragrance houses)." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 82, highPct: 92 },
  llmGuidance:
    "Hair oil is a high-IVC personal-care category — bases (coconut, mustard, sesame, amla) are domestically grown/pressed and the dominant brands are Indian (Marico, Dabur, Bajaj, Emami, Keo Karpin). The drag is small: imported liquid paraffin in 'light' perfumed oils, imported fragrance, and a few foreign-owned brands (Indulekha → HUL). Pure ayurvedic/coconut oils score highest; perfumed cosmetic oils slightly lower. Note: edible coconut/mustard cooking oil is a DIFFERENT category (cooking_oil) — only oils sold for hair belong here. GST 18% under HSN 3305.",
  sources: [
    {
      title: "GST rate on hair preparations — HSN 3305 (18%)",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "18% GST on hair oil",
    },
    {
      title: "Marico Annual Report — Parachute coconut sourcing",
      url: "https://marico.com/investorspdf/Marico_Annual_Report.pdf",
      relevance: "Domestic copra/coconut procurement, brand ownership (Indian)",
    },
    {
      title: "India coconut production — Coconut Development Board",
      url: "https://coconutboard.gov.in/Statistics.aspx",
      relevance: "India is the largest coconut producer — domestic base-oil supply",
    },
  ],
};
