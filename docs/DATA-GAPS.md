# Data Pipeline — gaps & the plan to close them

> The moat is the data. The data is all public + free. So the moat isn't secret
> data — it's **assembling, cross-checking, dating, and showing our work** on
> sources nobody bothers to wire together. Laborious, not hidden. That's the bet.

## The brutal truth

The pipeline *looks* sourced (tiers, citations) but most citations are
**decorative** — listed, never parsed. Most numbers are estimates wearing
data's clothes. This doc tracks turning each into either **sourced** or
**honestly-labelled-as-estimate**.

## Gaps, ranked

| # | Gap | Today | Free source | Status |
|---|---|---|---|---|
| 1 | Composition % | hand-typed by author | Open Food Facts ingredients | open |
| 2 | Cost buckets | plausible fiction | MCA filings (margins, ad spend) | open |
| 3 | Origin % | author's guess (our core claim) | DGCIS/DGFT customs | open |
| 4 | **Agmarknet dead** | ingested daily, used nowhere | already in DB | ✅ **closed** |
| 5 | No MRP | most products show no ₹ | Open Prices + pack | open |
| 6 | Brand→country shallow | misses sub-brands; conflates incorporation w/ profit flow | Wikidata + ownership + judgment | partial |
| 7 | No verification loop | nothing checks a number vs its source | LLM-read-source → validate | open |
| 8 | One template/category | Maaza = Frooti composition | per-product overlays (PRODUCT-MODEL) | open |
| 9 | Per-number provenance | only GST is dated | schema: {value, source, asOf, tier, kind} | open |
| 10 | CBIC is hand CSV | 45 rows typed | scrape real schedule | open |

## Deepest gap

**We don't measure our own accuracy.** No ground truth — can't say if Parle-G's
92% is right. Credibility is asserted, not earned. Need calibration anchors
(hand-verified products) + a published "within X%" number.

## Strategy (every number)

1. **Source it or label it.** Free source exists → wire it. None → mark
   `category-typical estimate`, never dress as data.
2. **Cross-check it.** LLM *reads* the cited source, extracts the number,
   deterministic-validates vs the template, flags drift. LLM reads, never guesses.

## Build order

1. ✅ **Close Agmarknet loop** — done. Raw materials that map to a mandi
   commodity (wheat, sugar, oils, rice…) now carry a dated Tier-1 wholesale
   price reference instead of a pure estimate. `lib/commodity.ts`.
2. **Open Food Facts ingredients** — barcode → real composition. Biggest single
   upgrade (invented recipe → read recipe).
3. **Per-number provenance schema** — foundational; everything hangs off it.
4. **Verification job** — LLM extract-from-source → validate → flag. The
   accuracy engine; the "no human reviewer" answer.
5. **MCA margins** — LLM-parse filings → real cost buckets per brand.
6. **DGCIS trade ingest** — real origin %. Hard portal; the origin moat.
7. **Calibration harness** — hand-verify ~10 products, measure + publish deviation.
8. Cleanup: CBIC real scrape, Open Prices MRP, GST cess.

## Notes

- Agmarknet anchor is an *input-commodity* reference (wheat grain, raw sugar) —
  not the finished-ingredient cost (there's a processing markup we don't model).
  Labelled as such on-page. Honest.
- Agmarknet refresh runs daily via GH Actions cron (needs `DATABASE_URL` secret).
