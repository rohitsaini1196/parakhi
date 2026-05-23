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
  type Import,
} from "@/lib/schemas";
import { paiseToRupees, pct, pctRange, flagFor } from "@/lib/format";
import { ConfidenceDot, TierDot } from "@/app/_components/Dots";
import { RupeeFlowBar } from "@/app/_components/RupeeFlowBar";
import { StatOrbs } from "@/app/_components/StatOrbs";
import { DigDeeper } from "@/app/_components/DigDeeper";
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
  const compMii = product.breakdown.compositionMiiBp / 100;
  const importedPct = imports.reduce((s, i) => s + i.sharePctOfProduct, 0);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
      <nav className="mb-8 text-sm text-muted">
        <Link href="/" className="transition-colors hover:text-foreground">
          ← Parakhi
        </Link>
      </nav>

      {/* Minimal header */}
      <header className="mb-8">
        <div className="text-sm text-muted">{product.brand}</div>
        <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight">
          {product.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-muted">
          {product.variant && <span>{product.variant}</span>}
          {product.mrpInPaise != null && (
            <>
              <span>·</span>
              <span>MRP {paiseToRupees(product.mrpInPaise)}</span>
            </>
          )}
        </div>
      </header>

      {/* Hero: rupee flow bar — the whole story above the fold */}
      <RupeeFlowBar
        ivc={ivc}
        components={components}
        imports={imports}
        gst={gst}
        mrpInPaise={product.mrpInPaise}
      />

      {/* Progressive disclosure: everything else */}
      <DigDeeper>
        <StatOrbs
          orbs={[
            {
              label: "Composition Indian",
              value: compMii,
              suffix: "%",
              sub: "by raw-material origin",
              accent: "var(--india)",
            },
            {
              label: "Tax · GST",
              value: gst.ratePct,
              suffix: "%",
              sub:
                gst.rupeeAmount != null
                  ? `${paiseToRupees(gst.rupeeAmount)} per pack · HSN ${gst.hsnCode}`
                  : `HSN ${gst.hsnCode}`,
              accent: "var(--tax)",
            },
            {
              label: "Flies abroad",
              value: importedPct,
              suffix: "%",
              sub:
                imports.length === 0
                  ? "no significant imports"
                  : imports
                      .flatMap((i) => i.likelyCountries.slice(0, 2))
                      .map((c) => `${flagFor(c.code)} ${c.name}`)
                      .join(" · "),
              accent: "var(--abroad)",
            },
          ]}
        />
        <div className="mt-8" />
        <ComponentsTable components={components} mrpInPaise={product.mrpInPaise} />
        {imports.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 font-serif text-lg font-semibold">
              Imported inputs
            </h3>
            <ImportsList imports={imports} />
          </div>
        )}
        <div className="mt-8">
          <h3 className="mb-3 font-serif text-lg font-semibold">
            How we estimated this
          </h3>
          <p className="text-sm leading-relaxed text-muted">
            {product.breakdown.reasoningMarkdown}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <ConfidenceDot
                level={
                  product.breakdown.confidenceOverall as "high" | "medium" | "low"
                }
              />
              {product.breakdown.confidenceOverall} confidence
            </span>
            <span>·</span>
            <span>{product.breakdown.modelUsed}</span>
            <span>·</span>
            <span>template v{product.breakdown.templateVersion}</span>
          </div>
          <SourcesList template={template} />
        </div>
      </DigDeeper>

      {/* Hero story (Parle-G etc.) */}
      {product.isHeroProduct && product.heroMarkdown && (
        <section className="mt-12 border-t border-border pt-8">
          <HeroMarkdown content={product.heroMarkdown} />
        </section>
      )}

      {/* Feedback */}
      <section className="mt-12 flex items-center justify-between rounded-2xl border border-border bg-surface/40 px-5 py-4">
        <span className="text-sm text-muted">A number looks off?</span>
        <Link
          href={`/feedback?productId=${product.id}`}
          className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-surface-2"
        >
          Tell us
        </Link>
      </section>
    </main>
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
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
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
            <tr key={c.label} className="border-t border-border align-top">
              <td className="px-3 py-2">
                <div className="font-medium text-foreground">{c.label}</div>
                <div className="text-xs text-muted">{c.explanation}</div>
              </td>
              <td className="px-3 py-2 tabular-nums">{pct(c.sharePct)}</td>
              <td className="px-3 py-2 tabular-nums text-muted">
                {pctRange(c.rangePct.low, c.rangePct.high)}
              </td>
              {mrpInPaise != null && (
                <td className="px-3 py-2 tabular-nums">
                  {c.rupeeAmount != null ? paiseToRupees(c.rupeeAmount) : "—"}
                </td>
              )}
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
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
        <li key={imp.ingredient} className="rounded-2xl border border-border p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div className="font-medium">{imp.ingredient}</div>
            <div className="tabular-nums text-sm text-muted">
              ~{imp.sharePctOfProduct}% of MRP
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {imp.likelyCountries.map((c) => (
              <span
                key={c.code}
                className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5"
              >
                {flagFor(c.code)} {c.name}
                <span className="text-muted">{c.probabilityPct}%</span>
              </span>
            ))}
          </div>
          {imp.notes && <div className="mt-2 text-xs text-muted">{imp.notes}</div>}
        </li>
      ))}
    </ul>
  );
}

function SourcesList({ template }: { template: CategoryTemplate }) {
  return (
    <details className="mt-4 rounded-2xl border border-border px-4 py-3">
      <summary className="cursor-pointer text-sm font-medium text-muted">
        Sources ({template.sources.length})
      </summary>
      <ul className="mt-3 space-y-2 text-sm">
        {template.sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:underline"
            >
              {s.title}
            </a>
            <span className="ml-2 text-xs text-muted">{s.relevance}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function HeroMarkdown({ content }: { content: string }) {
  return (
    <article className="hero-md text-sm leading-relaxed text-muted">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
