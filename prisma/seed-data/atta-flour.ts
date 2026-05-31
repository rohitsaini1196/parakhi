import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Packaged wheat flour (atta).
 * India is world's 2nd largest wheat producer. Atta is overwhelmingly
 * Indian — wheat grown domestically, milled domestically, brands mostly Indian.
 * Exception: Pilsbury owned by General Mills (US).
 * GST 5% on packaged branded atta. Needs human review.
 */
export const ATTA_FLOUR_TEMPLATE: CategoryTemplate = {
  slug: "atta_flour",
  displayName: "Atta & Wheat Flour",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 5.0,
  hsnCodes: ["11010000", "11010011", "11010019"],
  keywords: [
    "atta", "wheat flour", "chakki fresh atta", "whole wheat atta",
    "aashirvaad", "shakti bhog", "pilsbury", "annapurna", "fortune atta",
    "rajdhani atta", "patanjali atta", "naturefresh", "sujata", "shaktibhog",
    "multigrain atta", "atta flour", "maida", "besan", "gram flour",
    "suji", "sooji", "semolina", "rawa",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 60, highPct: 72 },
    packaging: {
      lowPct: 5,
      highPct: 9,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 95 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 5 },
      ],
    },
    manufacturing: { lowPct: 5, highPct: 9 },
    logistics: { lowPct: 6, highPct: 10 },
    retailMargin: { lowPct: 6, highPct: 10 },
    brandMargin: { lowPct: 3, highPct: 7 },
    advertising: { lowPct: 2, highPct: 5 },
    gst: { lowPct: 5, highPct: 5 },
    brandProfit: {
      lowPct: 2,
      highPct: 5,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 80, notes: "Aashirvaad (ITC), Shakti Bhog, Rajdhani — fully Indian." },
        { country: "US", countryName: "United States", probabilityPct: 20, notes: "Pilsbury owned by General Mills (Minneapolis). Annapurna owned by HUL (Unilever)." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Wheat grain",
      sharePct: { low: 90, high: 98 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 99,
          notes: "India produces ~110 million tonnes of wheat annually (UP, Punjab, Haryana). Atta brands source exclusively from domestic mills. Zero import dependency under normal conditions.",
        },
      ],
    },
    {
      name: "Vitamins & minerals fortification",
      sharePct: { low: 0.2, high: 1 },
      typicalOrigin: [
        { country: "CN", countryName: "China", probabilityPct: 60 },
        { country: "IN", countryName: "India", probabilityPct: 40 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 90, highPct: 96 },
  llmGuidance:
    "Atta is one of the highest IVC categories — wheat is 100% Indian, milling is domestic, and major brands (Aashirvaad/ITC, Shakti Bhog) are Indian. The only IVC drag is Pilsbury (General Mills US) and Annapurna (HUL/Unilever NL) brand profit flowing abroad. Chakki fresh grinding (stone-ground) has even higher local value capture than roller-milled. Maida (refined wheat flour), besan (gram flour), suji all follow the same pattern. GST 5% on packaged branded; 0% on loose/unbranded.",
  sources: [
    {
      title: "India wheat production — Ministry of Agriculture",
      url: "https://agricoop.nic.in/en/statistics",
      relevance: "Domestic wheat supply — 110MT annual production",
    },
    {
      title: "ITC Aashirvaad — India's largest branded atta",
      url: "https://www.itcportal.com/businesses/fmcg/staples.aspx",
      relevance: "Brand ownership, ITC = fully Indian",
    },
    {
      title: "GST on branded packaged atta — HSN 1101",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "5% GST on packaged, 0% unpackaged",
    },
  ],
};
