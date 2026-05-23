import Link from "next/link";
import { db } from "@/lib/db";
import { CategoryTemplateSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sources — Parakhi",
};

export default async function SourcesPage() {
  const categories = await db.category.findMany({
    orderBy: { displayName: "asc" },
  });

  const grouped = categories.map((c) => {
    const t = CategoryTemplateSchema.parse(JSON.parse(c.templateJson));
    return { slug: c.slug, displayName: c.displayName, sources: t.sources };
  });

  // Deduplicate URLs across categories for a master list.
  const seen = new Set<string>();
  const master = grouped
    .flatMap((g) =>
      g.sources.map((s) => ({ ...s, category: g.displayName })),
    )
    .filter((s) => {
      if (seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    });

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-zinc-800 dark:text-zinc-200">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:underline">
          ← Back
        </Link>
      </nav>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        Sources
      </h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Every category template links to the data it was built from. Below is
        the deduplicated master list across all our templates.
      </p>

      <ul className="mt-8 space-y-3 text-sm">
        {master.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline"
            >
              {s.title}
            </a>
            <div className="text-xs text-zinc-500">
              {s.category} · {s.relevance}
            </div>
          </li>
        ))}
        {master.length === 0 && (
          <li className="text-zinc-500">No sources yet.</li>
        )}
      </ul>
    </main>
  );
}
