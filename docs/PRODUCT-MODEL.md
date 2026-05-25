# Product Identity & Differentiation — pipeline workstream

> Parakhi analyses a **product**, not a category. Today it mostly doesn't.
> This is the plan to fix that, inside the data pipeline.

---

## The problem (observed)

Search "mango drink" → page titled **"Mango Drink · Packaged Juice · 600ml"**.
Questions a user immediately asks, that we can't answer:
- **Which** mango drink? Maaza / Slice / Frooti? (different owners → different IVC)
- **Which pack?** 100ml / 600ml / 1L? (different ₹, same %)

Root cause: a product's breakdown = its **category template**, with only **one**
per-product signal applied (brand → parent country). So Maaza and Frooti render
near-identical breakdowns except the brand-profit flag. We're doing **category
analysis wearing a product label.**

Two defects:
1. **Identity** — headline showed the product *name* and dropped the *brand*.
   (Quick-fixed: title is now brand-forward + deduped.)
2. **Differentiation** — no product-specific data beyond brand origin.

---

## What a "product" actually is

```
Product = Brand  +  Product line       +  Variant/pack
          Maaza     Mango Drink            600ml PET
          (owner →  (recipe class →        (MRP, ₹ math,
           who         composition          pack material)
           profits)    signal)
```

Identity key = (brand, line, variant). Slug must encode all three. Two packs of
the same drink are **two products** (same %, different ₹) — that's correct, but
they must be labelled unambiguously, not collapsed to "Mango Drink".

---

## Differentiation layers (what makes Maaza ≠ Frooti)

Ordered by how much signal we can get **for free, deterministically**:

| Layer | Maaza vs Frooti differs? | Source (free) | Have it? |
|---|---|---|---|
| **Brand → owner country** (brand profit) | ✅ yes (US vs IN) | Wikidata | ✅ |
| **Pack → MRP, ₹ amounts, pack material** | ✅ yes | Open Prices / user / pack | partial |
| **Declared ingredients** (real recipe) | ✅ yes | Open Food Facts (barcode) | not wired |
| **Brand-specific cost structure** (premium vs value) | ✅ yes | company filings (MCA, free) | manual |
| **Category template** (fallback when above unknown) | ❌ shared | author + sources | ✅ |

The honest model: **start from the category template, then overlay every
product-specific signal we can source.** State clearly which numbers are
product-specific vs category-typical. That labelling *is* the credibility.

---

## Plan — inside the data pipeline

### Phase 1 — Identity (mostly done + small)
- [x] Brand-forward, deduped title (`productTitle`).
- [ ] Show **brand as its own field** in the hero (eyebrow "MAAZA") + line as
      headline + pack as sub. No ambiguity.
- [ ] Slug always = brand-line-variant; never create a variant-less product
      from a bare query (force a pack or mark "pack unknown").
- [ ] Product-identity dedup pass (kill variant-null duplicates).

### Phase 2 — Disambiguation at search
- [ ] "mango drink" → list the **branded products** in that category (Maaza,
      Slice, Frooti) as distinct results, not one generic.
- [ ] When a query is category-only (no brand), don't fabricate a product —
      route to a **category view** ("mango drinks we've analysed") or ask which
      brand. (Reinforces: we analyse products, not categories.)

### Phase 3 — Per-product overlays (the real fix, free + deterministic)
- [ ] **Open Food Facts ingredients**: barcode/known SKU → declared ingredient
      list + percentages → product-specific composition (replaces template
      composition where available). This is the biggest free signal.
- [ ] **Pack model**: MRP + pack size → ₹ per component; pack material
      (PET/can/tetra/foil) → packaging origin + share. Pack drives real diffs.
- [ ] **Brand cost overlay**: where a brand's MCA filing gives margins, override
      the category cost bands for that brand's products.
- [ ] **Provenance per number**: tag each as `product-specific | brand-specific
      | category-typical` + its tier. UI shows the mix honestly.

### Phase 4 — LLM-assisted extraction (no invented numbers)
- [ ] LLM **extracts** structured facts from cited free sources (OFF ingredient
      text, MCA PDFs, pack declarations) → deterministic validate → store with
      source. LLM never *guesses* a number; it only *reads* one we can cite.
- [ ] LLM **review** pass: cross-check a product's overlay against its sources,
      flag contradictions for the queue. (This is the "no human reviewer" answer.)

---

## Schema implications

- `Product`: add `productLine` (vs `name`), make `variant`/pack first-class,
  `barcode` drives OFF lookup, `mrpInPaise` + `mrpSource`.
- New `ProductOverlay` (or fields on `Breakdown`): per-product composition +
  cost overrides + their sources + provenance tags, layered over the template.
- `Breakdown.componentProvenance`: per-component `{ source, tier, kind }`.

## UI implications

- Hero: brand (eyebrow) + line (headline) + pack (sub) — unambiguous.
- Fold 4: "What's product-specific vs category-typical here" — honest split.
- Draft/category-typical badge until a product has real overlays.

## Honesty stance (the line we hold)

> For a product we haven't pulled label/pack/filing data for, we say so:
> *"Composition is category-typical for [category]; brand origin and pack are
> product-specific."* We never imply a per-SKU recipe we don't have.

---

## Sequencing vs current sprint

- **Now (cheap):** Phase 1 finish (brand hero, dedup) + the title fix (done).
- **Next:** Phase 2 disambiguation (pairs naturally with Compare + Search work).
- **Then (the moat):** Phase 3 OFF ingredients + pack model — biggest free
  differentiation, deterministic.
- **Later:** Phase 4 LLM extraction/review — the "solve data ourselves" bet.

## Future: MCP surface (noted, not now)

Once product identity + overlays are solid, expose Parakhi as an **MCP server** —
AI agents query "where does the money go for <product>" and get the structured,
sourced breakdown. The clean product-identity model is a prerequisite.
