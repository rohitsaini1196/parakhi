import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Packaged fruit juice & nectar.
 * Mango pulp is largely Indian; apple/orange are often imported concentrate.
 * Brand profit swings: Real (Dabur, IN), Frooti/Appy (Parle Agro, IN),
 * Tropicana/Slice (PepsiCo, US), Maaza/Minute Maid (Coca-Cola, US).
 * GST 12% (HSN 2009). Needs human review.
 */
export const PACKAGED_JUICE_TEMPLATE: CategoryTemplate = {
  slug: "packaged_juice",
  displayName: "Packaged Juice",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 12.0,
  hsnCodes: ["20091000", "20098100", "20098900", "20099000"],
  keywords: [
    "juice", "fruit juice", "nectar", "real", "tropicana", "maaza",
    "frooti", "slice", "appy", "minute maid", "paper boat", "b natural",
    "mango drink", "mixed fruit", "orange juice", "apple juice",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 25, highPct: 40 },
    packaging: { lowPct: 14, highPct: 22 },
    manufacturing: { lowPct: 6, highPct: 10 },
    logistics: { lowPct: 7, highPct: 12 },
    retailMargin: { lowPct: 10, highPct: 16 },
    brandMargin: { lowPct: 4, highPct: 8 },
    advertising: { lowPct: 6, highPct: 12 },
    gst: { lowPct: 12, highPct: 12 },
    brandProfit: { lowPct: 4, highPct: 10 },
  },
  rawMaterials: [
    {
      name: "Fruit pulp / concentrate",
      sharePct: { low: 35, high: 55 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 65, notes: "Mango/guava pulp largely domestic (AP, MH, UP)." },
        { country: "MIXED", countryName: "Imported (apple/orange concentrate)", probabilityPct: 35, notes: "Apple from China/EU, orange from Brazil." },
      ],
    },
    {
      name: "Sugar",
      sharePct: { low: 30, high: 45 },
      typicalOrigin: [{ country: "IN", countryName: "India", probabilityPct: 98 }],
    },
    {
      name: "Water",
      sharePct: { low: 10, high: 25 },
      typicalOrigin: [{ country: "IN", countryName: "India", probabilityPct: 100 }],
    },
    {
      name: "Acidity regulators, preservatives, flavour, colour",
      sharePct: { low: 1, high: 4 },
      typicalOrigin: [
        { country: "MIXED", countryName: "Mixed (citric acid from China)", probabilityPct: 65 },
        { country: "IN", countryName: "India", probabilityPct: 35 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 65, highPct: 85 },
  llmGuidance:
    "Mango-based drinks (Maaza, Frooti, Slice) are mostly Indian pulp; apple/orange/mixed-fruit lean on imported concentrate → lower IVC. Tetra-pak packaging share is high (14-22%). Brand profit: Real/Frooti/Appy/Paper Boat → Indian; Tropicana/Slice → PepsiCo US; Maaza/Minute Maid → Coca-Cola US. '100% juice' raises pulp share vs 'nectar'/'drink' (more sugar+water).",
  sources: [
    { title: "CBIC GST — fruit juices HSN 2009", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html", relevance: "12% GST" },
    { title: "India fruit-concentrate imports (apple/orange)", url: "https://www.dgft.gov.in/CP/", relevance: "Concentrate origin" },
    { title: "Dabur / Parle Agro / PepsiCo India filings", url: "https://www.mca.gov.in/", relevance: "Brand margin + parent country" },
    { title: "APEDA — processed fruit & mango pulp", url: "https://apeda.gov.in/", relevance: "Domestic pulp supply" },
  ],
};
