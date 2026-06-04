import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CostComponentSchema, GstInfoSchema, ImportSchema } from "@/lib/schemas";
import { z } from "zod";
import { mapToDesignProduct } from "@/lib/product-design";
import { Fold1, Fold2, Fold3, Fold4, HeroStory, NextProducts } from "@/app/_components/parakhi/folds";

type Params = Promise<{ slug: string }>;

// ISR: cache each product page; breakdowns change only on recompute (nightly).
// First hit renders + caches; subsequent hits skip the DB entirely.
export const revalidate = 3600;

// Cache the per-slug DB read for an hour — Neon round-trips (incl. free-tier
// cold-start) are the dominant cost; caching them is what makes warm loads fast.
const loadProduct = unstable_cache(
  async (slug: string) =>
    db.product.findUnique({
      where: { slug },
      include: { breakdown: true, category: true },
    }),
  ["product-by-slug"],
  { revalidate: 3600 },
);

const loadOthers = unstable_cache(
  async (slug: string, categorySlug: string) => {
    // Same category first, fill remainder with any product
    const sameCategory = await db.product.findMany({
      where: { slug: { not: slug }, categorySlug, breakdown: { isNot: null } },
      include: { breakdown: true, category: true },
      orderBy: { isHeroProduct: "desc" },
      take: 6,
    });
    if (sameCategory.length >= 4) return sameCategory.slice(0, 6);
    const others = await db.product.findMany({
      where: { slug: { notIn: [slug, ...sameCategory.map((p) => p.slug)] }, breakdown: { isNot: null } },
      include: { breakdown: true, category: true },
      orderBy: { isHeroProduct: "desc" },
      take: 6 - sameCategory.length,
    });
    return [...sameCategory, ...others];
  },
  ["product-others-by-category"],
  { revalidate: 3600 },
);

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product || !product.breakdown) return notFound();

  const design = mapToDesignProduct(product);

  // "Next products" — a few others to jump to.
  const others = await loadOthers(slug, product.categorySlug);
  const nextItems = others.map((p) => {
    const c = z.array(CostComponentSchema).parse(JSON.parse(p.breakdown!.componentsJson));
    const im = z.array(ImportSchema).parse(JSON.parse(p.breakdown!.importsJson));
    const g = GstInfoSchema.parse(JSON.parse(p.breakdown!.gstJson));
    const tax = Math.round(g.ratePct);
    const ab = Math.round(im.reduce((s, i) => s + i.sharePctOfProduct, 0));
    void c;
    return {
      slug: p.slug,
      brand: p.name,
      category: p.category.displayName,
      ivc: Math.round(p.breakdown!.madeInIndiaScoreBp / 100),
      split: { india: Math.max(0, 100 - tax - ab), tax, abroad: ab },
    };
  });

  return (
    <main style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <Fold1 product={design} />
      <Fold2 product={design} />
      <Fold3 product={design} />
      <Fold4 product={design} />
      {design.longform && <HeroStory product={design} />}
      <NextProducts items={nextItems} />
    </main>
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product?.breakdown) return { title: "Parakhi" };

  const design = mapToDesignProduct(product);
  const mrp = design.mrp != null ? `₹${design.mrp} · ` : "";
  const { india, tax, abroad } = design.split;
  const variant = product.variant ? ` ${product.variant}` : "";

  const description =
    `${mrp}${india}% stays in India · ${tax}% tax · ${abroad}% abroad. ` +
    `Full cost breakdown sourced from public data.`;

  const ogTitle = `${design.brand}${variant} — ${design.ivc}% Indian Value Capture`;

  return {
    title: `${ogTitle} | Parakhi`,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: `https://parakhi.in/p/${slug}`,
      siteName: "Parakhi",
      type: "website",
      images: [{ url: `https://parakhi.in/api/og?slug=${slug}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [`https://parakhi.in/api/og?slug=${slug}`],
    },
  };
}
