import Link from "next/link";
import { db } from "@/lib/db";
import { SearchForm } from "@/app/_components/SearchForm";

type SP = Promise<{ q?: string; error?: string }>;

export default async function Home({
  searchParams,
}: {
  searchParams: SP;
}) {
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
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-12">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Parakhi
        </h1>
        <p className="mt-1 font-serif text-lg italic text-zinc-500">
          Kya hai andar?
        </p>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          What's actually in the Indian products you buy. How much value stays
          in India, how much is imported, how much went to tax — every number
          with its source.
        </p>
      </header>

      <SearchForm defaultValue={q} />
      {error && (
        <p className="mt-3 text-sm text-orange-700 dark:text-orange-400">
          Couldn't process that — {error}
        </p>
      )}
      <p className="mt-2 text-xs text-zinc-500">
        Estimation runs a paid LLM call (max {process.env.RATE_LIMIT_PER_IP_PER_HOUR ?? 10}/hour per visitor).
      </p>

      {hero && (
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
            Hero product (fully researched)
          </h2>
          <Link
            href={`/p/${hero.slug}`}
            className="block rounded-xl border border-zinc-200 p-5 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="font-serif text-xl font-semibold">
                  {hero.name}
                </div>
                <div className="text-sm text-zinc-500">
                  {hero.brand} · {hero.variant}
                </div>
              </div>
              {hero.breakdown && (
                <div className="text-right">
                  <div className="text-3xl font-semibold tabular-nums">
                    {(hero.breakdown.madeInIndiaScoreBp / 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-zinc-500">Indian Value Capture</div>
                </div>
              )}
            </div>
          </Link>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
            Recently estimated
          </h2>
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {recent.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/p/${p.slug}`}
                  className="flex items-baseline justify-between gap-4 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="text-xs text-zinc-500">
                      {p.brand}
                      {p.variant ? ` · ${p.variant}` : ""}
                    </div>
                  </div>
                  {p.breakdown && (
                    <div className="text-right">
                      <div className="text-lg font-semibold tabular-nums">
                        {(p.breakdown.madeInIndiaScoreBp / 100).toFixed(0)}%
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-zinc-500">
                        Indian Value
                      </div>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-24 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800">
        <Link href="/about" className="hover:underline">
          About
        </Link>
        {" · "}
        <Link href="/sources" className="hover:underline">
          Sources
        </Link>
        {" · "}
        <a
          href="https://github.com/"
          className="hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Open source
        </a>
      </footer>
    </main>
  );
}
