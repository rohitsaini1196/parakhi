/**
 * Smoke tests that don't require an OpenAI key.
 *
 *   1. Resolve a barcode via Open Food Facts (Parle-G 8901719128462)
 *   2. Load packaged_biscuits template from DB and validate with Zod
 *
 * Run:  npm run smoke
 */
import { resolveQuery } from "../lib/resolve";
import { db } from "../lib/db";
import { CategoryTemplateSchema } from "../lib/schemas";

async function main() {
  console.log("\n[1] Open Food Facts barcode resolution");
  const resolved = await resolveQuery({ value: "8901719128462" });
  console.log("  brand:  ", resolved.brand);
  console.log("  name:   ", resolved.name);
  console.log("  variant:", resolved.variant);
  console.log("  barcode:", resolved.barcode);
  console.log(
    "  ingredients (first 3):",
    resolved.declaredIngredients?.slice(0, 3),
  );

  console.log("\n[2] DB template round-trip");
  const cat = await db.category.findUniqueOrThrow({
    where: { slug: "packaged_biscuits" },
  });
  const template = CategoryTemplateSchema.parse(JSON.parse(cat.templateJson));
  console.log("  template slug:   ", template.slug);
  console.log("  raw material #:  ", template.rawMaterials.length);
  console.log("  MII band:        ", template.madeInIndiaBand);

  console.log("\nOK — pipeline pieces that don't need an OpenAI key are sound.");
}

main()
  .catch((e) => {
    console.error("smoke failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
