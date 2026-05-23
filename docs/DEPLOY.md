# Deploying

## Vercel — production caveat

The default dev setup uses **SQLite at `prisma/dev.db`**, which is great for
local dev but **does not work on Vercel** out of the box: serverless functions
have an ephemeral, read-only filesystem.

You have two paths:

### Path A — Switch to Postgres (recommended for launch)

Use a free hosted Postgres (Neon, Supabase, or Vercel Postgres). All three have
generous free tiers; Neon is the boringest fit.

1. Create a database, copy its connection string.
2. In `prisma/schema.prisma`, change the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set `DATABASE_URL` in Vercel env vars to the Postgres connection string.
4. Run `npx prisma migrate deploy` from CI (or locally pointed at prod) to
   apply migrations.
5. Run `npm run db:seed` once to populate categories and Parle-G hero.

No app code changes are needed — Prisma's query API is identical between
SQLite and Postgres for everything we use.

### Path B — Keep SQLite, deploy on a long-lived host

Render, Railway, or Fly.io will give you a persistent disk. SQLite continues
to work. This is fine for the soft-launch phase if you want zero migration
work; revisit when you outgrow it.

## Required environment variables

| Key | Required | Notes |
| --- | -------- | ----- |
| `DATABASE_URL` | yes | `file:./dev.db` locally, Postgres URL in prod |
| `OPENAI_API_KEY` | yes | only if `LLM_PROVIDER=openai` (default) |
| `LLM_PROVIDER` | no | `openai` (default) or `ollama` |
| `LLM_MODEL_FAST` | no | default `gpt-4o-mini` |
| `LLM_MODEL_SMART` | no | default `gpt-4o` |
| `RATE_LIMIT_PER_IP_PER_HOUR` | no | default `10` |
| `RATE_LIMIT_GLOBAL_PER_DAY` | no | default `500` (raises bill ceiling) |
| `ADMIN_USER` / `ADMIN_PASS` | recommended | gate the `/admin` page |
| `IP_HASH_SALT` | recommended | rotate per environment |

## Pre-launch checklist

- [ ] `npm run build` clean
- [ ] `OPENAI_API_KEY` set in prod env
- [ ] DB migrated and seeded (categories + Parle-G hero visible at
      `/p/parle-g-55g`)
- [ ] `ADMIN_USER` / `ADMIN_PASS` set; visiting `/admin` prompts for auth
- [ ] `RATE_LIMIT_GLOBAL_PER_DAY` set to a value you're comfortable being
      billed for if the site goes viral
- [ ] Manual sanity test with 5 real products across different categories
- [ ] LICENSE, README, CONTRIBUTING present
- [ ] GitHub repo public

## Domain

`parakhi.in`
