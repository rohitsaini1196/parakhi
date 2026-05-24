# Parakhi — Design Brief

_For the designer. Everything you need to design the product from scratch._

---

## 1. What Parakhi is

Parakhi (Hindi: *parakh* = "to assay / test the purity of a coin") answers one
question about everyday Indian products:

> **"When I buy this, where does my money actually go — and how much stays in India?"**

You search a product (Parle-G, Maggi, Diet Coke, Surf Excel…) and get back a
breakdown: how much of the price is Indian value, how much is tax, how much
flies abroad — every number backed by a real source, with honest confidence
levels.

Tagline: **"Kya hai andar?"** ("What's inside?")

It is a civic-tech, open-source project. Not a startup, not a store. Think
public-interest data tool with the polish of a consumer app.

---

## 2. Philosophy (please internalize — it drives every design choice)

1. **Honesty is the whole product.** Every other "AI tells you a number" site
   lies with confidence. We don't. Every number shows its confidence and its
   source. If we don't know, we say so. The design must *feel* trustworthy,
   never slick-but-shady.

2. **We help people ask better questions, not deliver verdicts.** "Diet Coke is
   80% Indian" isn't an attack on Coke. It's "₹10 of your ₹50 went abroad —
   did you know?" Tone is curious, not accusatory.

3. **Show less, mean more.** We have a LOT of data. The instinct to show it all
   is the enemy. Default view = one number, one truth. Depth on demand.

4. **The methodology is the moat.** Numbers improve over time; the promise is
   that they're always inspectable. Design should make "how we know this"
   feel like a feature, not fine print.

5. **Refuse to fake it.** If a product's category isn't researched yet, we show
   an honest "not yet" — never a guessed number. Design this dead-end with
   dignity, not apology.

---

## 3. North Star

> **One product. One number. One truth you didn't know.**
> **Five seconds to "wait, what?" — then they share it.**

Success = a real person, who doesn't know us, screenshots a Parakhi result and
sends it to a friend because it surprised them. Every screen serves that
moment.

---

## 4. Who uses it

| User | Wants | Time | % |
|------|-------|------|---|
| **The sharer** (primary) | A verdict + one surprising fact, something screenshot-worthy | 5 sec | ~95% |
| **The skeptic / journalist** | The receipts — sources, confidence, full breakdown | 5 min | ~5%, but they amplify |

Design must nail the sharer in the first screen, and let the skeptic dig
without cluttering the sharer's view.

---

## 5. The data you're designing around

Every analyzed product has:

- **Indian Value Capture (IVC)** — the headline %. Share of the price (MRP)
  that flows to Indian sources. e.g. 84%.
- **A verdict word** — derived from IVC: "Almost all Indian" / "Mostly Indian"
  / "Largely Indian" / "Half imported" / "Largely imported" / "Barely Indian".
- **The money split** — three buckets that sum to the price:
  - 🇮🇳 **India** (raw materials, labor, retail, Indian brand profit)
  - 🏛️ **Tax** (GST — goes to the government)
  - 🌍 **Abroad** (imported ingredients, foreign brand royalty)
- **Cost components** — itemized: e.g. wheat 17%, palm oil 8%, packaging 8%,
  retailer margin 18%, GST 5%… each with a % and (if known) a ₹ amount.
- **Imports** — which inputs are foreign + likely countries, with flags +
  probabilities. e.g. "Palm oil → Indonesia 45%, Malaysia 45%."
- **Confidence** — every number is high / medium / low.
- **Source tier** — every number is Tier 1 (hard gov data) → Tier 4 (estimate).
- **Composition score** — secondary metric (how Indian by physical content).
- **MRP** — sometimes known, often not (design for both).
- **Hero products** (e.g. Parle-G) — have a long-form hand-written story +
  extras like a shrinkflation timeline.

### Example product (Diet Coke 330ml)
- IVC 80% · "Mostly Indian"
- India ₹ majority · Tax 40% (sin-good) · Abroad: aluminium can from UAE,
  syrup royalty to USA, sweetener from China
- The "catch": _the can flies in from the Middle East, the brand value flows to
  Atlanta_

### Example (Parle-G 55g, hero)
- IVC 92% · "Almost all Indian" · the imported bit is palm oil (13% of the
  biscuit, from Indonesia/Malaysia) · + a shrinkflation story (₹/100g doubled
  1994→2025 while the sticker price barely moved)

---

## 6. The screens

### a) Product page `/p/[slug]` — THE core screen

Reimagine as a **single scrolling story**, each section answering one question.
Not a dashboard.

```
FOLD 1 — the gut punch (full viewport)
   tiny product name
   ONE huge number: the IVC %  (animates 0 → 84 on load)
   the verdict word
   the money split, drawn live as a bar / filling shape
   ↓ scroll cue

FOLD 2 — "where does it go?"
   the cost breakdown, visual-first
   each slice explorable on hover/tap → ingredient, origin, ₹

FOLD 3 — "the catch" (only if there's a foreign story)
   the imported bits, with country flags, one line each

FOLD 4 — "how we know" (receipts)
   sources, confidence, methodology — collapsed/quiet by default
   this is the trust layer; make it feel solid, not buried

(hero products only) — the long-form story below
```

### b) Homepage `/`

Search-first. No marketing copy, no nav bar.
- Wordmark + tagline
- One search input (with type-ahead suggestions)
- A live "recently analyzed" ticker (products + their IVC, moving) — doubles as
  social proof + discovery
- Optional: one rotating editorial pick ("the most foreign thing in your kitchen")

### c) Honest dead-end `/uncategorized`

When we haven't researched a category. Must feel **principled, not broken**.
"We could guess. We'd rather be honest." + a way to vote/request it.

### d) Category leaderboard `/c/[slug]` (proposed — high virality)

Rank brands within a category by IVC. "The most Indian biscuit," "most foreign
soft drink." Inherently shareable + browseable.

### e) About / manifesto `/about`

The honesty promise + how the methodology works. The credibility page.

---

## 7. The signature moment (what we want people to screenshot)

We want ONE iconic visual. Current idea (open to your interpretation):

**A ₹ note that fills.** An outline of a rupee note fills left→right on load —
green (India) flooding most of it, a gold sliver (tax), a red tail (abroad)
with tiny country flags drifting off the red. Combined with the big % and the
verdict word, this is the share artifact — and the auto-generated social
preview image when a link is shared on WhatsApp/Twitter.

You may have a better idea. The brief: **one bold, legible, emotionally
instant visual that encodes "where my money went."**

---

## 8. Visual language (direction, not gospel)

- **Modern, minimal, "AI-era."** Dark, near-black, warm (not cold blue).
- **Very little text.** Numbers and one-liners do the talking.
- **Serif for the numbers + verdict** (editorial gravity); clean sans for body.
- **Exactly three semantic colors:** India (green), Tax (gold), Abroad (coral).
  Nothing else gets color. The discipline reads as credibility.
- **Flags are the only iconography.** No icon-library clutter.
- **Generous negative space.** Let the number breathe.
- Mobile-first — most shares happen on phones.

## 9. Motion language

- **Interactive, not decorative.** Motion responds to scroll + hover, doesn't
  autoplay everywhere.
- **One signature animation** (the note fill / number count-up). Everything else
  subtle (≤8px slides, soft fades).
- **Spring physics, never linear.**
- Respect `prefers-reduced-motion` — instant states for those who opt out.
- Hover/tap reveals detail — hide data until asked (progressive disclosure).

---

## 10. Hard constraints (engineering reality)

- Built in **Next.js (App Router) + Tailwind + Framer Motion**. Designs should
  be buildable in that stack — favor CSS/SVG/transform animation over heavy
  video/canvas.
- **Mobile-first**, works down to 360px width. The rupee bar must survive many
  tiny "abroad" segments on a narrow screen.
- **Dark theme is the default** (and currently the only theme). Light theme
  optional/later.
- Deployed on Vercel; share-preview (OG) images auto-generated per product —
  design one OG template too (1200×630).
- Accessibility: legible contrast, keyboard-navigable, reduced-motion path.

---

## 11. What exists today (for reference, NOT to copy)

A working v1 is live at **https://parakhi.vercel.app** — try
`/p/parle-g-55g`, `/p/coca-cola-diet-coke-330ml`. It's functional but reads as
a *dashboard*: stat cards + a bar + an accordion, everything in one viewport.
We want to move to the **scroll-story** model above. Use the live site only to
understand the data; don't anchor on its layout.

---

## 12. Deliverables we're hoping for

1. **Product page** `/p/[slug]` — the 4-fold scroll story, mobile + desktop.
2. **The signature visual** — the money-split hero (note-fill or your concept),
   including its animated states.
3. **Homepage** — search + ticker.
4. **Uncategorized** dead-end screen.
5. **OG share-image** template (1200×630, auto-filled per product).
6. **Visual system** — type scale, the 3 colors, spacing, the flag treatment,
   confidence/source-tier indicators.
7. _(Nice to have)_ Category leaderboard `/c/[slug]`.

Figma or similar. Component-minded (we'll build them as React components).

---

## 13. The one-line test for every design decision

> Does this make a stranger more likely to screenshot it and say
> _"I had no idea"_ — while still feeling like we're telling the truth?

If yes, ship it. If it's flashy but erodes trust, cut it.
