# Sprint 1 — "Fast, seeded, shareable"

PM/EM owned. ~2 weeks, solo-ish. Goal: the live beta stops feeling slow, has
enough products that search/compare are real, and produces a share artifact
worth posting. **Not** a methodology sprint — that's Sprint 3.

> Sprint goal (one line): _A stranger can search a real catalog, get an instant
> fast result, and share an image that makes a friend say "no way."_

Priorities: **P0** = must ship this sprint · **P1** = ship if time · **P2** = next sprint.

---

## P0 — must ship

### SEC-1 · Rotate chat-exposed creds — 0.5d
- Neon password reset → update Vercel `DATABASE_URL` (keep `-pooler` + `pgbouncer=true`).
- Confirm `ADMIN_PASS` rotated (done), `IP_HASH_SALT` set (done).
- **Done when:** old Neon creds dead; site still up.

### PERF-1 · Cache product + home pages — 1.5d
- Product pages are dynamic (`ƒ`), re-query + re-parse template JSON every hit.
  Add `export const revalidate = 3600` (ISR) — breakdowns change only on recompute.
- Homepage "recently analysed" cached too.
- On recompute / new product, revalidate the path.
- **Done when:** repeat product loads served from cache; TTFB drops sharply.

### PERF-2 · Font diet — 0.5d
- 4 Google fonts block render. Keep Instrument Serif + Geist; subset; `display:swap`;
  drop or defer JetBrains Mono + Tiro Devanagari (load Deva only where used).
- **Done when:** font payload down, no FOIT on the hero number.

### PERF-3 · Server/client split — 1d
- Folds are all `"use client"`. Make static folds (3 mostly, 4) server components;
  keep client only for the interactive bits (CountUp, NoteFill, hover breakdown).
- **Done when:** less JS shipped; hydration cost down; Lighthouse TBT improves.

### PERF-0 · Measure baseline first — 0.5d (do before PERF-1..3)
- Vercel Analytics + Lighthouse + Neon query timings. Record before/after.
- **Done when:** we have numbers, not vibes.

### DATA-1 · Pre-seed top ~200 SKUs — 3d
- Across the existing 10 categories, seed the highest-search-intent products
  (Maggi/Yippee/biscuit brands/colas/soaps/teas/toothpastes/chips/waters/detergents).
- Script: list of brand+variant → run through resolve/categorize/compute → persist.
  Human spot-check the slugs + obvious wrong categorizations.
- **Done when:** ~200 products live; search + "recently analysed" feel populated.

### SEARCH-1 · Instant client autocomplete — 1.5d
- Over the seeded catalog: client-side Fuse.js (or trigram on Postgres) — ranked,
  instant, no per-keystroke round-trip lag.
- Brand → variants; product → product; category surfaced.
- **Done when:** typing "mag" instantly lists Maggi variants; no jank.

---

## P1 — ship if time

### SHARE-1 · OG share image per product — 2d
- `@vercel/og` (edge) renders 1200×630: the NoteFill split + big IVC + verdict +
  product name. The viral unit for WhatsApp/Twitter.
- **Done when:** pasting a product link in WhatsApp shows the card.

### COMPARE-1 · Compare two products (MVP) — 2d
- `/compare?a=slug&b=slug` — two rupee bars + IVC side by side, diff highlighted,
  one-line "which is more Indian + why". Confidence shown (no false precision).
- Entry points: a "compare" button on product page + leaderboard.
- **Done when:** Maggi vs Yippee renders + is shareable.

### SEARCH-2 · Typo tolerance + synonyms — 1d
- Hinglish spellings ("kurkuray", "maggie"), fuzzy threshold tuned.
- **Done when:** common misspellings resolve.

### CLEAN-1 · Prune dead components — 0.5d
- Remove now-unused: old RupeeFlowBar, StatOrbs, DigDeeper, old SearchForm,
  old Wordmark, Dots, StackedBar.
- **Done when:** repo has no orphaned UI; build green.

---

## P2 — next sprint (don't start now)

- LEADER-1 · Category leaderboards `/c/[slug]` (feeds compare + virality)
- BRAND-1 · Brand pages `/b/[slug]`
- METHOD-1 · Methodology hardening spike (DGCIS customs data, cost model) — own sprint
- GST cess fix (28% vs 40% effective)
- Hindi UI pass
- Barcode scanner PWA

---

## Sequence (dependency-aware)

```
SEC-1 ─┐
PERF-0 ─┼─► PERF-1 ─► PERF-2 ─► PERF-3      (perf track, parallelizable-ish)
DATA-1 ───────────────► SEARCH-1 ─► SEARCH-2  (catalog must precede search)
                        └─► SHARE-1, COMPARE-1 (need products to be worth it)
CLEAN-1 anytime
```

Week 1: SEC-1, PERF-0→3, start DATA-1.
Week 2: finish DATA-1, SEARCH-1, then SHARE-1 / COMPARE-1 as time allows.

## Explicitly NOT this sprint
- No methodology/customs-data work (Sprint 3).
- No graph model.
- No new categories beyond seeding existing ones.
- No auth/accounts, no Hindi, no extension.

## Definition of done (sprint)
- Lighthouse perf ≥ 90 on product page; TTFB < 800ms warm.
- ~200 products searchable instantly.
- A product link shared in WhatsApp shows a real OG card.
- Repo clean, deployed, creds rotated.

## Risks
- DATA-1 categorization errors at volume → budget spot-check time; bad rows
  visible publicly. Mitigate: review before seeding prod.
- Neon cold-start may dominate TTFB regardless of caching → may need keep-warm
  or tier bump; decide after PERF-0 numbers.
- Seeding 200 products via LLM resolve = small spend; within $20 cap, watch it.
