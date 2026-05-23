# Data Pipeline — what, from where

Concise map of every data input, its source, and where it's used. For review.

---

## 0. What this is

**Parakhi** ("kya hai andar?") tells you where your money goes when you buy an
Indian product. Paste a name / barcode / link → get **Indian Value Capture (IVC)**:
the share of MRP that flows to Indian sources, plus a cost breakdown, import
origins, and GST — every number with a confidence dot and a source tier.

The whole design rests on one promise: **honest about what we know and don't.**
Numbers come from curated category templates + public data + arithmetic. No LLM
ever invents a number. Products in a category we haven't researched show
"not yet supported" — we never fake a breakdown.

## 0.1 Assumptions already baked in

| Assumption | Why / effect |
|------------|--------------|
| **IVC excludes GST** | tax to govt ≠ value to producers; and GST (0–40%) would distort cross-category comparison |
| **GST always counts as "Indian"** | it goes to the Indian govt — but it's shown separately, not inside IVC |
| **Non-RM buckets default 100% Indian** | labor, retail, logistics are domestic unless a template overrides (e.g. imported cans, foreign royalty) |
| **Brand profit follows the parent company's country** | Coca-Cola → US, Unilever → NL. Royalty/brand margin attributed abroad |
| **"MIXED" origin = 50% Indian** | genuine unknown; better than counting fully foreign |
| **Composition share ≈ cost share** within raw materials | no per-material cost multiplier yet; weight/volume used as proxy |
| **Origin probabilities are template-author estimates** | not customs data (DGCIS/Volza not wired) — Tier 2/3, shown with ranges |
| **±5pt band** on IVC / Composition-MII | reflects template range uncertainty; tightens as data improves |
| **One product = one (brand, name, variant)** | "Parle-G 55g" and "Parle-G 100g" are distinct rows |
| **Hero products override the algorithm** | hand-curated (Parle-G); everything else is computed |
| **Default deterministic** | LLM only as optional resolve/categorize fallback; off entirely with `LLM_PROVIDER=none` |

---

## 1. External sources

| # | Data | Source | Auth | Cadence | Tier | Code |
|---|------|--------|------|---------|------|------|
| 1 | HSN → GST rate | CBIC schedule (hand-curated CSV) | none | weekly | 1 | `scripts/ingest-cbic-gst.ts` ← `prisma/seed-data/cbic-hsn-rates.csv` |
| 2 | Brand → parent → country | Wikidata SPARQL | none | monthly | 2 | `scripts/ingest-wikidata-brands.ts`, `lib/wikidata.ts` |
| 3 | Commodity wholesale prices | data.gov.in Agmarknet | API key | daily | 1 | `scripts/ingest-agmarknet.ts` |
| 4 | Barcode → product, ingredients, qty | Open Food Facts | none | on-demand | 2 | `lib/resolve-rules.ts` |
| 5 | URL → title/brand | Open Graph one-shot fetch | none | on-demand (cached) | 3 | `lib/resolve-rules.ts` |
| 6 | Category cost structure + raw-material composition + origin % | **category templates (human-authored)** | — | manual | 2–3 | `prisma/seed-data/<category>.ts` |

> Note: rows 1–3 are ingested into DB tables. Row 6 is the editorial layer — the part no API gives us.

---

## 2. DB tables that hold ingested data

| Table | Filled by | Holds |
|-------|-----------|-------|
| `HsnGstRate` | ingest:cbic | hsnPrefix → rate, cess, asOfDate, sourceUrl |
| `BrandIndex` | ingest:wikidata | slug, aliases[], parentCompany, country (ISO-2), source |
| `CommodityPrice` | ingest:agmarknet | commodity, market, modal ₹/quintal, date |
| `Category` | `db:seed` (from templates) | template JSON + denormalized hsnCodes/keywords |

---

## 3. Per-query flow

```
USER QUERY ("Lay's Magic Masala" | barcode | amazon URL)
        │
        ▼
[1] RESOLVE  → ResolvedProduct {brand, name, variant, barcode?, ingredients?}
        │     barcode → Open Food Facts (#4)
        │     URL     → Open Graph fetch (#5)
        │     text    → BrandIndex fuzzy match (#2)        [deterministic]
        │     (LLM fallback only if LLM_PROVIDER != none)
        ▼
[2] CATEGORIZE → categorySlug + hsnCode
        │     HSN prefix match → keyword overlap           [deterministic]
        │     0 match → "uncategorized" (honest stop)
        │     (LLM fallback only if LLM_PROVIDER != none)
        ▼
[3] ENRICH (at compute time, in lib/estimate.ts)
        │     GST rate    ← HsnGstRate lookup by HSN (#1)   → overrides template
        │     brandProfit ← BrandIndex country (#2)         → overrides template
        ▼
[4] COMPUTE  → ProductBreakdown                            [pure, deterministic]
        │     lib/breakdown-compute.ts
        │     inputs: template (#6) + GST override + brand override + MRP
        │     outputs: IVC, Composition-MII, components[], imports[], GST
        ▼
[5] PERSIST  → Product + Breakdown rows (cache)
        ▼
[6] PRESENT  → /p/<slug>
```

Second query for same product → cache hit at [5], skips [1]–[4].

---

## 4. What each source feeds in the final breakdown

| Output number | Comes from |
|---------------|-----------|
| GST rate + ₹ | `HsnGstRate` (#1), Tier 1 |
| brandProfit origin (foreign royalty) | `BrandIndex` (#2), Tier 2 |
| raw-material composition % | template (#6) |
| raw-material origin probabilities | template (#6) — *seed values; DGCIS customs data not yet wired* |
| cost-bucket bands (packaging/mfg/margin) | template (#6) |
| commodity price reference | `CommodityPrice` (#3) — *ingested, not yet shown in UI* |
| IVC, Composition-MII | computed (#4) from the above |

---

## 5. LLM usage

| Step | LLM_PROVIDER=none | =openai |
|------|-------------------|---------|
| Resolve text | BrandIndex only | rules first, LLM fallback on miss |
| Categorize | keyword/HSN only | rules first, LLM fallback on miss |
| Compute | — never uses LLM — | — never uses LLM — |
| Category-draft (admin) | n/a | gpt-4o drafts a template for review |

Spend cap: `LLM_MONTHLY_USD_CAP` ($20) hard-stops all calls. Ollama exempt.

---

## 6. Known gaps / weak spots (for your review)

- **Raw-material origin %** are template-author estimates, not customs data. DGCIS / Volza not wired. Biggest Tier-quality gap.
- **Commodity prices** ingested daily but not yet used in compute or shown — dormant.
- **CBIC** is a hand-maintained CSV, not a live scrape. 39 HSN chapters only.
- **MRP** absent for most products → no rupee amounts, only %.
- **BrandIndex** = 66 brands. Misses regional/small brands → those queries hit "uncategorized" or fail resolve.
- **Composition shares** assume weight ≈ cost within raw materials (no per-material cost multiplier).
- **GST cess** (e.g. +12% on aerated) stored but not added to displayed rate (shows 28%, not 40% effective).
