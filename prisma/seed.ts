import { PrismaClient } from "@prisma/client";
import { productSlug } from "../lib/slug";
import type { CategoryTemplate } from "../lib/schemas";

import { PACKAGED_BISCUITS_TEMPLATE } from "./seed-data/packaged-biscuits";
import { DETERGENT_POWDER_TEMPLATE } from "./seed-data/detergent-powder";
import { INSTANT_NOODLES_TEMPLATE } from "./seed-data/instant-noodles";
import { BOTTLED_WATER_TEMPLATE } from "./seed-data/bottled-water";
import { BAR_SOAP_TEMPLATE } from "./seed-data/bar-soap";
import { PACKAGED_MILK_TEMPLATE } from "./seed-data/packaged-milk";
import { CARBONATED_SOFT_DRINKS_TEMPLATE } from "./seed-data/carbonated-soft-drinks";
import {
  PARLE_G_BREAKDOWN,
  PARLE_G_HERO_MARKDOWN,
} from "./seed-data/parle-g";

const db = new PrismaClient();

function pctToBp(n: number) {
  return Math.round(n * 100);
}

const CATEGORIES: CategoryTemplate[] = [
  PACKAGED_BISCUITS_TEMPLATE,
  DETERGENT_POWDER_TEMPLATE,
  INSTANT_NOODLES_TEMPLATE,
  BOTTLED_WATER_TEMPLATE,
  BAR_SOAP_TEMPLATE,
  PACKAGED_MILK_TEMPLATE,
  CARBONATED_SOFT_DRINKS_TEMPLATE,
];

async function seedCategories() {
  for (const t of CATEGORIES) {
    const data = {
      displayName: t.displayName,
      hsnCodes: JSON.stringify(t.hsnCodes),
      keywords: JSON.stringify((t.keywords ?? []).map((k) => k.toLowerCase())),
      defaultGstRate: t.defaultGstRate,
      templateJson: JSON.stringify(t),
      sourcesJson: JSON.stringify(t.sources),
    };
    await db.category.upsert({
      where: { slug: t.slug },
      update: data,
      create: { slug: t.slug, ...data },
    });
    console.log(`  ✓ category ${t.slug} (v${t.templateVersion})`);
  }
}

async function seedHeroParleG() {
  const slug = productSlug("Parle", "G", "55g");
  const productData = {
    slug,
    brand: "Parle Products",
    name: "Parle-G Original Glucose Biscuits",
    variant: "55g pack",
    barcode: "8901719128462",
    hsnCode: "19053100",
    categorySlug: PACKAGED_BISCUITS_TEMPLATE.slug,
    mrpInPaise: 445,
    mrpLastSeenAt: new Date("2025-09-22"),
    isHeroProduct: true,
    heroMarkdown: PARLE_G_HERO_MARKDOWN,
  };
  const product = await db.product.upsert({
    where: { slug },
    update: productData,
    create: productData,
  });

  const breakdownData = {
    productId: product.id,
    madeInIndiaScoreBp: pctToBp(PARLE_G_BREAKDOWN.madeInIndiaScorePct),
    madeInIndiaLowBp: pctToBp(PARLE_G_BREAKDOWN.madeInIndiaRangePct.low),
    madeInIndiaHighBp: pctToBp(PARLE_G_BREAKDOWN.madeInIndiaRangePct.high),
    compositionMiiBp: pctToBp(PARLE_G_BREAKDOWN.compositionMiiPct),
    compositionMiiLowBp: pctToBp(PARLE_G_BREAKDOWN.compositionMiiRangePct.low),
    compositionMiiHighBp: pctToBp(PARLE_G_BREAKDOWN.compositionMiiRangePct.high),
    componentsJson: JSON.stringify(PARLE_G_BREAKDOWN.components),
    importsJson: JSON.stringify(PARLE_G_BREAKDOWN.imports),
    gstJson: JSON.stringify(PARLE_G_BREAKDOWN.gst),
    reasoningMarkdown: PARLE_G_BREAKDOWN.overall.reasoning,
    modelUsed: PARLE_G_BREAKDOWN.overall.modelUsed,
    confidenceOverall: PARLE_G_BREAKDOWN.overall.confidence,
    templateVersion: PARLE_G_BREAKDOWN.overall.templateVersion,
  };
  await db.breakdown.upsert({
    where: { productId: product.id },
    update: breakdownData,
    create: breakdownData,
  });
  console.log(`  ✓ hero ${slug}`);
}

async function main() {
  console.log("Seeding categories…");
  await seedCategories();
  console.log("Seeding hero products…");
  await seedHeroParleG();
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
