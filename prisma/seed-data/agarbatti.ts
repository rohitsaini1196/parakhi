import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Agarbatti & dhoop (incense).
 * A high-IVC cottage-industry category: bamboo sticks, charcoal, jigat and
 * wood powder are domestic, manufacturing is largely hand-rolled by Indian SHGs,
 * and brands are Indian (Cycle, Mangaldeep/ITC, Zed Black, Hem, Moksh). The only
 * leak is imported aroma chemicals/perfume and some raw bamboo from Vietnam/China.
 * GST 5% (HSN 330741). Needs human review.
 */
export const AGARBATTI_TEMPLATE: CategoryTemplate = {
  slug: "agarbatti",
  displayName: "Agarbatti & Dhoop",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 5.0,
  hsnCodes: ["330741", "33074100", "33074900"],
  keywords: [
    "agarbatti", "incense", "dhoop", "incense stick", "loban", "sambrani",
    "cycle agarbatti", "mangaldeep", "zed black", "hem incense", "moksh",
    "havan", "puja agarbatti", "fragrance sticks", "dhoop cone", "guggal",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 35, highPct: 50 },
    packaging: {
      lowPct: 8,
      highPct: 15,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 90 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 10 },
      ],
    },
    manufacturing: { lowPct: 10, highPct: 18 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 8, highPct: 14 },
    brandMargin: { lowPct: 3, highPct: 7 },
    advertising: { lowPct: 2, highPct: 5 },
    gst: { lowPct: 5, highPct: 5 },
    brandProfit: {
      lowPct: 2,
      highPct: 5,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 92, notes: "Cycle (NR Group), Mangaldeep (ITC), Zed Black, Hem, Moksh — Indian." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 8 },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Bamboo stick, charcoal, jigat, wood powder",
      sharePct: { low: 70, high: 85 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 80, notes: "Charcoal, jigat (binding gum) and wood powder are domestic; bamboo is mostly Indian but raw round-sticks are sometimes imported from Vietnam/China." },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 20, notes: "Imported raw bamboo round-sticks (Vietnam/China) in cheaper lines." },
      ],
    },
    {
      name: "Aroma chemicals / perfume",
      sharePct: { low: 15, high: 30 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 50 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 50, notes: "Synthetic aroma chemicals frequently imported (China, EU houses)." },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 78, highPct: 90 },
  llmGuidance:
    "Agarbatti is a high-IVC cottage industry — charcoal, jigat, wood powder and labour (hand-rolling by Indian self-help groups) are domestic, and brands are Indian (Cycle/NR Group, Mangaldeep/ITC, Zed Black, Hem). The leaks are imported aroma chemicals/perfume and, in cheaper lines, imported raw bamboo round-sticks from Vietnam/China (a real policy concern that import duty has targeted). GST 5% under HSN 330741.",
  sources: [
    { title: "GST on agarbatti — HSN 330741 (5%)", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "5% GST on agarbatti" },
    { title: "KVIC — agarbatti as a rural employment industry", url: "https://www.kvic.gov.in/", relevance: "Domestic hand-rolling cottage industry" },
  ],
};
