import type { ProductBreakdown } from "@/lib/schemas";

export const PARLE_G_BREAKDOWN: ProductBreakdown = {
  // Hand-curated hero: IVC 92% (Indian everything, palm oil dent),
  // Composition-MII 87% (palm oil = 13% of biscuit weight, fully imported).
  madeInIndiaScorePct: 92,
  madeInIndiaRangePct: { low: 89, high: 95 },
  compositionMiiPct: 87,
  compositionMiiRangePct: { low: 84, high: 90 },
  components: [
    {
      label: "Wheat (maida)",
      sharePct: 16.9,
      rangePct: { low: 14, high: 19 },
      rupeeAmount: 75,
      rupeeRange: null,
      confidence: "medium",
      sourceTier: 3,
      explanation:
        "Maida is ~68% of biscuit weight; current wholesale wheat ~₹29/quintal.",
    },
    {
      label: "Sugar",
      sharePct: 6.7,
      rangePct: { low: 5, high: 9 },
      rupeeAmount: 30,
      rupeeRange: null,
      confidence: "medium",
      sourceTier: 3,
      explanation:
        "Sugar is ~13% of biscuit weight, sourced from Indian sugar mills.",
    },
    {
      label: "Palm oil",
      sharePct: 7.9,
      rangePct: { low: 6, high: 11 },
      rupeeAmount: 35,
      rupeeRange: null,
      confidence: "medium",
      sourceTier: 3,
      explanation:
        "Palm oil is ~13% of biscuit weight, mostly imported from Indonesia and Malaysia.",
    },
    {
      label: "Other ingredients",
      sharePct: 3.4,
      rangePct: { low: 2, high: 5 },
      rupeeAmount: 15,
      rupeeRange: null,
      confidence: "low",
      sourceTier: 4,
      explanation:
        "Salt, milk solids, leavening, emulsifiers — mostly Indian sources.",
    },
    {
      label: "Packaging",
      sharePct: 7.9,
      rangePct: { low: 6, high: 10 },
      rupeeAmount: 35,
      rupeeRange: null,
      confidence: "medium",
      sourceTier: 3,
      explanation:
        "Printed plastic wrapper. Industry standard 6-10% of MRP for FMCG packets.",
    },
    {
      label: "Manufacturing",
      sharePct: 9.0,
      rangePct: { low: 7, high: 12 },
      rupeeAmount: 40,
      rupeeRange: null,
      confidence: "medium",
      sourceTier: 3,
      explanation:
        "Labor, energy, depreciation. Parle has 14 biscuit factories.",
    },
    {
      label: "Distribution & logistics",
      sharePct: 9.0,
      rangePct: { low: 7, high: 12 },
      rupeeAmount: 40,
      rupeeRange: null,
      confidence: "medium",
      sourceTier: 3,
      explanation: "Trucking, warehousing across India.",
    },
    {
      label: "Retailer + distributor margin",
      sharePct: 18.0,
      rangePct: { low: 14, high: 22 },
      rupeeAmount: 80,
      rupeeRange: null,
      confidence: "medium",
      sourceTier: 3,
      explanation: "Kirana shop + wholesaler. Typical FMCG retail margin.",
    },
    {
      label: "Advertising & brand",
      sharePct: 3.4,
      rangePct: { low: 2, high: 5 },
      rupeeAmount: 15,
      rupeeRange: null,
      confidence: "medium",
      sourceTier: 2,
      explanation:
        "Parle Biscuits FY24 ad spend ₹442 cr on revenue ₹14,349 cr ≈ 3%.",
    },
    {
      label: "Parle's profit",
      sharePct: 4.5,
      rangePct: { low: 3, high: 7 },
      rupeeAmount: 20,
      rupeeRange: null,
      confidence: "medium",
      sourceTier: 2,
      explanation:
        "Parle Biscuits FY25 operating margin 5.3% (Tofler/RoC filings).",
    },
    {
      label: "GST (5%)",
      sharePct: 4.7,
      rangePct: { low: 4.7, high: 4.7 },
      rupeeAmount: 21,
      rupeeRange: null,
      confidence: "high",
      sourceTier: 1,
      explanation:
        "HSN 19053100 attracts 5% GST since Sept 22, 2025 (was 18% before).",
    },
  ],
  imports: [
    {
      ingredient: "Palm oil",
      sharePctOfProduct: 13,
      likelyCountries: [
        { code: "ID", name: "Indonesia", probabilityPct: 45 },
        { code: "MY", name: "Malaysia", probabilityPct: 45 },
        { code: "TH", name: "Thailand", probabilityPct: 7 },
      ],
      notes:
        "India imports 9M tonnes/year; 84% from Indonesia + Malaysia. Refined Bleached Deodorized (RBD) palm oil is standard in biscuits.",
    },
  ],
  gst: {
    ratePct: 5.0,
    rupeeAmount: 21,
    hsnCode: "19053100",
    confidence: "high",
    asOfDate: "2025-09-22",
  },
  overall: {
    confidence: "medium",
    reasoning:
      "Ingredient list and percentages verified via Open Food Facts. Cost structure estimated from Parle Biscuits FY25 financials (gross margin 29.4%, operating margin 5.3%). Component-level numbers are estimates within those margin constraints; expect ±10-20 paise per component.",
    modelUsed: "human-curated",
    templateVersion: "1.0.0",
  },
};

export const PARLE_G_HERO_MARKDOWN = `## The story of Parle-G

Parle-G has been India's most-sold biscuit for decades — a ₹5 pack of glucose biscuits that quietly tracks the economy of the country.

### Shrinkflation timeline

The MRP barely moved, but the pack shrank.

| Year | Price | Weight | ₹ per 100g |
| ---- | ----- | ------ | ---------- |
| 1994 | ₹4 | 100g | ₹4.00 |
| 2003 | ₹4 | 92.5g | ₹4.32 |
| 2013 | ₹4 | 88g | ₹4.55 |
| 2021 | ₹5 | 65g | ₹7.69 |
| Sep 2025 | ₹4.45 | 55g | ₹8.09 |

Between 1994 and 2025, the price per 100g doubled while sticker price stayed roughly flat. That's shrinkflation — the same coin buys less.

### Why is the score not 100%?

The maida, sugar, and packaging are made in India. The factories employ Indian workers. But palm oil — roughly 13% of the biscuit by weight — is almost entirely imported. India is the world's largest importer of palm oil; Indonesia and Malaysia supply ~84% of it. That's why Parle-G is 87% Indian, not 100%.

### How we estimated this

Ingredient percentages: Open Food Facts (public, crowd-sourced).
Cost ratios: Parle Biscuits Pvt. Ltd. FY25 financials (gross margin 29.4%, operating margin 5.3%) via MCA filings.
GST: HSN code 19053100, 5% as of 22 September 2025 (was 18% prior).
Origin probabilities: India palm oil import data, 2024-25.
`;
