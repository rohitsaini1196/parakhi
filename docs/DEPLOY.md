# Deploy Parakhi

10-minute runbook. Production = **Vercel + Neon Postgres**.

## 1. Neon (Postgres) — 3 min

1. Sign up: <https://console.neon.tech> (GitHub login).
2. Create project `parakhi`. Recommended region: `aws-ap-south-1` (Mumbai).
3. Copy the **pooled** connection string from the dashboard:
   `postgresql://<user>:<password>@<host>-pooler.neon.tech/neondb?sslmode=require`

## 2. Vercel — 4 min

1. <https://vercel.com> → GitHub login → **Import** `rohitsaini1196/parakhi`.
2. Framework auto-detected as Next.js. Don't change build settings.
3. **Environment variables** (Settings → Environment Variables):

   | Key | Value |
   | --- | ----- |
   | `DATABASE_URL` | Neon pooled string |
   | `OPENAI_API_KEY` | optional — only if you want LLM fallback |
   | `LLM_PROVIDER` | `none` for $0 LLM, `openai` for fallback |
   | `LLM_MONTHLY_USD_CAP` | `20` (default) |
   | `DATA_GOV_IN_API_KEY` | for Agmarknet cron — free at <https://data.gov.in> |
   | `ADMIN_USER` / `ADMIN_PASS` | gate `/admin` |
   | `IP_HASH_SALT` | random string, rotate per env |

4. Click **Deploy**. First build ~2 min.

## 3. One-time DB bootstrap (locally, against Neon) — 3 min

```bash
export DATABASE_URL="<paste your Neon pooled string>"

npx prisma migrate deploy   # apply all migrations
npm run db:seed             # categories + Parle-G hero
npm run seed:catalog        # ~400 well-known products
npm run ingest:cbic         # HSN→GST rates from CBIC
npm run ingest:wikidata     # ~140 brand→parent→country entries
npm run ingest:agmarknet    # optional; needs DATA_GOV_IN_API_KEY
npm run recompute           # derive all breakdowns
```

Verify:
```sql
SELECT COUNT(*) FROM "Product";    -- expect ~400
SELECT COUNT(*) FROM "BrandIndex"; -- expect ~140
SELECT COUNT(*) FROM "HsnGstRate"; -- expect ~45
```

## 4. GitHub Actions secrets — 1 min

```bash
gh secret set DATABASE_URL --body "<Neon pooled URL>"
gh secret set DATA_GOV_IN_API_KEY --body "<key>"
```

5 workflows fire on schedule (Node 24):
- `ingest-agmarknet` daily — commodity prices
- `ingest-cbic` weekly — HSN→GST rates
- `ingest-wikidata` monthly — brand registry
- `enrich-off` weekly — Open Food Facts label enrichment
- `recompute` nightly + on template push — re-derives breakdowns

## 5. Verify

- `/` — homepage with 400+ products
- `/p/parle-g-55g` — hero product renders
- `/browse` — full product grid with category filter
- `/sitemap.xml` — 400+ URLs for Google
- `/api/search?q=Maggi` → 302 → `/p/maggi-...`
- `/admin` → prompts for basic auth

## 6. Domain

Point your domain's A record to `76.76.21.21` (Vercel). Add domain in Vercel → Settings → Domains. SSL auto-provisions in ~5 min.

## 7. Search Console

Submit `https://parakhi.in/sitemap.xml` to [Google Search Console](https://search.google.com/search-console).

---

## Local development

```bash
docker compose up -d                   # local Postgres on :5432
cp .env.example .env                   # default DATABASE_URL works as-is
npx prisma migrate deploy
npm run db:seed
npm run dev
```

## Env reference

| Key | Required | Default | Notes |
| --- | -------- | ------- | ----- |
| `DATABASE_URL` | yes | — | Postgres connection string |
| `OPENAI_API_KEY` | only if `LLM_PROVIDER=openai` | — | |
| `LLM_PROVIDER` | no | `openai` | `none` = fully deterministic, $0 LLM |
| `LLM_MODEL_FAST` | no | `gpt-4o-mini` | resolve + categorize fallback |
| `LLM_MODEL_SMART` | no | `gpt-4o` | category-draft generator |
| `LLM_MONTHLY_USD_CAP` | no | `20` | circuit breaker; set 0 to disable |
| `DATA_GOV_IN_API_KEY` | for agmarknet | — | free key from data.gov.in |
| `RATE_LIMIT_PER_IP_PER_HOUR` | no | `10` | |
| `RATE_LIMIT_GLOBAL_PER_DAY` | no | `500` | |
| `ADMIN_USER` / `ADMIN_PASS` | recommended | unset = 401 | basic-auth gate for `/admin` |
| `IP_HASH_SALT` | recommended | `parakhi-v1` | vote dedupe salt |
| `GEMINI_API_KEY` | optional | — | set `LLM_PROVIDER=gemini` to activate |

## Pre-launch checklist

- [ ] `npm run build` clean
- [ ] DB migrated, seeded, recomputed
- [ ] `/p/parle-g-55g` renders with breakdown
- [ ] `/sitemap.xml` returns 400+ URLs
- [ ] `ADMIN_USER`/`ADMIN_PASS` set
- [ ] GitHub Actions secrets set
- [ ] Search Console sitemap submitted
