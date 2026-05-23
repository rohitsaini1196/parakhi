# Deploy Parakhi

10-minute runbook. Production = **Vercel + Neon Postgres**. Both free tier.

## 1. Neon (Postgres) — 3 min

1. Sign up: <https://console.neon.tech> (GitHub login).
2. Create project `parakhi`. Default region `aws-ap-south-1` (Mumbai).
3. Copy the **pooled** connection string from the dashboard. Looks like:
   `postgresql://<user>:<password>@<host>-pooler.neon.tech/parakhi?sslmode=require`

## 2. Vercel — 4 min

1. <https://vercel.com> → GitHub login → **Import** `rohitsaini1196/parakhi`.
2. Framework auto-detected as Next.js. Don't change build settings.
3. **Environment variables** (Settings → Environment Variables):

   | Key | Value |
   | --- | ----- |
   | `DATABASE_URL` | Neon pooled string |
   | `OPENAI_API_KEY` | optional — only if you want LLM fallback on resolve/categorize misses |
   | `LLM_PROVIDER` | `none` for free, `openai` for fallback |
   | `LLM_MONTHLY_USD_CAP` | `20` (default; raise if you want headroom) |
   | `DATA_GOV_IN_API_KEY` | for Agmarknet cron — get one free at <https://data.gov.in> |
   | `ADMIN_USER` / `ADMIN_PASS` | gate `/admin` |
   | `IP_HASH_SALT` | random string, rotate per env |

4. Click **Deploy**. First build ~2 min.

## 3. One-time DB bootstrap (locally, against Neon) — 3 min

```bash
export DATABASE_URL="<paste your Neon pooled string>"

npx prisma migrate deploy   # apply all migrations
npm run db:seed             # categories + Parle-G hero
npm run ingest:cbic         # 39 HSN→GST rows
npm run ingest:wikidata     # 66 brands
# npm run ingest:agmarknet  # optional; needs DATA_GOV_IN_API_KEY
```

Verify in Neon SQL editor:
```sql
SELECT COUNT(*) FROM "Category";   -- expect 7
SELECT COUNT(*) FROM "BrandIndex"; -- expect ~65
SELECT COUNT(*) FROM "HsnGstRate"; -- expect 39
```

## 4. GitHub Actions secrets (for autonomous cron) — 1 min

```bash
gh secret set DATABASE_URL --body "<Neon pooled URL>"
gh secret set DATA_GOV_IN_API_KEY --body "<key>"
```

Workflows fire on schedule:
- `ingest-agmarknet` daily — commodity prices
- `ingest-cbic` weekly — HSN→GST
- `ingest-wikidata` monthly — brands
- `recompute` nightly + on template push — re-derives breakdowns, commits score-delta alerts to `data/alerts/`

## 5. Verify the deploy

- `https://<your-vercel-url>/` — landing
- `/p/parle-g-55g` — Parle-G hero renders
- `/api/search?q=Maggi+noodles+70g` → 302 → `/p/maggi-noodles-70g`
- `/admin` prompts for basic auth → enter `ADMIN_USER`/`ADMIN_PASS`

## 6. Domain

`parakhi.in` already secured. Vercel → Settings → Domains → add → follow DNS instructions. ~10 min for SSL.

---

## Local development

```bash
docker compose up -d                   # local Postgres on :5432
cp .env.example .env                   # default DATABASE_URL works as-is
npx prisma migrate deploy
npm run db:seed
npm run ingest:cbic
npm run ingest:wikidata
npm run dev
```

Wipe local DB: `docker compose down -v && docker compose up -d`.

## Env reference

| Key | Required | Default | Notes |
| --- | -------- | ------- | ----- |
| `DATABASE_URL` | yes | — | Postgres connection string |
| `OPENAI_API_KEY` | only if LLM_PROVIDER=openai | — | |
| `LLM_PROVIDER` | no | `openai` | `none` = fully deterministic, $0 LLM |
| `LLM_MODEL_FAST` | no | `gpt-4o-mini` | resolve + categorize fallback |
| `LLM_MODEL_SMART` | no | `gpt-4o` | category-draft generator |
| `LLM_MONTHLY_USD_CAP` | no | `20` | circuit breaker; set 0 to disable |
| `DATA_GOV_IN_API_KEY` | for agmarknet | — | free key from data.gov.in profile |
| `RATE_LIMIT_PER_IP_PER_HOUR` | no | `10` | |
| `RATE_LIMIT_GLOBAL_PER_DAY` | no | `500` | global bill ceiling |
| `ADMIN_USER` / `ADMIN_PASS` | recommended | unset = `/admin` 401 | basic-auth gate |
| `IP_HASH_SALT` | recommended | `parakhi-v1` | vote dedupe salt; rotate per env |

## Pre-launch checklist

- [ ] `npm run build` clean
- [ ] DB migrated + seeded; `/p/parle-g-55g` renders
- [ ] CBIC + Wikidata ingested (Category/HsnGstRate/BrandIndex non-empty)
- [ ] `ADMIN_USER`/`ADMIN_PASS` set; `/admin` works
- [ ] `LLM_MONTHLY_USD_CAP` set if `LLM_PROVIDER=openai`
- [ ] GH Actions secrets set if you want cron persistence
- [ ] Manual test: search 5 real products across categories
