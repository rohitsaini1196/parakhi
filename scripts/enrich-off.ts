/**
 * Backfill declared ingredients from Open Food Facts for products that don't
 * have them yet. Free, no key. Patchy India coverage — a miss just leaves the
 * product without label data (honest; we don't fabricate). Idempotent; safe to
 * re-run. Skips products already enriched.
 *
 *   npm run enrich:off
 */
import { db } from "../lib/db";
import { searchOFF } from "../lib/openfoodfacts";

async function main() {
  const products = await db.product.findMany({
    where: { declaredIngredients: null },
    select: { id: true, slug: true, brand: true, name: true },
  });
  let hit = 0;
  let miss = 0;
  for (const p of products) {
    const match = await searchOFF(p.brand, p.name);
    if (match) {
      await db.product.update({
        where: { id: p.id },
        data: {
          declaredIngredients: JSON.stringify(match.ingredients),
          offBarcode: match.barcode || null,
        },
      });
      hit++;
      console.log(`  ✓ ${p.slug.padEnd(40)} ${match.ingredients.length} ingredients`);
    } else {
      miss++;
    }
    await new Promise((r) => setTimeout(r, 300)); // politeness
  }
  console.log(`\nEnriched ${hit}, missed ${miss}, of ${products.length}. Hit rate ${products.length ? Math.round((hit / products.length) * 100) : 0}%.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
