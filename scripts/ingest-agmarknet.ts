/**
 * Pull today's mandi prices from data.gov.in Agmarknet for the commodities we
 * care about, and upsert into CommodityPrice.
 *
 *   npm run ingest:agmarknet
 *
 * Safe to run daily (idempotent — unique on
 * commodity+variety+market+arrivalDate). Free tier: 100 calls/day per key, we
 * use ~1 call per commodity.
 *
 * Datasource: https://data.gov.in (resource 9ef84268-d588-465a-a308-a864a43d0070)
 */
import { db } from "../lib/db";

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

/**
 * The Agmarknet commodities we map to our raw materials. The keys are
 * Agmarknet's exact spelling (case-sensitive). Add to this list to expand
 * coverage as templates grow.
 */
const COMMODITIES = [
  "Wheat",
  "Sugar",
  "Palm Oil",
  "Mustard Oil",
  "Sunflower",
  "Soyabean",
  "Paddy(Dhan)(Common)",
  "Rice",
  "Maize",
  "Onion",
  "Potato",
];

const PAGE_LIMIT = 500;

interface AgmarknetRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string; // DD/MM/YYYY
  min_price: string | number;
  max_price: string | number;
  modal_price: string | number;
}

interface AgmarknetResponse {
  total: number;
  count: number;
  records: AgmarknetRecord[];
}

function parseDate(ddmmyyyy: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(ddmmyyyy);
  if (!m) return null;
  return new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00Z`);
}

async function fetchCommodity(name: string, apiKey: string) {
  const url = new URL(BASE_URL);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(PAGE_LIMIT));
  url.searchParams.set("filters[commodity]", name);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Agmarknet ${name}: HTTP ${res.status}`);
  }
  const body = (await res.json()) as AgmarknetResponse;
  return body;
}

async function main() {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DATA_GOV_IN_API_KEY not set. Add it to .env (free key from data.gov.in profile).",
    );
  }

  let inserted = 0;
  let skipped = 0;

  for (const commodity of COMMODITIES) {
    const body = await fetchCommodity(commodity, apiKey);
    if (body.count === 0) {
      console.log(`  · ${commodity.padEnd(22)} 0 records`);
      continue;
    }
    for (const r of body.records) {
      const arrivalDate = parseDate(r.arrival_date);
      if (!arrivalDate) {
        skipped++;
        continue;
      }
      try {
        await db.commodityPrice.upsert({
          where: {
            commodity_variety_market_arrivalDate: {
              commodity: r.commodity,
              variety: r.variety,
              market: r.market,
              arrivalDate,
            },
          },
          update: {
            minPricePerQuintal: Number(r.min_price),
            maxPricePerQuintal: Number(r.max_price),
            modalPricePerQuintal: Number(r.modal_price),
          },
          create: {
            commodity: r.commodity,
            variety: r.variety,
            state: r.state,
            district: r.district,
            market: r.market,
            grade: r.grade || null,
            arrivalDate,
            minPricePerQuintal: Number(r.min_price),
            maxPricePerQuintal: Number(r.max_price),
            modalPricePerQuintal: Number(r.modal_price),
          },
        });
        inserted++;
      } catch {
        skipped++;
      }
    }
    console.log(
      `  ✓ ${commodity.padEnd(22)} ${body.count}/${body.total} pulled`,
    );
  }

  console.log(`\nUpserted ${inserted} rows. Skipped ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
