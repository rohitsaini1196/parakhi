import type { CategoryTemplate } from "@/lib/schemas";

/**
 * DRAFT v0.1 — Malt-based health / nutrition drinks.
 * Horlicks (HUL/Unilever), Bournvita (Mondelez), Complan (Zydus Wellness),
 * Boost (HUL/Unilever), Protinex (Danone).
 *
 * Key import story: malt extract + barley (some imported), cocoa solids
 * (West Africa), vitamins & minerals (China/Germany), milk solids (NZ/EU).
 * Brand profit: mostly foreign (Unilever NL, Mondelez US) except Complan
 * which is now Zydus Wellness — Indian.
 * GST 18% (malted food drinks, HSN 1901).
 * Needs human review.
 */
export const HEALTH_DRINKS_TEMPLATE: CategoryTemplate = {
  slug: "health_drinks",
  displayName: "Health & Nutrition Drinks",
  templateVersion: "0.1.0-draft",
  defaultGstRate: 18.0,
  hsnCodes: ["19011090", "19019090", "21069099", "21061000"],
  keywords: [
    "horlicks", "bournvita", "complan", "boost", "protinex",
    "milo", "ovaltine", "health drink", "nutrition drink", "malt drink",
    "malted drink", "malt beverage", "energy drink powder",
    "health & nutrition drink", "chocolate drink powder",
  ],
  typicalStructure: {
    rawMaterials: { lowPct: 35, highPct: 48 },
    packaging: {
      lowPct: 8,
      highPct: 14,
      origins: [
        { country: "IN", countryName: "India", probabilityPct: 70 },
        { country: "MIXED", countryName: "Mixed", probabilityPct: 30 },
      ],
    },
    manufacturing: { lowPct: 6, highPct: 10 },
    logistics: { lowPct: 5, highPct: 8 },
    retailMargin: { lowPct: 10, highPct: 16 },
    brandMargin: { lowPct: 5, highPct: 10 },
    advertising: { lowPct: 8, highPct: 14 },
    gst: { lowPct: 18, highPct: 18 },
    brandProfit: {
      lowPct: 5,
      highPct: 10,
      origins: [
        { country: "NL", countryName: "Netherlands", probabilityPct: 45, notes: "Horlicks + Boost owned by HUL, parent Unilever NV." },
        { country: "US", countryName: "United States", probabilityPct: 35, notes: "Bournvita owned by Mondelez International (Chicago)." },
        { country: "IN", countryName: "India", probabilityPct: 20, notes: "Complan acquired by Zydus Wellness (Indian) from Kraft Heinz in 2019." },
      ],
    },
  },
  rawMaterials: [
    {
      name: "Malt extract / malted barley",
      sharePct: { low: 20, high: 35 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 55, notes: "India grows barley; domestic malting capacity at Punjab, Rajasthan." },
        { country: "GB", countryName: "United Kingdom", probabilityPct: 25, notes: "Horlicks malt historically UK-sourced; production shifted partly to India." },
        { country: "MIXED", countryName: "Mixed (EU/Australia)", probabilityPct: 20 },
      ],
    },
    {
      name: "Cocoa solids / chocolate powder",
      sharePct: { low: 5, high: 15 },
      typicalOrigin: [
        { country: "CI", countryName: "Ivory Coast", probabilityPct: 45, notes: "World's largest cocoa producer. Bournvita and chocolate variants." },
        { country: "GH", countryName: "Ghana", probabilityPct: 30 },
        { country: "IN", countryName: "India", probabilityPct: 25, notes: "Some cocoa grown in Kerala/Karnataka but <5% of national need." },
      ],
    },
    {
      name: "Skim milk powder / whey protein",
      sharePct: { low: 10, high: 20 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 60, notes: "Domestic SMP capacity growing; large producers like Amul, Heritage." },
        { country: "NZ", countryName: "New Zealand", probabilityPct: 25, notes: "Fonterra SMP for premium/consistent quality." },
        { country: "MIXED", countryName: "EU", probabilityPct: 15 },
      ],
    },
    {
      name: "Sugar",
      sharePct: { low: 20, high: 35 },
      typicalOrigin: [
        { country: "IN", countryName: "India", probabilityPct: 98, notes: "India is world's 2nd largest sugar producer." },
      ],
    },
    {
      name: "Vitamins & minerals premix",
      sharePct: { low: 2, high: 5 },
      typicalOrigin: [
        { country: "CN", countryName: "China", probabilityPct: 60, notes: "China dominates global vitamin manufacturing (B-vitamins, Vitamin C)." },
        { country: "DE", countryName: "Germany", probabilityPct: 25, notes: "DSM, BASF — specialty premixes." },
        { country: "IN", countryName: "India", probabilityPct: 15 },
      ],
    },
  ],
  madeInIndiaBand: { lowPct: 68, highPct: 80 },
  llmGuidance:
    "Health drinks IVC varies by brand: Complan (Zydus Wellness, Indian) scores highest ~78-80%. Horlicks and Boost (both HUL/Unilever NL) and Bournvita (Mondelez US) are lower ~68-75% due to foreign brand profit. Cocoa is the dominant import for chocolate variants; malt/barley is partly Indian. Advertising spend is very high in this category (15-20% of MRP) — Horlicks 'taller, stronger, sharper' campaigns. Sugar is almost entirely Indian. GST 18%.",
  sources: [
    {
      title: "HUL Annual Report — Horlicks/Boost acquisition from GSK",
      url: "https://www.hul.co.in/investor-relations/annual-reports/",
      relevance: "Brand ownership; Horlicks + Boost under Unilever",
    },
    {
      title: "Zydus Wellness — Complan acquisition announcement",
      url: "https://www.zyduswellness.in/investor-relations",
      relevance: "Complan brand now Indian-owned",
    },
    {
      title: "GST on malted food drinks — HSN 1901",
      url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
      relevance: "18% GST",
    },
    {
      title: "India barley & malt industry — APEDA",
      url: "https://apeda.gov.in/apedawebsite/SubHead_Products/Barley.htm",
      relevance: "Domestic malt supply chain",
    },
  ],
};
