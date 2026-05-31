import { db } from "@/lib/db";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({
    where: { breakdown: { isNot: null } },
    select: { slug: true, updatedAt: true },
  });

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `https://parakhi.in/p/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: "https://parakhi.in", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://parakhi.in/browse", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://parakhi.in/about", changeFrequency: "monthly", priority: 0.5 },
    { url: "https://parakhi.in/sources", changeFrequency: "monthly", priority: 0.4 },
    ...productUrls,
  ];
}
