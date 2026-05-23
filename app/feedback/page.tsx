import Link from "next/link";
import { FeedbackForm } from "@/app/_components/FeedbackForm";

type SP = Promise<{ productId?: string; ok?: string }>;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { productId, ok } = await searchParams;
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:underline">
          ← Back
        </Link>
      </nav>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        Tell us what's wrong (or missing)
      </h1>
      <p className="mt-3 text-zinc-700 dark:text-zinc-300">
        Every correction makes the next estimate better. We read every one.
      </p>
      {ok ? (
        <div className="mt-8 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          Thanks. Logged.
        </div>
      ) : (
        <FeedbackForm productId={productId} />
      )}
    </main>
  );
}
