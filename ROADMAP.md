# Parakhi — Roadmap

Living doc. Points only — each is a future discussion, not a decision. Beta is
live; this is everything after.

---

## Where we are (beta, shipped)

- Live: parakhi.vercel.app (Vercel + Neon free tier)
- Deterministic pipeline: resolve → categorize → compute → cache; LLM-free capable
- 10 categories, ~100 brands, 40 HSN→GST rows, Agmarknet prices
- IVC (GST-excluded) + Composition-MII, every number sourced + tiered
- 4-fold scroll-story UI (design handoff), warm-dark system, NoteFill visual
- GH Actions cron (daily/weekly/monthly ingest + nightly recompute)
- Honesty path (uncategorized stop, draft-on-demand never auto-publishes)
- Secure, OSS, MIT

---

## 1. Search (flagged — currently weak)

- Need 1000+ products before search feels real. Today it's thin + creates-on-miss.
- Instant, typo-tolerant, ranked autocomplete (Fuse.js client-side, or Postgres
  trigram / Meilisearch / Typesense once catalog grows).
- Search by: brand, product, category, barcode, even "Maggi" → all Maggi variants.
- Synonyms + Hinglish spellings ("kurkure", "kurkuray", "maggi", "maggie").
- Recent + trending + "most surprising" surfaced when query empty.
- Barcode scan (camera) on mobile → instant lookup.
- Zero-result UX: graceful "request this" → draft queue.
- Pre-seed the top 500–1000 SKUs so search has substance from day one.

## 2. Compare (flagged — new feature)

- Side-by-side: Maggi vs Yippee, Pepsi vs Diet Coke, Gold Flake variants.
- Shared rupee-bar overlay; diff the splits; highlight where they diverge.
- "Which is more Indian?" verdict + the one line that explains the gap.
- Comparison URL = shareable artifact (/compare/maggi-vs-yippee).
- Category leaderboards feed compare ("most Indian biscuit" → tap two to compare).
- Watch for false precision — compare must show confidence/ranges so people
  don't over-read a 2-point gap.

## 3. Performance (flagged — site feels slow)

Likely suspects to investigate:
- **Neon free auto-suspends** → cold-start latency (~0.5–2s) on first hit after idle.
  Mitigate: keep-warm ping, or accept, or upgrade tier.
- **No caching / ISR** — product pages are dynamic (`ƒ`), re-query + re-parse
  template JSON every request. Add ISR / `revalidate` / full route cache for
  product pages (data changes rarely).
- **Homepage fetches 9 products, parses JSON per card** every load. Cache it.
- **4 Google fonts** (Instrument Serif, Geist, JetBrains Mono, Tiro Devanagari)
  — block render. Subset / preload / drop one.
- **Client components everywhere** (folds are "use client") → hydration cost.
  Move static folds to server components; keep only interactive bits client.
- **Big inline-style objects** recreated each render — minor, but adds up.
- Measure first: Lighthouse + Vercel Analytics + Neon query timings before fixing.

---

## What more to think about

### Data & methodology (the moat)
- Replace template-author origin estimates with real **DGCIS / customs trade data**.
- Per-material **cost model** — drop the weight≈cost assumption; add cost multipliers.
- **Evidence as first-class** entity (per-number citations, not category-level).
- Component **graph model** (Node/Edge) for hero products — trace can → aluminium → bauxite.
- GST **cess** handling (aerated drinks show 28% not 40% effective).
- Versioned templates + **recompute diff alerts** (already partial) → public changelog.
- Confidence intervals shown honestly everywhere; never false precision.

### Coverage & contribution
- Path to **1000+ products** — pre-seed top SKUs + draft-on-demand + review.
- **Who reviews drafts?** Editorial board / trusted contributors / maintainer-only.
- Template authoring guide + contribution loop (PRs, issues, "propose a number").
- Crowdsource MRPs + barcodes (Open Prices write-back).
- Category requests / voting → prioritize what to research next.

### Product surfaces
- **OG share images** (auto-generated per product, 1200×630) — the viral unit.
- **Category leaderboards** `/c/[slug]` — "rank every biscuit by Indian-ness".
- **Brand pages** `/b/[slug]` — all of a brand's products + parent/country.
- **Watchlist / alerts** — notify when a product's IVC changes.
- **Hindi / regional languages** (the soul is bilingual; UI is English today).
- **Barcode scanner** PWA on mobile.
- **Browser extension** — show IVC on Amazon/Flipkart/Blinkit product pages.
- **Embeddable widget** for journalists / blogs.
- **Public data API + dumps** (`/api/data/*`) — let others build on it.

### Governance & trust
- Template **edit history + authorship** (Wikipedia-style) — contestability.
- Published **methodology page** + the "why GST excluded" rationale.
- Correction workflow — feedback → triage → template PR → recompute.
- Conflict-of-interest policy for contributors (ex-FMCG employees etc.).
- "We don't know" stays a first-class answer.

### Infra & sustainability
- Free-tier ceilings: Neon compute-hours (not storage) bite first under traffic.
- Caching strategy to keep DB cold/cheap (ISR, edge cache).
- When/if to spend: Neon Launch ($19), or self-host Postgres ($5 VPS).
- Cloudflare in front for bandwidth headroom if it goes viral.
- Backups (Neon PITR), monitoring, error tracking (Sentry free tier).

---

## How to make it successful (distribution / growth)

- **Viral-once mechanics**: the share artifact (OG image + one surprising line)
  must be irresistible. "₹14 of your ₹50 Diet Coke flies abroad."
- **Launch story**: pick 5–10 products with genuinely surprising results, seed
  the narrative (HN, Reddit r/india, Twitter/X, product Slack/WhatsApp groups).
- **Journalist hook**: pitch the methodology + a data angle (FMCG pricing,
  shrinkflation, import dependence). Make it citable.
- **Credibility first**: never get caught with a wrong confident number. One
  viral correction undoes a launch. Confidence labels are the insurance.
- **SEO**: static product pages + OG + structured data → organic "is X made in
  India" searches.
- **Repeatable hooks**: shrinkflation timelines, "most foreign thing in your
  kitchen", festival/▮Diwali "shop Indian" moments, budget/GST-change tie-ins.
- **Community**: OSS contributors who add categories = compounding coverage +
  evangelists.
- **Partnerships**: consumer-rights orgs, civic-tech (e.g. foundations),
  maybe a media outlet for a recurring column.
- **Not a startup**: success = a stranger shares it because it's true. Optimize
  for that, not MAUs.

---

## Open questions to resolve in planning

1. Pre-seed catalog (top 1000 SKUs) — manual + LLM-draft + review? Who/how?
2. Methodology: invest in customs data now, or ship more categories first?
3. Graph model — heroes only, or everyone? Big refactor cost.
4. Growth bet — viral spike vs steady civic tool. Shapes the roadmap.
5. Governance — editorial board? When?
6. Spend appetite — stay 100% free, or budget for data/infra?
7. Languages — Hindi at what point?
