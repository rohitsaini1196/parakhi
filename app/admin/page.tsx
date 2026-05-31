import Link from "next/link";
import { db } from "@/lib/db";
import {
  approveDraftAction,
  generateDraftAction,
  rejectDraftAction,
} from "./actions";
import type { CategoryTemplate } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [drafts, feedback, votes, llmTotals, recentCalls, failedQueries] = await Promise.all([
    db.categoryDraft.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    db.feedback.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
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
    db.llmCall.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.failedQuery.groupBy({
      by: ["query", "reason"],
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 50,
    }),
  ]);

  const totalCost = llmTotals.reduce((s, t) => s + (t._sum.costUsd ?? 0), 0);
  const pendingDrafts = drafts.filter((d) => d.status === "pending");

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 font-sans">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="font-serif text-2xl font-semibold">Admin</h1>
        <Link href="/" className="text-sm text-ink-dim hover:text-ink">
          ← Back to site
        </Link>
      </header>

      <Section title={`Category drafts — ${pendingDrafts.length} pending`}>
        <form action={generateDraftAction} className="mb-5 rounded-2xl border border-line bg-bg-raised/40 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-ink-dim">
            Generate a new draft (gpt-4o · ~$0.03/call)
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              name="exampleQuery"
              required
              placeholder='example product, e.g. "Lay&apos;s Magic Masala 52g"'
              className="rounded-md border border-line bg-bg-raised px-3 py-2 text-sm"
            />
            <input
              name="categoryHint"
              placeholder="category hint (optional) e.g. potato_chips"
              className="rounded-md border border-line bg-bg-raised px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
            >
              Draft
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-dim">
            LLM drafts a CategoryTemplate. Lands as pending. Nothing goes live
            until you approve below.
          </p>
        </form>

        <ul className="space-y-3">
          {drafts.map((d) => {
            const tpl = JSON.parse(d.templateJson) as CategoryTemplate;
            return (
              <li
                key={d.id}
                className="rounded-2xl border border-line bg-bg-raised/30 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span
                      className={`mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                        d.status === "pending"
                          ? "bg-tax/20 text-tax"
                          : d.status === "approved"
                            ? "bg-india/20 text-india"
                            : "bg-abroad/20 text-abroad"
                      }`}
                    >
                      {d.status}
                    </span>
                    <span className="font-medium">{d.displayName}</span>
                    <span className="ml-2 font-mono text-xs text-ink-dim">
                      ({d.slug})
                    </span>
                  </div>
                  <span className="text-xs text-ink-dim">
                    {d.createdAt.toISOString().slice(0, 19).replace("T", " ")}
                  </span>
                </div>
                {d.exampleQuery && (
                  <div className="mt-1 text-xs text-ink-dim">
                    Triggered by: <em>{d.exampleQuery}</em>
                  </div>
                )}
                <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                  <DraftStat label="HSN" value={tpl.hsnCodes.join(", ")} />
                  <DraftStat label="GST" value={`${tpl.defaultGstRate}%`} />
                  <DraftStat
                    label="Raw materials"
                    value={tpl.rawMaterials.map((r) => r.name).join(" · ")}
                  />
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-ink-dim">
                    Inspect full JSON
                  </summary>
                  <pre className="mt-2 overflow-x-auto rounded-md bg-bg p-3 text-[11px]">
                    {JSON.stringify(tpl, null, 2)}
                  </pre>
                </details>
                {d.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <form action={approveDraftAction}>
                      <input type="hidden" name="draftId" value={d.id} />
                      <button
                        type="submit"
                        className="rounded-md bg-india px-3 py-1.5 text-xs font-medium text-bg"
                      >
                        Approve & publish
                      </button>
                    </form>
                    <form action={rejectDraftAction}>
                      <input type="hidden" name="draftId" value={d.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-line px-3 py-1.5 text-xs"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                )}
                {d.reviewerNotes && (
                  <div className="mt-2 text-xs text-ink-dim">
                    Notes: {d.reviewerNotes}
                  </div>
                )}
              </li>
            );
          })}
          {drafts.length === 0 && (
            <li className="text-sm text-ink-dim">No drafts yet.</li>
          )}
        </ul>
      </Section>

      <Section title={`LLM spend — $${totalCost.toFixed(4)} total`}>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-ink-dim">
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
              <tr key={t.model} className="border-t border-line">
                <td className="py-1.5 pr-3 font-mono text-xs">{t.model}</td>
                <td className="py-1.5 pr-3 tabular-nums">{t._count._all}</td>
                <td className="py-1.5 pr-3 tabular-nums">
                  {t._sum.inputTokens ?? 0}
                </td>
                <td className="py-1.5 pr-3 tabular-nums">
                  {t._sum.outputTokens ?? 0}
                </td>
                <td className="py-1.5 pr-3 tabular-nums">
                  ${(t._sum.costUsd ?? 0).toFixed(4)}
                </td>
              </tr>
            ))}
            {llmTotals.length === 0 && (
              <tr>
                <td colSpan={5} className="py-2 text-ink-dim">
                  No LLM calls yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>

      <Section title="Recent LLM calls">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-ink-dim">
            <tr>
              <th className="py-1 pr-3">When</th>
              <th className="py-1 pr-3">Endpoint</th>
              <th className="py-1 pr-3">Model</th>
              <th className="py-1 pr-3 tabular-nums">Tokens (in/out)</th>
              <th className="py-1 pr-3 tabular-nums">USD</th>
            </tr>
          </thead>
          <tbody>
            {recentCalls.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="py-1.5 pr-3 text-ink-dim">
                  {c.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                </td>
                <td className="py-1.5 pr-3">{c.endpoint}</td>
                <td className="py-1.5 pr-3 font-mono text-xs">{c.model}</td>
                <td className="py-1.5 pr-3 tabular-nums">
                  {c.inputTokens}/{c.outputTokens}
                </td>
                <td className="py-1.5 pr-3 tabular-nums">
                  ${c.costUsd.toFixed(4)}
                </td>
              </tr>
            ))}
            {recentCalls.length === 0 && (
              <tr>
                <td colSpan={5} className="py-2 text-ink-dim">
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
            <li key={f.id} className="rounded-md border border-line p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-ink-dim">
                <span>
                  <span className="font-medium text-ink">{f.kind}</span>
                  {f.productId ? ` · product ${f.productId}` : ""}
                  {f.submitterEmail ? ` · ${f.submitterEmail}` : ""}
                </span>
                <span>
                  {f.createdAt.toISOString().slice(0, 19).replace("T", " ")}
                </span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm">{f.message}</p>
            </li>
          ))}
          {feedback.length === 0 && (
            <li className="text-sm text-ink-dim">No feedback yet.</li>
          )}
        </ul>
      </Section>

      <Section title="Top votes">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-ink-dim">
            <tr>
              <th className="py-1 pr-3">Target</th>
              <th className="py-1 pr-3 tabular-nums">Votes</th>
            </tr>
          </thead>
          <tbody>
            {votes.map((v) => (
              <tr key={v.target} className="border-t border-line">
                <td className="py-1.5 pr-3">{v.target}</td>
                <td className="py-1.5 pr-3 tabular-nums">{v._count.target}</td>
              </tr>
            ))}
            {votes.length === 0 && (
              <tr>
                <td colSpan={2} className="py-2 text-ink-dim">
                  No votes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>

      <Section title={`Failed searches (${failedQueries.length} distinct)`}>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-ink-dim">
            <tr>
              <th className="py-1 pr-3">Query</th>
              <th className="py-1 pr-3">Reason</th>
              <th className="py-1 pr-3 tabular-nums">Count</th>
            </tr>
          </thead>
          <tbody>
            {failedQueries.map((f, i) => (
              <tr key={i} className="border-t border-line">
                <td className="py-1.5 pr-3 font-medium">{f.query}</td>
                <td className="py-1.5 pr-3 text-ink-dim text-xs">{f.reason}</td>
                <td className="py-1.5 pr-3 tabular-nums">{f._count.query}</td>
              </tr>
            ))}
            {failedQueries.length === 0 && (
              <tr>
                <td colSpan={3} className="py-2 text-ink-dim">
                  No failed searches yet.
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

function DraftStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-bg/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-ink-dim">
        {label}
      </div>
      <div className="mt-0.5 truncate" title={value}>
        {value}
      </div>
    </div>
  );
}
