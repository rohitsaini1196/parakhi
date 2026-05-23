"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { CostComponent, GstInfo, Import } from "@/lib/schemas";
import { CountUp } from "./CountUp";
import { flagFor, paiseToRupees, verdictWord } from "@/lib/format";

/**
 * The signature visual: where ₹1 of MRP goes, as one animated bar split into
 * three zones — India, Tax (GST), Abroad. The Abroad zone is sub-split by
 * country with flags. Hovering any segment reveals its detail; otherwise the
 * UI stays near-textless.
 */
export function RupeeFlowBar({
  ivc,
  components,
  imports,
  gst,
  mrpInPaise,
}: {
  ivc: number;
  components: CostComponent[];
  imports: Import[];
  gst: GstInfo;
  mrpInPaise: number | null;
}) {
  const abroadPct = clampPct(imports.reduce((s, i) => s + i.sharePctOfProduct, 0));
  const taxPct = clampPct(gst.ratePct);
  const indiaPct = Math.max(0, 100 - abroadPct - taxPct);
  const total = indiaPct + taxPct + abroadPct || 1;

  // Build ordered segments: India (one block), Tax, then each foreign import.
  const segments: Segment[] = [];
  segments.push({
    key: "india",
    kind: "india",
    label: "Stays in India",
    pct: indiaPct,
    color: "var(--india)",
    detail: indiaDetail(components, mrpInPaise),
    flag: "🇮🇳",
  });
  segments.push({
    key: "tax",
    kind: "tax",
    label: `Tax · GST ${gst.ratePct}%`,
    pct: taxPct,
    color: "var(--tax)",
    detail: `Goes to the government as GST. ${
      gst.rupeeAmount != null ? paiseToRupees(gst.rupeeAmount) + " per pack." : ""
    }`,
    flag: "🏛️",
  });
  for (const imp of imports) {
    const top = imp.likelyCountries[0];
    segments.push({
      key: imp.ingredient,
      kind: "abroad",
      label: imp.ingredient,
      pct: clampPct(imp.sharePctOfProduct),
      color: "var(--abroad)",
      detail: `${imp.ingredient} — likely ${imp.likelyCountries
        .map((c) => `${c.name} ${c.probabilityPct}%`)
        .join(", ")}.${imp.notes ? ` ${imp.notes}` : ""}`,
      flag: top ? flagFor(top.code) : "🌍",
    });
  }

  const [hover, setHover] = useState<string | null>(null);
  const active = segments.find((s) => s.key === hover) ?? segments[0]!;

  return (
    <section className="rounded-3xl border border-border bg-surface/60 p-6 sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted">
            Indian Value Capture
          </div>
          <div className="mt-1 font-serif text-7xl font-semibold leading-none tracking-tight text-india">
            <CountUp value={ivc} suffix="%" />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-2 font-serif text-xl italic text-foreground/80"
          >
            {verdictWord(ivc)}
          </motion.div>
        </div>
        <div className="text-right text-xs text-muted">
          of every ₹1
          <br />
          stays in India
        </div>
      </div>

      {/* The bar */}
      <div className="mt-6 flex h-16 w-full gap-1 overflow-hidden rounded-2xl">
        {segments.map((seg, i) => (
          <motion.button
            key={seg.key}
            type="button"
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: `${(seg.pct / total) * 100}%`,
              opacity: 1,
            }}
            transition={{
              duration: 0.9,
              delay: 0.15 + i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            onHoverStart={() => setHover(seg.key)}
            onFocus={() => setHover(seg.key)}
            onClick={() => setHover(seg.key)}
            className="group relative flex h-full min-w-[2px] items-center justify-center"
            style={{ background: seg.color }}
          >
            <motion.span
              className="text-lg drop-shadow"
              animate={{ scale: hover === seg.key ? 1.3 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {seg.pct >= 6 ? seg.flag : ""}
            </motion.span>
            {hover === seg.key && (
              <motion.span
                layoutId="flow-underline"
                className="absolute inset-x-0 bottom-0 h-1 bg-white/80"
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <Legend color="var(--india)" label="India" pct={indiaPct} onHover={() => setHover("india")} />
        <Legend color="var(--tax)" label="Tax" pct={taxPct} onHover={() => setHover("tax")} />
        <Legend color="var(--abroad)" label="Abroad" pct={abroadPct} onHover={() => setHover(imports[0]?.ingredient ?? null)} />
      </div>

      {/* Hover detail */}
      <div className="mt-5 min-h-[3.5rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-border bg-surface-2/70 px-4 py-3"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>{active.flag}</span>
              <span>{active.label}</span>
              <span className="ml-auto tabular-nums text-muted">
                {active.pct.toFixed(1)}% of MRP
              </span>
            </div>
            <div className="mt-1 text-xs leading-relaxed text-muted">
              {active.detail}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

interface Segment {
  key: string;
  kind: "india" | "tax" | "abroad";
  label: string;
  pct: number;
  color: string;
  detail: string;
  flag: string;
}

function Legend({
  color,
  label,
  pct,
  onHover,
}: {
  color: string;
  label: string;
  pct: number;
  onHover: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onFocus={onHover}
      className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-foreground"
    >
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
      <span className="tabular-nums">{pct.toFixed(0)}%</span>
    </button>
  );
}

function indiaDetail(components: CostComponent[], mrpInPaise: number | null): string {
  // Surface the few biggest Indian-side cost buckets, no preamble.
  const top = [...components]
    .filter((c) => !c.label.startsWith("GST"))
    .sort((a, b) => b.sharePct - a.sharePct)
    .slice(0, 4)
    .map((c) => `${c.label} ${c.sharePct.toFixed(0)}%`)
    .join(" · ");
  const rupee = mrpInPaise != null ? ` Of ${paiseToRupees(mrpInPaise)} MRP.` : "";
  return `Value reaching Indian producers, workers, and retailers. ${top}.${rupee}`;
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, n));
}
