import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  CategoryTemplateSchema,
  CostComponentSchema,
  GstInfoSchema,
  ImportSchema,
  type CategoryTemplate,
  type CostComponent,
  type GstInfo,
  type Import,
} from "@/lib/schemas";
import { paiseToRupees, pct, pctRange, flagFor } from "@/lib/format";
import { ConfidenceDot, TierDot } from "@/app/_components/Dots";
import { StackedBar } from "@/app/_components/StackedBar";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Params = Promise<{ slug: string }>;

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { breakdown: true, category: true },
  });
  if (!product || !product.breakdown) return notFound();

  const components = z
    .array(CostComponentSchema)
    .parse(JSON.parse(product.breakdown.componentsJson));
  const imports = z
    .array(ImportSchema)
    .parse(JSON.parse(product.breakdown.importsJson));
  const gst = GstInfoSchema.parse(JSON.parse(product.breakdown.gstJson));
  const template = CategoryTemplateSchema.parse(
    JSON.parse(product.category.templateJson),
  );

  const ivc = product.breakdown.madeInIndiaScoreBp / 100;
  const ivcLow = product.breakdown.madeInIndiaLowBp / 100;
  const ivcHigh = product.breakdown.madeInIndiaHighBp / 100;
  const compMii = product.breakdown.compositionMiiBp / 100;
  const compMiiLow = product.breakdown.compositionMiiLowBp / 100;
  const compMiiHigh = product.breakdown.compositionMiiHighBp / 100;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:underline">
          ← Back
        </Link>
      </nav>

      <Header product={product} />
      <BigNumbers
        ivc={ivc}
        ivcLow={ivcLow}
        ivcHigh={ivcHigh}
        compMii={compMii}
        compMiiLow={compMiiLow}
        compMiiHigh={compMiiHigh}
        gst={gst}
        mrpInPaise={product.mrpInPaise}
        imports={imports}
      />

      <Section title="Cost breakdown">
        <StackedBar components={components} />
        <ComponentsTable components={components} mrpInPaise={product.mrpInPaise} />
      </Section>

      {imports.length > 0 && (
        <Section title="Imported ingredients">
          <ImportsList imports={imports} />
        </Section>
      )}

      <Section title="How we estimated this">
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {product.breakdown.reasoningMarkdown}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
          <span>
            Overall confidence:{" "}
            <span className="inline-flex items-center gap-1">
              <ConfidenceDot
                level={
                  product.breakdown.confidenceOverall as
                    | "high"
                    | "medium"
                    | "low"
                }
              />
              {product.breakdown.confidenceOverall}
            </span>
          </span>
          <span>·</span>
          <span>Model: {product.breakdown.modelUsed}</span>
          <span>·</span>
          <span>Template v{product.breakdown.templateVersion}</span>
        </div>
        <SourcesList template={template} />
      </Section>

      {product.isHeroProduct && product.heroMarkdown && (
        <Section title="The full story">
          <HeroMarkdown content={product.heroMarkdown} />
        </Section>
      )}

      <Section title="Spot an error?">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We try to be honest about uncertainty. If a number looks off, tell us
          why — we'll re-check.
        </p>
        <Link
          href={`/feedback?productId=${product.id}`}
          className="mt-3 inline-block rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Send feedback
        </Link>
      </Section>
    </main>
  );
}

function Header({
  product,
}: {
  product: { brand: string; name: string; variant: string | null; mrpInPaise: number | null; mrpLastSeenAt: Date | null };
}) {
  return (
    <header className="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800">
      <div className="text-sm text-zinc-500">{product.brand}</div>
      <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">
        {product.name}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 text-sm text-zinc-600 dark:text-zinc-400">
        {product.variant && <span>{product.variant}</span>}
        {product.mrpInPaise != null && (
          <>
            <span>·</span>
            <span>MRP {paiseToRupees(product.mrpInPaise)}</span>
          </>
        )}
        {product.mrpLastSeenAt && (
          <>
            <span>·</span>
            <span>
              as of {product.mrpLastSeenAt.toISOString().slice(0, 10)}
            </span>
          </>
        )}
      </div>
    </header>
  );
}

function BigNumbers({
  ivc,
  ivcLow,
  ivcHigh,
  compMii,
  compMiiLow,
  compMiiHigh,
  gst,
  mrpInPaise: _mrpInPaise,
  imports,
}: {
  ivc: number;
  ivcLow: number;
  ivcHigh: number;
  compMii: number;
  compMiiLow: number;
  compMiiHigh: number;
  gst: GstInfo;
  mrpInPaise: number | null;
  imports: Import[];
}) {
  return (
    <>
      {/* Primary metric: Indian Value Capture (IVC) */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-zinc-50 p-6 dark:border-zinc-800 dark:from-emerald-950/30 dark:to-zinc-900">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          <span>🇮🇳 Indian Value Capture</span>
          <ConfidenceDot level="medium" />
        </div>
        <div className="mt-2 font-serif text-5xl font-semibold tabular-nums">
          {ivc.toFixed(0)}%
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          range {pctRange(ivcLow, ivcHigh)} · share of MRP that flows to Indian sources (excl. GST)
        </div>

        {/* Composition chip below the primary number */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900">
          <span className="text-zinc-500">Composition</span>
          <span className="font-semibold tabular-nums">{compMii.toFixed(0)}%</span>
          <span className="text-zinc-400">
            range {pctRange(compMiiLow, compMiiHigh)}
          </span>
        </div>
      </div>

      {/* Secondary cards: GST + Imports */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card
          label="Tax (GST)"
          icon="🏛️"
          value={paiseToRupees(gst.rupeeAmount)}
          sub={`${pct(gst.ratePct, 0)} · HSN ${gst.hsnCode}`}
          dot={<ConfidenceDot level={gst.confidence} />}
        />
        <Card
          label="Imported share"
          icon="🌍"
          value={`${imports.reduce((s, i) => s + i.sharePctOfProduct, 0).toFixed(0)}%`}
          sub={
            imports.length === 0
              ? "no significant imports"
              : imports
                  .flatMap((i) => i.likelyCountries.slice(0, 2))
                  .map((c) => `${flagFor(c.code)} ${c.name}`)
                  .join(", ")
          }
          dot={<ConfidenceDot level="medium" />}
        />
      </div>
    </>
  );
}

function Card({
  label,
  icon,
  value,
  sub,
  dot,
}: {
  label: string;
  icon: string;
  value: string;
  sub: string;
  dot?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500">
        <span>
          {icon} {label}
        </span>
        {dot}
      </div>
      <div className="mt-2 font-serif text-3xl font-semibold tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-xs text-zinc-500">{sub}</div>
    </div>
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
    <section className="mt-10">
      <h2 className="mb-3 font-serif text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function ComponentsTable({
  components,
  mrpInPaise,
}: {
  components: CostComponent[];
  mrpInPaise: number | null;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
          <tr>
            <th className="px-3 py-2 font-medium">Component</th>
            <th className="px-3 py-2 font-medium tabular-nums">Share</th>
            <th className="px-3 py-2 font-medium tabular-nums">Range</th>
            {mrpInPaise != null && (
              <th className="px-3 py-2 font-medium tabular-nums">₹</th>
            )}
            <th className="px-3 py-2 font-medium">Source</th>
          </tr>
        </thead>
        <tbody>
          {components.map((c) => (
            <tr
              key={c.label}
              className="border-t border-zinc-200 align-top dark:border-zinc-800"
            >
              <td className="px-3 py-2">
                <div className="font-medium">{c.label}</div>
                <div className="text-xs text-zinc-500">{c.explanation}</div>
              </td>
              <td className="px-3 py-2 tabular-nums">{pct(c.sharePct)}</td>
              <td className="px-3 py-2 tabular-nums text-zinc-500">
                {pctRange(c.rangePct.low, c.rangePct.high)}
              </td>
              {mrpInPaise != null && (
                <td className="px-3 py-2 tabular-nums">
                  {c.rupeeAmount != null ? paiseToRupees(c.rupeeAmount) : "—"}
                </td>
              )}
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                  <TierDot tier={c.sourceTier} />
                  T{c.sourceTier}
                  <ConfidenceDot level={c.confidence} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImportsList({ imports }: { imports: Import[] }) {
  return (
    <ul className="space-y-3">
      {imports.map((imp) => (
        <li
          key={imp.ingredient}
          className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="flex items-baseline justify-between gap-3">
            <div className="font-medium">{imp.ingredient}</div>
            <div className="text-sm text-zinc-500 tabular-nums">
              ~{imp.sharePctOfProduct}% of product
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {imp.likelyCountries.map((c) => (
              <span
                key={c.code}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800"
              >
                {flagFor(c.code)} {c.name}
                <span className="text-zinc-500">
                  {c.probabilityPct}%
                </span>
              </span>
            ))}
          </div>
          {imp.notes && (
            <div className="mt-2 text-xs text-zinc-500">{imp.notes}</div>
          )}
        </li>
      ))}
    </ul>
  );
}

function SourcesList({ template }: { template: CategoryTemplate }) {
  return (
    <details className="mt-6 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <summary className="cursor-pointer text-sm font-medium">
        Sources ({template.sources.length})
      </summary>
      <ul className="mt-3 space-y-2 text-sm">
        {template.sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
            >
              {s.title}
            </a>
            <span className="ml-2 text-xs text-zinc-500">{s.relevance}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function HeroMarkdown({ content }: { content: string }) {
  return (
    <article className="hero-md text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
