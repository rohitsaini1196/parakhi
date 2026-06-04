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
import { TOOTHPASTE_TEMPLATE } from "./seed-data/toothpaste";
import { CHIPS_NAMKEEN_TEMPLATE } from "./seed-data/chips-namkeen";
import { PACKAGED_TEA_TEMPLATE } from "./seed-data/packaged-tea";
import { CHOCOLATE_TEMPLATE } from "./seed-data/chocolate";
import { SHAMPOO_TEMPLATE } from "./seed-data/shampoo";
import { SKIN_CREAM_TEMPLATE } from "./seed-data/skin-cream";
import { COOKING_OIL_TEMPLATE } from "./seed-data/cooking-oil";
import { INSTANT_COFFEE_TEMPLATE } from "./seed-data/instant-coffee";
import { PACKAGED_JUICE_TEMPLATE } from "./seed-data/packaged-juice";
import { LIQUID_SOAP_TEMPLATE } from "./seed-data/liquid-soap";
import { DAIRY_PRODUCTS_TEMPLATE } from "./seed-data/dairy-products";
import { HEALTH_DRINKS_TEMPLATE } from "./seed-data/health-drinks";
import { ATTA_FLOUR_TEMPLATE } from "./seed-data/atta-flour";
import { SPICES_MASALA_TEMPLATE } from "./seed-data/spices-masala";
import { HAIR_OIL_TEMPLATE } from "./seed-data/hair-oil";
import { RICE_TEMPLATE } from "./seed-data/rice";
import { PULSES_DAL_TEMPLATE } from "./seed-data/pulses-dal";
import { EDIBLE_SALT_TEMPLATE } from "./seed-data/edible-salt";
import { SUGAR_TEMPLATE } from "./seed-data/sugar";
import { SAUCES_KETCHUP_TEMPLATE } from "./seed-data/sauces-ketchup";
import { PICKLE_ACHAAR_TEMPLATE } from "./seed-data/pickle-achaar";
import { JAM_SPREADS_TEMPLATE } from "./seed-data/jam-spreads";
import { HONEY_TEMPLATE } from "./seed-data/honey";
import { BREAKFAST_CEREAL_TEMPLATE } from "./seed-data/breakfast-cereal";
import { PASTA_VERMICELLI_TEMPLATE } from "./seed-data/pasta-vermicelli";
import { ICE_CREAM_TEMPLATE } from "./seed-data/ice-cream";
import { FROZEN_FOODS_TEMPLATE } from "./seed-data/frozen-foods";
import { BREAD_BAKERY_TEMPLATE } from "./seed-data/bread-bakery";
import { DISHWASH_TEMPLATE } from "./seed-data/dishwash";
import { FLOOR_TOILET_CLEANER_TEMPLATE } from "./seed-data/floor-toilet-cleaner";
import { MOSQUITO_REPELLENT_TEMPLATE } from "./seed-data/mosquito-repellent";
import { AGARBATTI_TEMPLATE } from "./seed-data/agarbatti";
import { DEODORANT_TEMPLATE } from "./seed-data/deodorant";
import { SANITARY_PADS_TEMPLATE } from "./seed-data/sanitary-pads";
import { DIAPERS_TEMPLATE } from "./seed-data/diapers";
import { TALCUM_POWDER_TEMPLATE } from "./seed-data/talcum-powder";
import { PET_FOOD_TEMPLATE } from "./seed-data/pet-food";
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
  TOOTHPASTE_TEMPLATE,
  CHIPS_NAMKEEN_TEMPLATE,
  PACKAGED_TEA_TEMPLATE,
  CHOCOLATE_TEMPLATE,
  SHAMPOO_TEMPLATE,
  SKIN_CREAM_TEMPLATE,
  COOKING_OIL_TEMPLATE,
  INSTANT_COFFEE_TEMPLATE,
  PACKAGED_JUICE_TEMPLATE,
  LIQUID_SOAP_TEMPLATE,
  DAIRY_PRODUCTS_TEMPLATE,
  HEALTH_DRINKS_TEMPLATE,
  ATTA_FLOUR_TEMPLATE,
  SPICES_MASALA_TEMPLATE,
  HAIR_OIL_TEMPLATE,
  RICE_TEMPLATE,
  PULSES_DAL_TEMPLATE,
  EDIBLE_SALT_TEMPLATE,
  SUGAR_TEMPLATE,
  SAUCES_KETCHUP_TEMPLATE,
  PICKLE_ACHAAR_TEMPLATE,
  JAM_SPREADS_TEMPLATE,
  HONEY_TEMPLATE,
  BREAKFAST_CEREAL_TEMPLATE,
  PASTA_VERMICELLI_TEMPLATE,
  ICE_CREAM_TEMPLATE,
  FROZEN_FOODS_TEMPLATE,
  BREAD_BAKERY_TEMPLATE,
  DISHWASH_TEMPLATE,
  FLOOR_TOILET_CLEANER_TEMPLATE,
  MOSQUITO_REPELLENT_TEMPLATE,
  AGARBATTI_TEMPLATE,
  DEODORANT_TEMPLATE,
  SANITARY_PADS_TEMPLATE,
  DIAPERS_TEMPLATE,
  TALCUM_POWDER_TEMPLATE,
  PET_FOOD_TEMPLATE,
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
