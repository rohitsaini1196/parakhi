# Parakhi — "Kya hai andar?"

> **parakh** (परख) — _to assay; to test the purity of a coin or of gold._

An honest, open-source consumer transparency tool for Indian products.

Paste a product name, an Amazon/Flipkart link, or a barcode. Get back:

- **Made in India score** (0–100, with a range)
- **GST rate and rupee amount** that went to government
- **Estimated cost breakdown** by share of MRP (ranges, not points)
- **Imported ingredients** with likely country origins
- **Confidence indicator and source tier** on every single number

The single most important property of this project: **it is honest about what
it knows and doesn't.** Every other "AI gives you a number" site lies with
confidence. We don't.

---

## How it works

```
Identify → Categorize → Estimate → Cache → Present
```

1. **Identify** — Open Food Facts (barcode), Open Graph (URL), or LLM
   normalization (free text) → uniform `ResolvedProduct`.
2. **Categorize** — fast LLM classifies into one of our curated category
   templates. If no template fits, we show "category not supported yet" — we
   never invent a breakdown.
3. **Estimate** — smart LLM adjusts the category template numbers for this
   specific product, within strict ranges, returning a Zod-validated
   `ProductBreakdown`.
4. **Cache** — everything stored in SQLite; the second query for the same
   product is free.
5. **Present** — Next.js page with confidence dots, source-tier dots,
   country flags, ranges everywhere.

See [`AGENTS.md`](./AGENTS.md), [`prisma/schema.prisma`](./prisma/schema.prisma),
and [`lib/schemas.ts`](./lib/schemas.ts) for the data contract.

---

## Tech stack (boring on purpose)

- **Next.js 16** (App Router) + TypeScript + Tailwind v4 + `motion`
- **Prisma 6** + **Postgres** (local via Docker, prod via Neon free tier)
- **Deterministic compute** is the only path numbers ever take. **OpenAI** is
  optional fallback for free-text resolve/categorize and admin-only category
  drafting; **Ollama** supported for local dev. Set `LLM_PROVIDER=none` for a
  fully LLM-free deployment.
- **Vercel** for deploy. Free tier holds for v1.

Anti-stack: no Redis, no queues, no Docker, no separate API, no auth. Added
only when the pain is real.

---

## Run locally

```bash
# 1. Install
npm install

# 2. Local Postgres (Docker)
docker compose up -d

# 3. Configure (defaults point at the local Postgres above)
cp .env.example .env

# 4. Database
npx prisma migrate deploy
npm run db:seed
npm run ingest:cbic         # 39 HSN→GST rows
npm run ingest:wikidata     # ~65 brands

# 5. Run
npm run dev
# open http://localhost:3000
# Parle-G is pre-seeded at /p/parle-g-55g
```

Want fully LLM-free? Set `LLM_PROVIDER=none` in `.env` — no API keys needed for any user flow.

Deploy (Vercel + Neon): see [docs/DEPLOY.md](./docs/DEPLOY.md) for the 10-minute runbook.

---

## Repo layout

```
app/
  page.tsx               # search landing
  p/[slug]/page.tsx      # product breakdown page (the visual North Star)
  uncategorized/page.tsx # "we haven't researched this yet"
  feedback/page.tsx
  admin/page.tsx         # basic-auth gated
  about/page.tsx
  sources/page.tsx
  _components/           # client + server React components
  api/
    resolve/             # one-shot product resolution
    categorize/          # template assignment
    estimate/            # the main LLM call
    search/              # GET endpoint that drives the homepage form
    feedback/, vote/
lib/
  db.ts                  # Prisma client singleton
  schemas.ts             # Zod schemas — the data contract
  llm.ts                 # OpenAI / Ollama clients behind one interface
  llm-cost.ts            # USD pricing per model
  resolve.ts, categorize.ts, estimate.ts
  persist.ts             # idempotent Product + Breakdown upserts
  rate-limit.ts          # per-IP hourly + global daily caps
prisma/
  schema.prisma
  seed.ts
  seed-data/             # one file per category template + Parle-G hero
scripts/
  smoke-no-llm.ts        # pipeline smoke test (no API key needed)
middleware.ts            # basic auth for /admin
```

---

## Contributing

This is a civic-tech project. The most valuable contribution is **better
category templates** — see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the
template authoring process and source-tier guidelines.

Spotted a wrong number on the live site? Click "Send feedback" on the product
page; every report is read.

---

## License

MIT. See [`LICENSE`](./LICENSE).
