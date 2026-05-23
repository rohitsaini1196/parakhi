/**
 * Ingest HSN → GST rates into `HsnGstRate`.
 *
 *   npm run ingest:cbic
 *
 * Phase 1 strategy: read from `prisma/seed-data/cbic-hsn-rates.csv` (the
 * canonical hand-curated table, checked into git). Web-scraping the CBIC HTML
 * schedule is deferred until the page structure is verified stable.
 *
 * Idempotent — `hsnPrefix` is the primary key, upsert overwrites.
 *
 * After every run, products whose HSN matches a newly-loaded row will get a
 * CBIC-sourced (Tier 1) GST rate on next compute. Templates' `defaultGstRate`
 * stays as the fallback.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { db } from "../lib/db";

const CSV_PATH = resolve(
  __dirname,
  "..",
  "prisma",
  "seed-data",
  "cbic-hsn-rates.csv",
);

interface Row {
  hsnPrefix: string;
  ratePct: number;
  cessPct: number;
  description: string;
  source: string;
  sourceUrl: string;
  asOfDate: Date;
}

/** A tiny CSV parser. Handles double-quoted fields with embedded commas; no
 *  escaped quotes inside quoted fields (the CSV is hand-maintained, simple). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  for (const line of lines) {
    const fields: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        const end = line.indexOf('"', i + 1);
        if (end === -1) throw new Error(`Unterminated quote: ${line}`);
        fields.push(line.slice(i + 1, end));
        i = end + 1;
        if (line[i] === ",") i += 1;
      } else {
        const next = line.indexOf(",", i);
        if (next === -1) {
          fields.push(line.slice(i));
          i = line.length;
        } else {
          fields.push(line.slice(i, next));
          i = next + 1;
        }
      }
    }
    rows.push(fields);
  }
  return rows;
}

async function loadRows(): Promise<Row[]> {
  const text = await readFile(CSV_PATH, "utf-8");
  const all = parseCsv(text);
  if (all.length === 0) throw new Error("Empty CSV");
  const [header, ...data] = all;
  const idx = (name: string) => {
    const i = header!.indexOf(name);
    if (i === -1) throw new Error(`Missing column ${name}`);
    return i;
  };
  const hI = idx("hsnPrefix");
  const rI = idx("ratePct");
  const cI = idx("cessPct");
  const dI = idx("description");
  const sI = idx("source");
  const uI = idx("sourceUrl");
  const aI = idx("asOfDate");
  return data.map((cells) => ({
    hsnPrefix: cells[hI]!.trim(),
    ratePct: Number(cells[rI]),
    cessPct: Number(cells[cI]),
    description: cells[dI]!,
    source: cells[sI]!,
    sourceUrl: cells[uI]!,
    asOfDate: new Date(cells[aI]!),
  }));
}

async function main() {
  const rows = await loadRows();
  let written = 0;
  for (const r of rows) {
    await db.hsnGstRate.upsert({
      where: { hsnPrefix: r.hsnPrefix },
      update: {
        ratePct: r.ratePct,
        cessPct: r.cessPct,
        description: r.description,
        source: r.source,
        sourceUrl: r.sourceUrl,
        asOfDate: r.asOfDate,
      },
      create: r,
    });
    written++;
  }
  console.log(`✓ Loaded ${written} HSN→GST rows from CSV.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
