import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Packaged tea (CTC, leaf, dust, premium).
 *
 * India is the world's 2nd largest tea producer; raw tea is essentially 100%
 * domestic (Assam, Darjeeling, Nilgiri). The brand-profit attribution is the
 * swing variable: Tata Consumer (IN), Wagh Bakri (IN), and most regional
 * brands are Indian, while HUL's Brooke Bond / Red Label / Taj Mahal / Lipton
 * portfolio routes brand value to Unilever (NL).
 *
 * GST 5% on tea (HSN 0902). Needs human review.
 */
export const PACKAGED_TEA_TEMPLATE: CategoryTemplate = {
  slug: "packaged_tea",
  displayName: "Packaged Tea",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 5.0,
  hsnCodes: ["09021010", "09021090", "09023010", "09023090", "09024010"],
  keywords: [
    "tea", "chai", "leaf tea", "dust tea", "ctc", "ctc tea",
    "tata tea", "tata", "red label", "brooke bond", "taj mahal",
    "taaza", "wagh bakri", "lipton", "tetley", "society",
    "girnar", "tata tea premium", "3 roses", "kanan devan",
    "green tea", "earl grey", "darjeeling tea", "assam tea",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 35, highPct: 50 },
    packaging: {
      lowPct: 6,
      highPct: 12,
      // Carton + foil pouch + (sometimes) string-and-tag tea bags. Cartons +
      // foil sourced domestically; tea-bag filter paper sometimes imported.
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 95 },
        {
          country: "MIXED",
          countryName: "Mixed (tea-bag filter paper imports)",
          probabilityPct: 5,
        },
      ],
    },
    manufacturing: { lowPct: 4, highPct: 8 },
    logistics: { lowPct: 6, highPct: 10 },
    retailMargin: { lowPct: 12, highPct: 18 },
    brandMargin: { lowPct: 4, highPct: 8 },
    advertising: { lowPct: 6, highPct: 12 },
    gst: { lowPct: 5, highPct: 5 },
    brandProfit: { lowPct: 6, highPct: 12 },
  },
  rawMaterials: [
    {
      name: "Tea leaves (Assam / Darjeeling / Nilgiri / Dooars)",
      sharePct: { low: 90, high: 99 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 99,
          notes: "Assam, West Bengal (Darjeeling/Dooars), Tamil Nadu (Nilgiri), Kerala. India is the 2nd largest producer globally.",
        },
        {
          country: "MIXED",
          countryName: "Mixed (premium blends may import)",
          probabilityPct: 1,
          notes: "Some specialty green / oolong / earl-grey blends import Chinese or Sri Lankan tea.",
        },
      ],
    },
    {
      name: "Flavour additives (bergamot, cardamom, masala spices) — only if flavoured",
      sharePct: { low: 0, high: 5 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 80 },
        {
          country: "MIXED",
          countryName: "Mixed (bergamot oil from Italy)",
          probabilityPct: 20,
        },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 85, highPct: 96 },
  llmGuidance:
    "Premium / Darjeeling / single-estate teas have higher raw-material share (35–50% of MRP) and higher brand-profit margin. Mass-market CTC dust (Tata Tea, Red Label) has lower per-kg cost but huge volume. Green tea variants often import Chinese leaf — flag. HUL-owned brands (Brooke Bond, Lipton, Red Label, Taj Mahal, Taaza) route brand profit to Unilever NL. Tata-owned (Tata Tea Premium, Tetley, Kanan Devan) keep brand profit Indian. Bagged tea adds packaging share.",
  sources: [
    {
      title: "Tea Board of India — production statistics",
      url: "https://www.teaboard.gov.in/",
      relevance: "India's tea production geography",
    },
    {
      title: "Tata Consumer Products FY24",
      url: "https://www.tataconsumer.com/investors",
      relevance: "Tea brand margin + Indian attribution",
    },
    {
      title: "Hindustan Unilever Foods & Refreshments segment",
      url: "https://www.hul.co.in/investor-relations/annual-reports/",
      relevance: "Brooke Bond / Red Label / Lipton margins; Unilever parent attribution",
    },
    {
      title: "Wagh Bakri Tea Group",
      url: "https://www.waghbakritea.com/",
      relevance: "Domestic mid-market brand reference",
    },
    {
      title: "CBIC GST — HSN 0902 (tea)",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "5% GST",
    },
  ],
};
