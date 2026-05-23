import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [feedback, votes, llmTotals, recentEstimates] = await Promise.all([
    db.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.vote.groupBy({
      by: ["target"],
      _count: { target: true },
      orderBy: { _count: { target: "desc" } },
      take: 25,
    }),
    db.llmCall.groupBy({
      by: ["model"],
      _sum: { inputTokens: true, outputTokens: true, costUsd: true },
      _count: { _all: true },
    }),
    db.llmCall.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalCost = llmTotals.reduce(
    (s, t) => s + (t._sum.costUsd ?? 0),
    0,
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 font-sans">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="font-serif text-2xl font-semibold">Admin</h1>
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Back to site
        </Link>
      </header>

      <Section title={`LLM spend — $${totalCost.toFixed(4)} total`}>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="py-1 pr-3">Model</th>
              <th className="py-1 pr-3 tabular-nums">Calls</th>
              <th className="py-1 pr-3 tabular-nums">In tok</th>
              <th className="py-1 pr-3 tabular-nums">Out tok</th>
              <th className="py-1 pr-3 tabular-nums">USD</th>
            </tr>
          </thead>
          <tbody>
            {llmTotals.map((t) => (
              <tr key={t.model} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="py-1.5 pr-3 font-mono text-xs">{t.model}</td>
                <td className="py-1.5 pr-3 tabular-nums">{t._count._all}</td>
                <td className="py-1.5 pr-3 tabular-nums">{t._sum.inputTokens ?? 0}</td>
                <td className="py-1.5 pr-3 tabular-nums">{t._sum.outputTokens ?? 0}</td>
                <td className="py-1.5 pr-3 tabular-nums">
                  ${(t._sum.costUsd ?? 0).toFixed(4)}
                </td>
              </tr>
            ))}
            {llmTotals.length === 0 && (
              <tr>
                <td colSpan={5} className="py-2 text-zinc-500">
                  No LLM calls yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>

      <Section title="Recent LLM calls">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="py-1 pr-3">When</th>
              <th className="py-1 pr-3">Endpoint</th>
              <th className="py-1 pr-3">Model</th>
              <th className="py-1 pr-3 tabular-nums">Tokens (in/out)</th>
              <th className="py-1 pr-3 tabular-nums">USD</th>
            </tr>
          </thead>
          <tbody>
            {recentEstimates.map((c) => (
              <tr key={c.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="py-1.5 pr-3 text-zinc-500">
                  {c.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                </td>
                <td className="py-1.5 pr-3">{c.endpoint}</td>
                <td className="py-1.5 pr-3 font-mono text-xs">{c.model}</td>
                <td className="py-1.5 pr-3 tabular-nums">
                  {c.inputTokens}/{c.outputTokens}
                </td>
                <td className="py-1.5 pr-3 tabular-nums">${c.costUsd.toFixed(4)}</td>
              </tr>
            ))}
            {recentEstimates.length === 0 && (
              <tr>
                <td colSpan={5} className="py-2 text-zinc-500">
                  Nothing yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>

      <Section title={`Feedback (${feedback.length})`}>
        <ul className="space-y-3">
          {feedback.map((f) => (
            <li
              key={f.id}
              className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-zinc-500">
                <span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {f.kind}
                  </span>
                  {f.productId ? ` · product ${f.productId}` : ""}
                  {f.submitterEmail ? ` · ${f.submitterEmail}` : ""}
                </span>
                <span>{f.createdAt.toISOString().slice(0, 19).replace("T", " ")}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm">{f.message}</p>
            </li>
          ))}
          {feedback.length === 0 && (
            <li className="text-sm text-zinc-500">No feedback yet.</li>
          )}
        </ul>
      </Section>

      <Section title="Top votes">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="py-1 pr-3">Target</th>
              <th className="py-1 pr-3 tabular-nums">Votes</th>
            </tr>
          </thead>
          <tbody>
            {votes.map((v) => (
              <tr key={v.target} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="py-1.5 pr-3">{v.target}</td>
                <td className="py-1.5 pr-3 tabular-nums">{v._count.target}</td>
              </tr>
            ))}
            {votes.length === 0 && (
              <tr>
                <td colSpan={2} className="py-2 text-zinc-500">
                  No votes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-serif text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
