/**
 * Step-by-step live LLM check. Each step is a separate npm script so you can
 * stop after any one and inspect cost + output in /admin or via the LlmCall
 * rows below.
 *
 *   npm run test:categorize   ~$0.0001  (gpt-4o-mini, tiny prompt)
 *   npm run test:resolve      ~$0.0001  (gpt-4o-mini, tiny prompt)
 *   npm run test:estimate     ~$0.005-0.02 (gpt-4o, big template+JSON output)
 *
 * Each step prints token usage and the row(s) it just inserted into LlmCall.
 */
import { db } from "../lib/db";
import { resolveQuery } from "../lib/resolve";
import { categorize } from "../lib/categorize";
import { estimateBreakdown } from "../lib/estimate";
import { CategoryTemplateSchema } from "../lib/schemas";

const TEST_PRODUCT: {
  brand: string;
  name: string;
  variant: string;
  sourceUrls: string[];
} = {
  brand: "Britannia",
  name: "Marie Gold",
  variant: "250g",
  sourceUrls: [],
};

async function showLatestLlmRow() {
  const row = await db.llmCall.findFirst({ orderBy: { createdAt: "desc" } });
  if (!row) {
    console.log("  (no LlmCall rows yet)");
    return;
  }
  console.log(
    `  → ${row.endpoint} | ${row.model} | tokens ${row.inputTokens}/${row.outputTokens} | $${row.costUsd.toFixed(5)}`,
  );
}

async function runResolve() {
  console.log("\n[resolve] free-text query → ResolvedProduct");
  const r = await resolveQuery({ value: "Britannia Marie Gold 250g" });
  console.log("  brand:  ", r.brand);
  console.log("  name:   ", r.name);
  console.log("  variant:", r.variant);
  await showLatestLlmRow();
}

async function runCategorize() {
  console.log("\n[categorize] → category slug");
  const cat = await categorize({ ...TEST_PRODUCT });
  console.log("  slug:      ", cat.categorySlug);
  console.log("  hsn:       ", cat.hsnCode);
  console.log("  confidence:", cat.confidence);
  console.log("  reasoning: ", cat.reasoning);
  await showLatestLlmRow();
}

async function runEstimate() {
  console.log("\n[estimate] full breakdown via gpt-4o (more expensive)");
  const cat = await categorize({ ...TEST_PRODUCT });
  if (cat.categorySlug === "uncategorized") {
    console.log("  categorize said uncategorized — aborting estimate");
    return;
  }
  const cRow = await db.category.findUniqueOrThrow({
    where: { slug: cat.categorySlug },
  });
  const template = CategoryTemplateSchema.parse(JSON.parse(cRow.templateJson));
  const bd = await estimateBreakdown({
    product: { ...TEST_PRODUCT },
    template,
    hsnCode: cat.hsnCode || template.hsnCodes[0]!,
  });
  console.log("  Made in India:", bd.madeInIndiaScorePct + "%", bd.madeInIndiaRangePct);
  console.log("  components:   ", bd.components.length);
  console.log("  GST:          ", bd.gst.ratePct + "%", "HSN", bd.gst.hsnCode);
  console.log("  confidence:   ", bd.overall.confidence);
  console.log("  reasoning:    ", bd.overall.reasoning.slice(0, 200) + "…");
  await showLatestLlmRow();
}

async function totals() {
  const all = await db.llmCall.findMany({ orderBy: { createdAt: "desc" } });
  const total = all.reduce((s, r) => s + r.costUsd, 0);
  console.log(`\nTotal calls so far: ${all.length}  |  spend: $${total.toFixed(5)}`);
}

async function main() {
  const step = process.argv[2];
  switch (step) {
    case "resolve":
      await runResolve();
      break;
    case "categorize":
      await runCategorize();
      break;
    case "estimate":
      await runEstimate();
      break;
    default:
      console.error(
        "Usage: tsx scripts/test-live.ts <resolve|categorize|estimate>",
      );
      process.exit(2);
  }
  await totals();
}

main()
  .catch((e) => {
    console.error("FAIL:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
