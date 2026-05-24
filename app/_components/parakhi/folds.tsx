"use client";

import { useState } from "react";
import Link from "next/link";
import { T, FLAGS, type DesignProduct, type DesignComponent, type DesignImport } from "@/lib/parakhi-tokens";
import {
  BigNumber,
  Eyebrow,
  Wordmark,
  MoneyBar,
  Confidence,
  TierChip,
  FoldMarker,
  AsOf,
  OriginPill,
  useIsNarrow,
} from "./atoms";
import { NoteFill } from "./NoteFill";

const PAD = "clamp(28px, 6vw, 80px)";

function colorFor(origin: string) {
  return origin === "TAX" ? T.tax : origin === "IN" ? T.india : T.abroad;
}

// ─── FOLD 1 — the gut punch ──────────────────────────────────────────
export function Fold1({ product }: { product: DesignProduct }) {
  return (
    <section
      style={{
        background: T.bg,
        color: T.ink,
        padding: `clamp(24px,5vw,56px) ${PAD} clamp(40px,5vw,64px)`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, flexWrap: "wrap", gap: 12 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Wordmark size={22} />
        </Link>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Eyebrow>{product.category}</Eyebrow>
          <AsOf date={product.asOf} />
        </div>
      </header>

      <div style={{ marginBottom: 24 }}>
        <Eyebrow style={{ color: T.inkFaint, marginBottom: 6 }}>analysing</Eyebrow>
        <div style={{ fontFamily: T.fontDisplay, fontSize: "clamp(28px,5vw,38px)", fontStyle: "italic", letterSpacing: "-0.02em" }}>
          {product.brand}
        </div>
        <div style={{ color: T.inkDim, fontSize: 14, marginTop: 4, letterSpacing: "0.02em" }}>
          {product.variant}
          {product.mrp != null && (
            <>
              {" · MRP "}
              <span style={{ color: T.ink }}>₹{product.mrp}</span>
            </>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <BigStack product={product} />
        <div style={{ width: "100%", maxWidth: 560 }}>
          <NoteFill split={product.split} ivc={product.ivc} />
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 28 }}>
        <Eyebrow style={{ color: T.inkFaint }}>where does it go &nbsp;↓</Eyebrow>
      </div>
    </section>
  );
}

function BigStack({ product }: { product: DesignProduct }) {
  const zones: [string, string, number][] = [
    ["INDIA", T.india, product.split.india],
    ["TAX", T.tax, product.split.tax],
    ["ABROAD", T.abroad, product.split.abroad],
  ];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
        <BigNumber value={product.ivc} suffix="%" size="mega" italic />
        <div style={{ paddingTop: 18 }}>
          <Eyebrow style={{ color: T.inkFaint, marginBottom: 6 }}>Indian Value Capture</Eyebrow>
          <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: "clamp(26px,4vw,36px)", lineHeight: 1.05, color: T.ink, maxWidth: 320, letterSpacing: "-0.02em" }}>
            {product.verdict}.
          </div>
        </div>
      </div>
      <MoneyBar india={product.split.india} tax={product.split.tax} abroad={product.split.abroad} height={26} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, gap: 12, flexWrap: "wrap" }}>
        {zones.map(([label, color, pctv]) => (
          <div key={label}>
            <div style={{ fontFamily: T.fontMono, fontSize: 10, color, letterSpacing: "0.15em" }}>● {label}</div>
            {product.mrp != null && (
              <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 22 }}>
                ₹{((product.mrp * pctv) / 100).toFixed(0)}
              </div>
            )}
            <div style={{ fontSize: 11, color: T.inkDim }}>{pctv}% of MRP</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FOLD 2 — where does it go ───────────────────────────────────────
export function Fold2({ product }: { product: DesignProduct }) {
  const sorted = [...product.components].sort((a, b) => b.pct - a.pct);
  return (
    <section style={{ background: T.bgRaised, color: T.ink, padding: `clamp(56px,9vw,100px) ${PAD}`, borderTop: `1px solid ${T.line}` }}>
      <FoldMarker n="02" label="Where does it go?" />
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(34px,6vw,56px)", fontStyle: "italic", marginTop: 12, maxWidth: 700, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
        {product.mrp != null ? `Every rupee of your ₹${product.mrp}, sliced.` : "Every rupee, sliced."}
      </h2>
      <p style={{ color: T.inkDim, marginTop: 14, fontSize: 16, maxWidth: 540, lineHeight: 1.5 }}>
        Hover a slice for the source. Every line is dated, sourced, and rated for confidence.
      </p>
      <div style={{ marginTop: 40 }}>
        <SegmentedBreakdown components={sorted} />
      </div>
      <div style={{ marginTop: 48, overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.5fr 0.6fr 0.7fr 1fr", rowGap: 0, fontSize: 14, columnGap: 16, minWidth: 560 }}>
          <div style={{ display: "contents", color: T.inkFaint, fontFamily: T.fontMono }}>
            {["Item", "%", "₹", "Origin", "Confidence"].map((h) => (
              <div key={h} style={{ padding: "10px 0", borderBottom: `1px solid ${T.line}`, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em" }}>{h}</div>
            ))}
          </div>
          {sorted.map((c, i) => (
            <BreakdownRow key={i} c={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SegmentedBreakdown({ components }: { components: DesignComponent[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div>
      <div style={{ position: "relative", height: 56, display: "flex", borderRadius: 3, overflow: "hidden", boxShadow: `inset 0 0 0 1px ${T.line}` }}>
        {components.map((c, i) => {
          const isFaint = hovered != null && hovered !== i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setHovered(i)}
              style={{
                width: `${c.pct}%`,
                background: colorFor(c.origin),
                opacity: isFaint ? 0.35 : 1,
                borderRight: `1px solid ${T.bgInk}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: T.fontMono,
                fontSize: 10,
                color: T.bgInk,
                letterSpacing: "0.06em",
                cursor: "default",
                transition: "opacity .2s",
              }}
            >
              {c.pct >= 7 ? `${c.pct}%` : ""}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 18, minHeight: 56, fontSize: 13 }}>
        {hovered != null ? (
          <div style={{ display: "flex", gap: 24, alignItems: "baseline", flexWrap: "wrap" }}>
            <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 28, letterSpacing: "-0.02em" }}>
              {components[hovered]!.name}
            </div>
            <div style={{ color: T.inkDim }}>
              <span style={{ fontFamily: T.fontMono, fontSize: 12, color: T.ink }}>{components[hovered]!.pct}%</span>
              {components[hovered]!.rupees != null && (
                <>
                  <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
                  <span style={{ fontFamily: T.fontMono, fontSize: 12, color: T.ink }}>₹{components[hovered]!.rupees!.toFixed(2)}</span>
                </>
              )}
              <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
              <OriginPill origin={components[hovered]!.origin} />
              <span style={{ marginLeft: 12 }}>
                <Confidence level={components[hovered]!.confidence} />
              </span>
            </div>
            {components[hovered]!.note && (
              <div style={{ color: T.inkDim, maxWidth: 420, fontSize: 13, lineHeight: 1.5 }}>{components[hovered]!.note}</div>
            )}
          </div>
        ) : (
          <div style={{ color: T.inkFaint, fontFamily: T.fontMono, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            hover a slice to inspect
          </div>
        )}
      </div>
    </div>
  );
}

function BreakdownRow({ c }: { c: DesignComponent }) {
  return (
    <>
      <div style={{ padding: "12px 0", borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, background: colorFor(c.origin), borderRadius: 1 }} />
        {c.name}
      </div>
      <div style={{ padding: "12px 0", borderBottom: `1px solid ${T.line}`, fontFamily: T.fontMono, fontSize: 12, color: T.ink }}>{c.pct}%</div>
      <div style={{ padding: "12px 0", borderBottom: `1px solid ${T.line}`, fontFamily: T.fontMono, fontSize: 12, color: T.inkDim }}>
        {c.rupees != null ? `₹${c.rupees.toFixed(2)}` : "—"}
      </div>
      <div style={{ padding: "12px 0", borderBottom: `1px solid ${T.line}` }}><OriginPill origin={c.origin} /></div>
      <div style={{ padding: "12px 0", borderBottom: `1px solid ${T.line}` }}>
        <Confidence level={c.confidence} /> <span style={{ marginLeft: 8 }}><TierChip tier={c.tier} /></span>
      </div>
    </>
  );
}

// ─── FOLD 3 — the catch ──────────────────────────────────────────────
export function Fold3({ product }: { product: DesignProduct }) {
  const narrow = useIsNarrow();
  if (!product.imports.length) return null;
  return (
    <section style={{ background: T.bg, color: T.ink, padding: `clamp(48px,8vw,90px) ${PAD}`, borderTop: `1px solid ${T.line}` }}>
      <FoldMarker n="03" label="The catch" />
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(30px,6vw,56px)", fontStyle: "italic", marginTop: 12, maxWidth: 740, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
        {product.catch ?? `The ${product.split.abroad}% that didn't stay home.`}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "minmax(0,1.1fr) minmax(0,0.9fr)", gap: narrow ? 28 : 40, marginTop: 40, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {product.imports.map((imp, i) => (
            <div key={i} style={{ padding: "18px 0", borderTop: `1px solid ${T.line}`, display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "center" }}>
              <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: "clamp(40px,9vw,56px)", color: T.abroad, letterSpacing: "-0.04em", lineHeight: 1, minWidth: 70 }}>
                {imp.pct}
                <span style={{ fontSize: 22, color: T.inkDim, marginLeft: 2 }}>%</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 17, marginBottom: 6 }}>{imp.input}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {imp.countries.map((co, j) => (
                    <span key={j} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", border: `1px solid ${T.lineSoft}`, borderRadius: 2, fontFamily: T.fontMono, fontSize: 10, letterSpacing: "0.04em", color: T.inkDim, whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 13 }}>{FLAGS[co.code] ?? "🏳️"}</span>
                      {co.name} · {co.prob}%
                    </span>
                  ))}
                </div>
                {imp.note && <div style={{ color: T.inkFaint, fontSize: 12, marginTop: 8, maxWidth: 380, lineHeight: 1.5 }}>{imp.note}</div>}
              </div>
            </div>
          ))}
        </div>
        {!narrow && (
          <div>
            <FlowMap product={product} />
          </div>
        )}
      </div>
    </section>
  );
}

function FlowMap({ product }: { product: DesignProduct }) {
  const imports = product.imports;
  return (
    <svg viewBox="0 0 600 360" style={{ width: "100%", display: "block" }}>
      <defs>
        <radialGradient id="indiaBlob" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={T.india} stopOpacity="0.95" />
          <stop offset="80%" stopColor={T.india} stopOpacity="0.7" />
          <stop offset="100%" stopColor={T.indiaSoft} stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <g transform="translate(170, 180)">
        <path
          d="M -10,-110 C 30,-130 60,-115 75,-90 C 95,-80 110,-50 100,-20 C 120,10 115,55 80,80 C 70,110 30,135 -10,128 C -55,140 -90,110 -85,75 C -120,55 -125,15 -100,-15 C -120,-50 -90,-95 -50,-100 C -45,-115 -25,-118 -10,-110 Z"
          fill="url(#indiaBlob)"
          stroke={T.india}
          strokeWidth="0.8"
        />
        <text x="0" y="-10" textAnchor="middle" fontFamily="var(--font-display), serif" fontStyle="italic" fontSize="56" fill="oklch(0.20 0.06 145)" letterSpacing="-2">{product.ivc}%</text>
        <text x="0" y="20" textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize="9" fill="oklch(0.20 0.06 145)" letterSpacing="0.2em">STAYS HOME</text>
      </g>
      {imports.map((imp, i) => {
        const yBase = 56 + i * (250 / Math.max(imports.length, 1));
        const country = imp.countries[0];
        const dest = (country?.name ?? "").length > 11 ? country!.code : (country?.name ?? "").toUpperCase();
        const label = imp.input.length > 18 ? imp.input.slice(0, 17) + "…" : imp.input;
        return (
          <g key={i}>
            <path d={`M 240,180 Q 360,${yBase + 20} 452,${yBase}`} fill="none" stroke={T.abroad} strokeWidth={Math.max(2, imp.pct * 0.4)} strokeOpacity="0.5" strokeDasharray="4 6" style={{ animation: "flowDash 1.6s linear infinite" }} />
            <g transform={`translate(452, ${yBase})`}>
              <rect x="-4" y="-18" width="148" height="36" fill={T.abroad} fillOpacity="0.12" stroke={T.abroad} strokeOpacity="0.5" rx="2" />
              <text x="6" y="-3" fontFamily="var(--font-mono), monospace" fontSize="10" fill={T.abroad} letterSpacing="0.08em">{imp.pct}% · {dest}</text>
              <text x="6" y="12" fontFamily="var(--font-body), sans-serif" fontSize="9" fill="oklch(0.85 0.04 32)" opacity="0.85">{label}</text>
            </g>
            <circle cx="240" cy="180" r="3" fill={T.abroad} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── FOLD 4 — how we know ────────────────────────────────────────────
export function Fold4({ product }: { product: DesignProduct }) {
  const sources = product.sources;
  const tierCount: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  sources.forEach((s) => (tierCount[s.tier] = (tierCount[s.tier] ?? 0) + 1));
  const tiers = [
    { tier: 1, label: "Hard government data", desc: "GST notifications, import data, tariffs", color: T.india },
    { tier: 2, label: "Verified industry", desc: "Company filings, audited reports", color: T.tax },
    { tier: 3, label: "Modelled estimate", desc: "Industry benchmarks + ratios", color: T.abroad },
    { tier: 4, label: "Honest guess", desc: "Best informed estimate; flagged as such", color: T.inkFaint },
  ];
  return (
    <section style={{ background: T.bgInk, color: T.ink, padding: `clamp(56px,9vw,100px) ${PAD}`, borderTop: `1px solid ${T.line}` }}>
      <FoldMarker n="04" label="How we know" />
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(34px,6vw,56px)", fontStyle: "italic", marginTop: 12, maxWidth: 700, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
        The receipts.
      </h2>
      <p style={{ color: T.inkDim, marginTop: 14, fontSize: 16, maxWidth: 540, lineHeight: 1.5 }}>
        Every number is sourced and tiered. We grade our own confidence so you don&apos;t have to take our word for it.
      </p>
      <div style={{ marginTop: 40, display: "flex", gap: 20, flexWrap: "wrap" }}>
        {tiers.map((t) => (
          <div key={t.tier} style={{ flex: "1 1 200px", maxWidth: 280, padding: "18px 22px", border: `1px solid ${T.line}`, borderRadius: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontFamily: T.fontMono, fontSize: 11, color: t.color, letterSpacing: "0.12em" }}>TIER {t.tier}</span>
              <span style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 26 }}>{tierCount[t.tier] ?? 0}</span>
            </div>
            <div style={{ fontSize: 14, color: T.ink }}>{t.label}</div>
            <div style={{ fontSize: 11, color: T.inkDim, marginTop: 4 }}>{t.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 48 }}>
        <Eyebrow style={{ marginBottom: 16 }}>Sources used for this product</Eyebrow>
        {sources.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "baseline", padding: "14px 0", borderTop: i === 0 ? `1px solid ${T.line}` : "none", borderBottom: `1px solid ${T.line}` }}>
            <TierChip tier={s.tier} />
            {s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: T.ink, textDecoration: "none", borderBottom: `1px solid ${T.line}` }}>{s.title}</a>
            ) : (
              <div style={{ fontSize: 14 }}>{s.title}</div>
            )}
            <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkDim }}>{s.ref}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 48, padding: "32px 36px", background: T.bg, border: `1px solid ${T.line}`, borderRadius: 4, display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 280px" }}>
          <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 26, letterSpacing: "-0.02em", maxWidth: 480 }}>
            Found a mistake? <span style={{ color: T.india }}>Help us fix it.</span>
          </div>
          <div style={{ color: T.inkDim, fontSize: 14, marginTop: 10, maxWidth: 480, lineHeight: 1.5 }}>
            Parakhi is open-source and the methodology is public. Send a correction or sources.
          </div>
        </div>
        <Link href={`/feedback?productId=${product.slug}`} style={{ padding: "12px 22px", background: T.ink, color: T.bg, border: "none", borderRadius: 2, fontFamily: T.fontMono, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none" }}>
          contribute →
        </Link>
      </div>
    </section>
  );
}

// ─── Hero story + shrinkflation ──────────────────────────────────────
export function HeroStory({ product }: { product: DesignProduct }) {
  if (!product.longform) return null;
  const lf = product.longform;
  return (
    <section style={{ background: T.bg, color: T.ink, padding: `clamp(64px,10vw,120px) ${PAD}`, borderTop: `1px solid ${T.line}` }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <FoldMarker n="05" label="The story" />
        <h2 style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: "clamp(34px,6vw,56px)", letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 18, maxWidth: 640 }}>
          {lf.kicker}
        </h2>
        <div style={{ marginTop: 36, color: T.ink, fontSize: 18, lineHeight: 1.7 }}>
          {lf.body.map((p, i) => (
            <p key={i} style={{ marginBottom: 22 }}>{p}</p>
          ))}
        </div>
        {product.shrinkflation && <Shrinkflation data={product.shrinkflation} />}
      </div>
    </section>
  );
}

function Shrinkflation({ data }: { data: { year: number; weight: number; price: number }[] }) {
  const maxW = Math.max(...data.map((d) => d.weight));
  const maxP = Math.max(...data.map((d) => d.price));
  return (
    <div style={{ marginTop: 60, padding: "32px 0", borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
      <Eyebrow style={{ marginBottom: 18 }}>Shrinkflation</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: 8, alignItems: "flex-end", height: 200 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
            <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.inkDim }}>{d.weight}g</div>
            <div style={{ width: "100%", height: `${(d.weight / maxW) * 140}px`, background: T.india, opacity: 0.85 }} />
            <div style={{ height: 1, width: "100%", background: T.line }} />
            <div style={{ width: "70%", height: `${(d.price / maxP) * 26}px`, background: T.tax }} />
            <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.inkFaint }}>{d.year}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 18, fontFamily: T.fontMono, fontSize: 10, color: T.inkDim, letterSpacing: "0.1em" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: T.india, marginRight: 5, verticalAlign: "-1px" }} />WEIGHT (g)</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: T.tax, marginRight: 5, verticalAlign: "-1px" }} />STICKER PRICE (₹)</span>
      </div>
    </div>
  );
}

// ─── Next products (the addictive loop) ──────────────────────────────
export function NextProducts({ items }: { items: { slug: string; brand: string; category: string; ivc: number; split: { india: number; tax: number; abroad: number } }[] }) {
  if (!items.length) return null;
  return (
    <section style={{ background: T.bgInk, color: T.ink, padding: `64px ${PAD} 100px`, borderTop: `1px solid ${T.line}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28, flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 32, letterSpacing: "-0.02em" }}>Now check…</h3>
        <Eyebrow>jump anywhere · the addictive bit</Eyebrow>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {items.map((p) => (
          <Link key={p.slug} href={`/p/${p.slug}`} style={{ border: `1px solid ${T.line}`, padding: "20px 22px", borderRadius: 3, background: T.bg, textDecoration: "none", color: T.ink }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 22 }}>{p.brand}</div>
              <div style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 28, color: p.ivc >= 85 ? T.india : p.ivc >= 70 ? T.tax : T.abroad }}>{p.ivc}%</div>
            </div>
            <div style={{ color: T.inkDim, fontSize: 12, marginTop: 4 }}>{p.category}</div>
            <div style={{ marginTop: 14 }}>
              <MoneyBar india={p.split.india} tax={p.split.tax} abroad={p.split.abroad} height={6} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
