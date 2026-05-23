import Link from "next/link";
import { db } from "@/lib/db";
import { SearchForm } from "@/app/_components/SearchForm";
import { Wordmark } from "@/app/_components/Wordmark";

type SP = Promise<{ q?: string; error?: string }>;

export default async function Home({ searchParams }: { searchParams: SP }) {
  const { q, error } = await searchParams;
  const [hero, recent] = await Promise.all([
    db.product.findFirst({
      where: { isHeroProduct: true },
      include: { breakdown: true },
    }),
    db.product.findMany({
      where: { isHeroProduct: false, breakdown: { isNot: null } },
      include: { breakdown: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <header className="mb-10">
        <Wordmark />
        <p className="mt-4 max-w-md text-muted">
          Where does your money actually go when you buy an Indian product?
          Search one. Every number carries its source.
        </p>
      </header>

      <SearchForm defaultValue={q} />
      {error && (
        <p className="mt-3 text-sm text-abroad">Couldn&apos;t process that — {error}</p>
      )}

      {hero && (
        <section className="mt-12">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Fully researched
          </h2>
          <Link
            href={`/p/${hero.slug}`}
            className="group block rounded-2xl border border-border bg-surface/50 p-5 transition-colors hover:border-india/50"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="font-serif text-xl font-semibold">{hero.name}</div>
                <div className="text-sm text-muted">
                  {hero.brand} · {hero.variant}
                </div>
              </div>
              {hero.breakdown && (
                <div className="text-right">
                  <div className="font-serif text-3xl font-semibold tabular-nums text-india">
                    {(hero.breakdown.madeInIndiaScoreBp / 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted">
                    Indian Value
                  </div>
                </div>
              )}
            </div>
          </Link>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Recently analyzed
          </h2>
          <ul className="overflow-hidden rounded-2xl border border-border">
            {recent.map((p) => (
              <li key={p.id} className="border-b border-border last:border-0">
                <Link
                  href={`/p/${p.slug}`}
                  className="flex items-baseline justify-between gap-4 px-5 py-3 transition-colors hover:bg-surface-2"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="text-xs text-muted">
                      {p.brand}
                      {p.variant ? ` · ${p.variant}` : ""}
                    </div>
                  </div>
                  {p.breakdown && (
                    <div className="shrink-0 text-right">
                      <div className="font-serif text-lg font-semibold tabular-nums text-india">
                        {(p.breakdown.madeInIndiaScoreBp / 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-24 border-t border-border pt-6 text-xs text-muted">
        <Link href="/about" className="hover:text-foreground">
          About
        </Link>
        {" · "}
        <Link href="/sources" className="hover:text-foreground">
          Sources
        </Link>
        {" · "}
        <a
          href="https://github.com/rohitsaini1196/parakhi"
          className="hover:text-foreground"
          target="_blank"
          rel="noreferrer"
        >
          Open source
        </a>
      </footer>
    </main>
  );
}
