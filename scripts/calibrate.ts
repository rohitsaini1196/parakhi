/**
 * Calibration harness — the honest test of whether our numbers are right.
 *
 *   npm run calibrate
 *
 * Three checks, free + deterministic:
 *   1. GST exactness — every product's stored rate vs the CBIC schedule for its
 *      HSN. We should be 100% here; any miss is a real bug.
 *   2. Label overlap — for products with an Open Food Facts label, how many of
 *      our template raw materials are confirmed on the label, and how many we
 *      claim that the label does NOT list (possible over-claim).
 *   3. Anchor deviation — for hand-verified anchors, is computed IVC inside the
 *      expected range, and are the must-contain materials present.
 *
 * Prints a scorecard. This is the instrument that turns "trust us" into a
 * measured number we can publish.
 */
import { db } from "../lib/db";
import { lookupGstRate } from "../lib/gst-lookup";
import { GstInfoSchema, CostComponentSchema } from "../lib/schemas";
import { z } from "zod";
import { ANCHORS } from "../calibration/anchors";

const GENERIC = new Set(["oil", "powder", "syrup", "extract", "other", "added", "based", "mixed", "agents", "regulators", "flavour", "colour", "preservatives", "emulsifiers"]);
function materialTokens(name: string): string[] {
  return name.toLowerCase().replace(/[()/,]/g, " ").split(/\s+/).filter((t) => t.length >= 3 && !GENERIC.has(t));
}
function onLabel(name: string, declared: string[]): boolean {
  const toks = materialTokens(name);
  return toks.length > 0 && declared.some((d) => toks.some((t) => d.includes(t)));
}

async function main() {
  const products = await db.product.findMany({
    include: { breakdown: true },
  });
  const withBreakdown = products.filter((p) => p.breakdown);

  // ── 1. GST exactness ──
  let gstChecked = 0;
  let gstMismatch = 0;
  const gstFails: string[] = [];
  for (const p of withBreakdown) {
    const gst = GstInfoSchema.parse(JSON.parse(p.breakdown!.gstJson));
    const hsn = gst.hsnCode || p.hsnCode || "";
    if (!hsn) continue;
    const looked = await lookupGstRate(hsn, { ratePct: gst.ratePct });
    gstChecked++;
    if (looked.source === "cbic" && Math.abs(looked.ratePct - gst.ratePct) > 0.01) {
      gstMismatch++;
      gstFails.push(`${p.slug}: stored ${gst.ratePct}% vs CBIC ${looked.ratePct}%`);
    }
  }

  // ── 2. Label overlap ──
  let labelled = 0;
  let totalRm = 0;
  let confirmedRm = 0;
  let orphanRm = 0; // template material NOT on the label
  for (const p of withBreakdown) {
    if (!p.declaredIngredients) continue;
    const declared = (JSON.parse(p.declaredIngredients) as string[]).map((s) => s.toLowerCase());
    if (declared.length < 3) continue;
    const comps = z.array(CostComponentSchema).parse(JSON.parse(p.breakdown!.componentsJson));
    // Skip variant-conditional materials (sharePct.low === 0 signals optional)
    const rm = comps.filter((c) =>
      c.confirmedOnLabel !== undefined &&
      c.rangePct.low > 0
    );
    labelled++;
    for (const c of rm) {
      totalRm++;
      if (onLabel(c.label, declared)) confirmedRm++;
      else orphanRm++;
    }
  }

  // ── 3. Anchor deviation ──
  const anchorResults: { slug: string; ok: boolean; detail: string }[] = [];
  for (const a of ANCHORS) {
    const p = withBreakdown.find((x) => x.slug === a.slug);
    if (!p) {
      anchorResults.push({ slug: a.slug, ok: false, detail: "not in DB" });
      continue;
    }
    const ivc = p.breakdown!.madeInIndiaScoreBp / 100;
    const issues: string[] = [];
    if (a.ivc) {
      const [lo, hi] = a.ivc;
      if (ivc < lo || ivc > hi) issues.push(`IVC ${ivc}% outside [${lo},${hi}]`);
    }
    if (a.mustContain) {
      const comps = z.array(CostComponentSchema).parse(JSON.parse(p.breakdown!.componentsJson));
      const labels = comps.map((c) => c.label.toLowerCase()).join(" ");
      for (const m of a.mustContain) {
        if (!labels.includes(m)) issues.push(`missing "${m}"`);
      }
    }
    anchorResults.push({
      slug: a.slug,
      ok: issues.length === 0,
      detail: issues.length === 0 ? `IVC ${ivc}% ✓` : issues.join("; "),
    });
  }

  // ── Scorecard ──
  const anchorsPass = anchorResults.filter((r) => r.ok).length;
  console.log("\n═══ CALIBRATION SCORECARD ═══\n");
  console.log(`Products with breakdowns: ${withBreakdown.length}\n`);

  console.log("1. GST exactness (vs CBIC schedule)");
  console.log(`   ${gstChecked - gstMismatch}/${gstChecked} correct${gstMismatch ? ` — ${gstMismatch} MISMATCH` : " ✓"}`);
  gstFails.slice(0, 10).forEach((f) => console.log(`     ✗ ${f}`));

  console.log("\n2. Label overlap (products with OFF label)");
  console.log(`   ${labelled} products labelled`);
  console.log(`   ${confirmedRm}/${totalRm} template materials confirmed on label (${totalRm ? Math.round((confirmedRm / totalRm) * 100) : 0}%)`);
  console.log(`   ${orphanRm} materials we list that the label does NOT — possible over-claim to review`);

  console.log("\n3. Anchor deviation (hand-verified truth)");
  console.log(`   ${anchorsPass}/${ANCHORS.length} anchors within expected range`);
  anchorResults.forEach((r) => console.log(`     ${r.ok ? "✓" : "✗"} ${r.slug.padEnd(34)} ${r.detail}`));

  console.log("\n═══ HEADLINE ═══");
  console.log(`GST: ${gstChecked ? Math.round(((gstChecked - gstMismatch) / gstChecked) * 100) : 0}% exact · ` +
    `Label match: ${totalRm ? Math.round((confirmedRm / totalRm) * 100) : 0}% · ` +
    `Anchors: ${anchorsPass}/${ANCHORS.length} pass`);
  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
