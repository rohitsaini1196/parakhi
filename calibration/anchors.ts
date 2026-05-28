/**
 * Hand-verified ground-truth anchors. The honest test of whether our numbers
 * are right. Each anchor states an *expected range* for a metric we can defend
 * from a real source, plus the source. Calibration measures deviation.
 *
 * Ground truth for Indian FMCG cost structure is scarce — so anchors are few,
 * conservative (ranges not points), and explicit about what they're based on.
 * Add more as we find published teardowns / filings. Better 6 honest anchors
 * than 60 guessed ones.
 */

export interface Anchor {
  slug: string;
  /** Expected Indian Value Capture range (%), from the cited basis. */
  ivc?: [number, number];
  /** Expected GST rate (%) — exactly verifiable from the CBIC schedule. */
  gstRate?: number;
  /** Raw materials we are confident ARE in this product (must appear). */
  mustContain?: string[];
  basis: string;
  source: string;
}

export const ANCHORS: Anchor[] = [
  {
    slug: "parle-g-55g",
    ivc: [88, 95],
    mustContain: ["wheat", "sugar", "palm"],
    basis:
      "Hand-researched hero. Mostly Indian (wheat/sugar/domestic labour+retail); only palm oil (~13% of biscuit) imported. Parle is fully Indian-owned.",
    source: "MCA filings (Parle Products) + OFF ingredients + DGFT palm-oil import data",
  },
  {
    slug: "amul-taaza-toned-milk-500ml",
    ivc: [95, 100],
    mustContain: ["milk"],
    basis:
      "Liquid milk is ~entirely Indian: domestic dairy, cooperative-owned (Amul/GCMMF), 0% GST, negligible imported inputs.",
    source: "NDDB / Amul (GCMMF) — domestic dairy cooperative; GST schedule (milk exempt)",
  },
  {
    slug: "coca-cola-diet-coke-330ml",
    ivc: [70, 85],
    basis:
      "Mostly Indian water/labour/retail, but aluminium can partly imported (Middle East) and brand royalty flows to Coca-Cola (US). Demerit-slab GST.",
    source: "Coca-Cola ownership (Wikidata) + aluminium-can import pattern + CBIC aerated-drinks rate",
  },
  {
    slug: "fortune-sunflower-oil-1l",
    ivc: [40, 65],
    mustContain: ["oil"],
    basis:
      "India imports ~55-60% of edible oil; sunflower is heavily imported (Russia/Ukraine/Argentina). Oil is ~80% of cost, so import share dominates → low IVC.",
    source: "Solvent Extractors' Association of India; DGFT edible-oil import data",
  },
  {
    slug: "tata-tea-premium-500g",
    ivc: [92, 100],
    mustContain: ["tea"],
    basis:
      "Tea leaf is ~entirely Indian (Assam/Nilgiri); Tata Consumer is Indian-owned. Only minor imported packaging/additives.",
    source: "Tea Board of India; Tata Consumer Products (Indian-listed)",
  },
];
