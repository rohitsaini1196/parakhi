/**
 * Wikidata SPARQL client for brand → parent → country enrichment.
 *
 * Endpoint: https://query.wikidata.org/sparql
 * Politeness: User-Agent identifying the project + contact email, single
 * concurrent request, no retries faster than 1s.
 *
 * We deliberately keep this thin — one query, one helper. Heavier ingestion
 * lives in scripts/ingest-wikidata-brands.ts.
 */

import { USER_AGENT } from "./contact";

const ENDPOINT = "https://query.wikidata.org/sparql";

export interface WikidataBrandHit {
  qid: string;
  canonicalName: string;
  aliases: string[];
  parentCompany: string | null;
  /** ISO 3166-1 alpha-2. "IN", "US", "GB", "CH", etc. */
  country: string | null;
}

/**
 * Fetch a brand by exact name from Wikidata. Returns the first matching item
 * that is an instance of (or subclass of) a brand / company / business
 * organization. Returns null if no match.
 *
 * The SPARQL filter is deliberately loose on the entity-type side (matches
 * brand, business, company subclasses) and tight on the label side (case-
 * insensitive exact match). The caller (ingest script) is responsible for
 * disambiguation when multiple hits are plausible.
 */
export async function fetchBrandFromWikidata(
  name: string,
): Promise<WikidataBrandHit | null> {
  const query = `
    SELECT ?item ?itemLabel ?parent ?parentLabel ?countryCode
           (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases) WHERE {
      ?item rdfs:label "${escapeSparql(name)}"@en .
      ?item wdt:P31/wdt:P279* ?type .
      VALUES ?type {
        wd:Q431289   # brand
        wd:Q4830453  # business
        wd:Q783794   # company
        wd:Q43229    # organization
      }
      OPTIONAL {
        ?item wdt:P749 ?parent .
        ?parent rdfs:label ?parentLabel . FILTER(LANG(?parentLabel) = "en")
      }
      OPTIONAL {
        ?item wdt:P17 ?country .
        ?country wdt:P297 ?countryCode .
      }
      OPTIONAL {
        # If item has no country but parent does, fall back to parent.
        FILTER(!BOUND(?countryCode))
        ?parent wdt:P17 ?country .
        ?country wdt:P297 ?countryCode .
      }
      OPTIONAL { ?item skos:altLabel ?alias . FILTER(LANG(?alias) = "en") }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
    }
    GROUP BY ?item ?itemLabel ?parent ?parentLabel ?countryCode
    LIMIT 1
  `;

  const url = new URL(ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("format", "json");

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/sparql-results+json",
    },
  });
  if (!res.ok) {
    throw new Error(`Wikidata SPARQL ${res.status}: ${await res.text()}`);
  }
  const body = (await res.json()) as {
    results: { bindings: Array<Record<string, { value: string }>> };
  };
  const row = body.results.bindings[0];
  if (!row) return null;

  const itemIri = row.item?.value ?? "";
  const qid = itemIri.split("/").pop() ?? "";
  return {
    qid,
    canonicalName: row.itemLabel?.value ?? name,
    aliases: row.aliases?.value
      ? row.aliases.value.split("|").filter(Boolean)
      : [],
    parentCompany: row.parentLabel?.value ?? null,
    country: row.countryCode?.value ?? null,
  };
}

function escapeSparql(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
