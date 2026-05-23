import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Toothpaste.
 *
 * Notable: India is the world's largest producer of laminated toothpaste
 * tubes (EPL Ltd / Essel Propack, Albea, etc.), so packaging is far more
 * Indian-content than most personal care. Active chemicals (SLS, abrasive
 * silica grades, fluoride salts) are partly imported, mostly from China.
 * Brand profit attribution is the swing variable: Colgate-Palmolive (US) and
 * HUL (NL parent Unilever) dominate the market; Patanjali / Dabur / Vicco
 * keep it Indian.
 *
 * GST 18% as of CBIC schedule (HSN 3306). Needs human review before launch.
 */
export const TOOTHPASTE_TEMPLATE: CategoryTemplate = {
  slug: "toothpaste",
  displayName: "Toothpaste",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["33061010", "33061020", "33061090"],
  keywords: [
    "toothpaste", "dental cream", "dental paste", "tooth paste",
    "colgate", "pepsodent", "closeup", "close up", "sensodyne", "oral b",
    "oral-b", "vicco", "dabur red", "patanjali dant kanti", "dant kanti",
    "meswak", "babool", "dabur", "promise",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 22, highPct: 32 },
    packaging: {
      lowPct: 10,
      highPct: 16,
      // Laminated aluminium tubes are dominated by Indian manufacturers
      // (EPL Ltd / Essel Propack — world's #1 specialty tubes maker — and
      // Albea India). Carton outer is fully Indian.
      origins: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 90,
          notes:
            "EPL Ltd (formerly Essel Propack) is the world's largest laminated tube manufacturer; cartons fully domestic.",
        },
        { country: "MIXED", countryName: "Mixed (small imports)", probabilityPct: 10 },
      ],
    },
    manufacturing: { lowPct: 6, highPct: 10 },
    logistics: { lowPct: 5, highPct: 9 },
    retailMargin: { lowPct: 12, highPct: 18 },
    brandMargin: { lowPct: 4, highPct: 9 },
    advertising: { lowPct: 10, highPct: 18 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: {
      lowPct: 5,
      highPct: 12,
      // No bucket-level origins — driven by BrandIndex at compute time.
      // Colgate → US, HUL → NL parent (Unilever), Patanjali/Dabur → IN.
    },
  },
  rawMaterials: [
    {
      name: "Water",
      sharePct: { low: 25, high: 35 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 100 },
      ],
    },
    {
      name: "Abrasives (calcium carbonate, hydrated silica, dicalcium phosphate)",
      sharePct: { low: 25, high: 40 },
      typicalOrigin: [
        {
          country: "IN",
          countryName: "India",
          probabilityPct: 60,
          notes: "Calcium carbonate widely produced domestically.",
        },
        {
          country: "CN",
          countryName: "China",
          probabilityPct: 30,
          notes: "Pharmaceutical-grade silica largely from China.",
        },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 10 },
      ],
    },
    {
      name: "Humectants (sorbitol, glycerin, propylene glycol)",
      sharePct: { low: 15, high: 25 },
      typicalOrigin: [
        {
          country: "CN",
          countryName: "China",
          probabilityPct: 60,
          notes: "Sorbitol/glycerin global market dominated by China.",
        },
        { country: "IN", countryName: "India", probabilityPct: 30 },
        { country: "MIXED", countryName: "Mixed (EU/SE Asia)", probabilityPct: 10 },
      ],
    },
    {
      name: "Surfactant (sodium lauryl sulphate)",
      sharePct: { low: 1, high: 3 },
      typicalOrigin: [
        {
          country: "CN",
          countryName: "China",
          probabilityPct: 70,
          notes: "China dominates global SLS / SLES production.",
        },
        { country: "IN", countryName: "India", probabilityPct: 30 },
      ],
    },
    {
      name: "Fluoride source (sodium fluoride / sodium monofluorophosphate)",
      sharePct: { low: 0.1, high: 0.4 },
      typicalOrigin: [
        { country: "CN", countryName: "China", probabilityPct: 70 },
        { country: "MIXED", countryName: "Mixed (EU)", probabilityPct: 20 },
        { country: "IN", countryName: "India", probabilityPct: 10 },
      ],
    },
    {
      name: "Flavour + binders + colorants",
      sharePct: { low: 1, high: 4 },
      typicalOrigin: [
        {
          country: "MIXED",
          countryName: "Mixed (mostly imported flavour houses)",
          probabilityPct: 70,
        },
        { country: "IN", countryName: "India", probabilityPct: 30 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 55, highPct: 80 },
  llmGuidance:
    "Herbal variants (Patanjali Dant Kanti, Vicco Vajradanti, Dabur Red) shift raw-material composition toward Indian-sourced botanicals (neem, clove, miswak) and lift brandProfit to Indian. Conventional fluoride toothpastes (Colgate, Pepsodent, Closeup) keep the import-heavy actives. Sensitive variants (Sensodyne) raise the active-ingredient cost. Travel/small tubes (<50g) push packaging share toward the high end.",
  sources: [
    {
      title: "EPL Ltd (Essel Propack) — world's largest laminated tube maker",
      url: "https://www.eplglobal.com/about-us",
      relevance: "Packaging share + Indian domestic supply",
    },
    {
      title: "CBIC GST schedule — toiletries HSN 3306",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "18% GST",
    },
    {
      title: "Colgate-Palmolive India FY24 results",
      url: "https://www.colgatepalmolive.co.in/investors",
      relevance: "Brand margin + advertising spend (~12-15% of revenue)",
    },
    {
      title: "Hindustan Unilever Personal Care segment",
      url: "https://www.hul.co.in/investor-relations/annual-reports/",
      relevance: "Toothpaste margin benchmark (Closeup, Pepsodent)",
    },
    {
      title: "India SLS / SLES imports from China (DGCIS via trade data)",
      url: "https://www.dgft.gov.in/CP/",
      relevance: "Surfactant import origin",
    },
  ],
};
