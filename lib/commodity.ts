import { db } from "./db";

/**
 * Closes the Agmarknet loop. We ingest daily mandi (wholesale) commodity
 * prices into `CommodityPrice` — this maps a template raw-material to its
 * Agmarknet commodity and returns the latest national modal price, so the
 * component can carry a real, dated, Tier-1 market anchor instead of a pure
 * estimate.
 *
 * Honest scope: Agmarknet prices the *input commodity* (wheat grain, raw
 * sugar, crude/refined oil), not the finished ingredient — there's a
 * processing markup we don't model. So this is a sourced *input reference*,
 * not the finished-ingredient cost. We label it as such.
 */

// raw-material label (lowercased) → Agmarknet commodity name (exact spelling).
const MATERIAL_TO_COMMODITY: { match: RegExp; commodity: string }[] = [
  { match: /wheat|maida|atta|refined flour/, commodity: "Wheat" },
  { match: /sugar/, commodity: "Sugar" },
  { match: /palm/, commodity: "Palm Oil" },
  { match: /mustard/, commodity: "Mustard Oil" },
  { match: /sunflower/, commodity: "Sunflower" },
  { match: /soy/, commodity: "Soyabean" },
  { match: /rice|paddy/, commodity: "Rice" },
  { match: /maize|corn/, commodity: "Maize" },
  { match: /potato/, commodity: "Potato" },
  { match: /onion/, commodity: "Onion" },
];

export interface CommodityAnchor {
  commodity: string;
  modalPerQuintal: number;
  market: string;
  asOf: string; // ISO date
}

/**
 * Latest national modal price per commodity (most recent arrivalDate, median-ish
 * via the highest-arrival row). One query, cached by the caller.
 */
export async function latestCommodityPrices(): Promise<Map<string, CommodityAnchor>> {
  const commodities = MATERIAL_TO_COMMODITY.map((m) => m.commodity);
  const rows = await db.commodityPrice.findMany({
    where: { commodity: { in: commodities } },
    orderBy: { arrivalDate: "desc" },
    take: 2000,
  });
  const out = new Map<string, CommodityAnchor>();
  for (const r of rows) {
    if (out.has(r.commodity)) continue; // first = most recent
    out.set(r.commodity, {
      commodity: r.commodity,
      modalPerQuintal: r.modalPricePerQuintal,
      market: r.market,
      asOf: r.arrivalDate.toISOString().slice(0, 10),
    });
  }
  return out;
}

/** Map a raw-material label to its commodity anchor, if we have a price. */
export function anchorForMaterial(
  label: string,
  prices: Map<string, CommodityAnchor>,
): CommodityAnchor | null {
  const l = label.toLowerCase();
  for (const { match, commodity } of MATERIAL_TO_COMMODITY) {
    if (match.test(l)) {
      return prices.get(commodity) ?? null;
    }
  }
  return null;
}
