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
    <main className="mx-auto max-w-2xl px-5 py-16">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          ← Parakhi
        </Link>
      </nav>
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        Tell us what&apos;s wrong (or missing)
      </h1>
      <p className="mt-3 text-muted">
        Every correction makes the next estimate better. We read every one.
      </p>
      {ok ? (
        <div className="mt-8 rounded-2xl border border-india/30 bg-india/10 p-4 text-sm text-india">
          Thanks. Logged.
        </div>
      ) : (
        <FeedbackForm productId={productId} />
      )}
    </main>
  );
}
