import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Pasta & vermicelli (macaroni, spaghetti, penne, seviyan).
 * Wheat/semolina is domestic; vermicelli & seviyan are a traditional Indian
 * product (Bambino, MTR). Italian-style pasta uses durum semolina (mostly
 * domestic, some imported) and a few foreign brands (Borges ES, MTR→Orkla NO).
 * High IVC for vermicelli, moderate for premium imported pasta. GST 12%/18%
 * (HSN 1902). Needs human review.
 */
export const PASTA_VERMICELLI_TEMPLATE: CategoryTemplate = {
  slug: "pasta_vermicelli",
  displayName: "Pasta & Vermicelli",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 12.0,
  hsnCodes: ["1902", "19021100", "19021900", "19023010"],
  keywords: [
    "pasta", "macaroni", "spaghetti", "penne", "fusilli", "vermicelli",
    "seviyan", "semiya", "bambino", "borges pasta", "weikfield",
    "durum wheat pasta", "shells pasta", "lasagna", "fettuccine",
    "roasted vermicelli",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 45, highPct: 62 },
    packaging: {
      lowPct: 7,
      highPct: 13,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 88 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 12 },
      ],
    },
    manufacturing: { lowPct: 6, highPct: 11 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 8, highPct: 13 },
    brandMargin: { lowPct: 3, highPct: 7 },
    advertising: { lowPct: 2, highPct: 6 },
    gst: { lowPct: 12, highPct: 12 },
    brandProfit: {
      lowPct: 3,
      highPct: 6,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 78, notes: "Sunfeast (ITC), Bambino, Weikfield, MTR — Indian brands/manufacturing." },
        { country: "ES", countryName: "Spain", probabilityPct: 12, notes: "Borges imported pasta." },
        { country: "NO", countryName: "Norway", probabilityPct: 10, notes: "MTR owned by Orkla (Norway)." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Wheat semolina / durum (suji, maida)",
      sharePct: { low: 90, high: 98 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 85, notes: "Wheat semolina (suji/rava) and maida are domestic; India is the 2nd-largest wheat producer." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 15, notes: "Premium durum-wheat semolina for Italian pasta is partly imported." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 74, highPct: 90 },
  llmGuidance:
    "Pasta & vermicelli is high-IVC for traditional seviyan/vermicelli (Bambino) — wheat semolina is domestic and brands are Indian. Italian-style durum pasta scores a bit lower (some imported durum semolina, Borges/MTR-Orkla brands). This is DISTINCT from instant_noodles (Maggi/ramen). GST 12% under HSN 1902.",
  sources: [
    { title: "GST on pasta — HSN 1902 (12%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "12% GST on pasta/vermicelli" },
    { title: "India wheat production — Ministry of Agriculture", url: "https://agricoop.nic.in/en/statistics", relevance: "Domestic semolina/durum supply" },
  ],
};
