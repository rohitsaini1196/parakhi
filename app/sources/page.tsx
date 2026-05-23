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
    <main className="mx-auto max-w-2xl px-5 py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          ← Parakhi
        </Link>
      </nav>
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        Sources
      </h1>
      <p className="mt-3 text-sm text-muted">
        Every category template links to the data it was built from. Below is
        the deduplicated master list across all templates.
      </p>

      <ul className="mt-8 space-y-3 text-sm">
        {master.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline-offset-2 hover:underline"
            >
              {s.title}
            </a>
            <div className="text-xs text-muted">
              {s.category} · {s.relevance}
            </div>
          </li>
        ))}
        {master.length === 0 && (
          <li className="text-muted">No sources yet.</li>
        )}
      </ul>
    </main>
  );
}
