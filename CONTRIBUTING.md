# Contributing

Thank you for considering a contribution. The single most useful thing you can
help with is **improving our data**: either correcting a number on the live
site, or authoring a new category template.

## Reporting a wrong number

1. Open the product page (`/p/<slug>`).
2. Click **Send feedback** at the bottom.
3. Tell us what number looks off and link a source if you have one.

Every report is read by a human. We re-estimate when the template version
changes or when feedback warrants it.

## Authoring a new category template

A template is the single source of truth for a category. It encodes typical
cost ranges, raw-material composition, and likely import origins. The LLM
then adjusts these numbers per product within strict bounds.

A good template:

- has 4–7 raw materials, each with a `sharePct` range and `typicalOrigin`
  probabilities
- has GST rate sourced from a CBIC notification (cite the date)
- has a `madeInIndiaBand` that captures the realistic floor/ceiling for the
  category
- has 3–5 sources, each labeled with the specific number it backs
- has an `llmGuidance` paragraph that tells the model what to push higher or
  lower for sub-variants

### Process

1. Add a new file at `prisma/seed-data/<category-slug>.ts`. Use any existing
   template as a starting point.
2. Import it in `prisma/seed.ts` and add it to the `CATEGORIES` array.
3. Run `npm run db:seed`.
4. Open a PR. Mark `templateVersion` as `0.1.0-draft` until reviewed by a
   maintainer.

### Source tiers

Every number must land in one of these tiers. The dot color on the live site
matches the tier.

| Tier | Color | What it means |
| ---- | ----- | ------------- |
| 1 | 🟢 emerald | Hard data — HSN/GST schedules, government commodity prices, RoC filings |
| 2 | 🟢 light emerald | Structured open data — Open Food Facts, public industry reports |
| 3 | 🟡 amber | Public web — brand websites, news, annual reports |
| 4 | 🟠 orange | LLM reasoning, always shown with ranges |

If you can't cite a source at Tier 1–3, the number must be tagged Tier 4 and
shown with a range. We don't have a "trust me" tier.

## Code style

- Match the surrounding code's tone — terse, no over-abstracted layers.
- No `any`. No silent error swallowing. No hidden coercion of LLM output.
- Boring beats clever. If a feature can be a static seed file or a SQL query,
  it shouldn't be a microservice.
- Run `npm run build` before committing — TypeScript errors break the build.

## What we won't merge

- Features that erode the credibility moat (point estimates without ranges,
  hidden confidence, invented breakdowns for uncategorized products).
- Telemetry / tracking beyond the existing rate-limit hash.
- Ads. Ever.
