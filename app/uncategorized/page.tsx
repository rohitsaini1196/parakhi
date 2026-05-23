import Link from "next/link";

type SP = Promise<{ brand?: string; name?: string; variant?: string }>;

export default async function UncategorizedPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { brand, name, variant } = await searchParams;
  const label = [brand, name, variant].filter(Boolean).join(" ");

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:underline">
          ← Back
        </Link>
      </nav>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        We haven't researched this category yet.
      </h1>
      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        You searched for <span className="font-medium">{label || "this product"}</span>.
        We could guess — but we'd rather be honest. We only show breakdowns for
        categories where we have a curated template.
      </p>
      <p className="mt-3 text-zinc-700 dark:text-zinc-300">
        Vote to nudge this category up our list.
      </p>
      <form
        action="/api/vote"
        method="post"
        className="mt-6 flex items-center gap-3"
      >
        <input
          type="hidden"
          name="target"
          value={`product:${label || "unknown"}`}
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Vote to add
        </button>
        <Link
          href="/feedback"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Suggest a category
        </Link>
      </form>
    </main>
  );
}
