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
    <main className="mx-auto max-w-2xl px-5 py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          ← Parakhi
        </Link>
      </nav>
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        We haven&apos;t researched this category yet.
      </h1>
      <p className="mt-4 text-foreground/80">
        You searched for <span className="font-medium">{label || "this product"}</span>.
        We could guess — but we&apos;d rather be honest. We only show
        breakdowns for categories where we have a curated template.
      </p>
      <p className="mt-3 text-muted">
        Vote to nudge this category up the queue.
      </p>
      <form
        action="/api/vote"
        method="post"
        className="mt-6 flex flex-wrap items-center gap-3"
      >
        <input
          type="hidden"
          name="target"
          value={`product:${label || "unknown"}`}
        />
        <button
          type="submit"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Vote to add
        </button>
        <Link
          href={`/feedback?productId=&kind=suggestion`}
          className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-surface-2"
        >
          Suggest a category
        </Link>
      </form>
    </main>
  );
}
