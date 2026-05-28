import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { resolveQuery } from "@/lib/resolve";
import { categorize, UNCATEGORIZED } from "@/lib/categorize";
import { estimateBreakdown } from "@/lib/estimate";
import { upsertBreakdown, upsertProduct } from "@/lib/persist";
import { CategoryTemplateSchema } from "@/lib/schemas";
import { productSlug } from "@/lib/slug";
import { checkRateLimit } from "@/lib/rate-limit";

type SP = Promise<{ q?: string }>;

export default async function SearchingPage({ searchParams }: { searchParams: SP }) {
  const { q: raw } = await searchParams;
  const q = (raw ?? "").trim();
  if (!q) redirect("/");

  // Rate-limit check (reuse existing logic — needs a Request-like object).
  // Build a minimal request for the rate limiter which only reads headers/IP.
  const fakeReq = new Request(`https://parakhi.vercel.app/searching?q=${encodeURIComponent(q)}`, {
    headers: { "x-forwarded-for": "0.0.0.0" },
  });

  try {
    const resolved = await resolveQuery({ value: q });

    // Cache hit → straight to product page.
    const slug = productSlug(resolved.brand, resolved.name, resolved.variant);
    const existing = await db.product.findFirst({
      where: {
        OR: [
          { slug },
          resolved.barcode ? { barcode: resolved.barcode } : { slug: "__never__" },
        ],
      },
      include: { breakdown: true },
    });
    if (existing?.breakdown) redirect(`/p/${existing.slug}`);

    const limit = await checkRateLimit(fakeReq);
    if (!limit.ok) {
      redirect(`/?error=${encodeURIComponent(limit.reason ?? "Rate limited")}`);
    }

    const cat = await categorize(resolved);
    if (cat.categorySlug === UNCATEGORIZED) {
      const params = new URLSearchParams({
        brand: resolved.brand,
        name: resolved.name,
        variant: resolved.variant ?? "",
      });
      redirect(`/uncategorized?${params}`);
    }

    const category = await db.category.findUnique({ where: { slug: cat.categorySlug } });
    if (!category) redirect(`/?error=Category+not+found`);

    const template = CategoryTemplateSchema.parse(JSON.parse(category!.templateJson));
    const breakdown = await estimateBreakdown({
      product: resolved,
      template,
      hsnCode: cat.hsnCode || template.hsnCodes[0]!,
    });

    const persisted = await upsertProduct({
      product: resolved,
      categorySlug: cat.categorySlug,
      hsnCode: cat.hsnCode || template.hsnCodes[0]!,
    });
    await upsertBreakdown({ productId: persisted.id, breakdown });

    redirect(`/p/${persisted.slug}`);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    redirect(`/?error=${encodeURIComponent(message)}`);
  }
}
