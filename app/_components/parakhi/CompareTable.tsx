"use client";

import { T, type DesignProduct } from "@/lib/parakhi-tokens";
import { BigNumber, Eyebrow, MoneyBar, useIsNarrow } from "./atoms";

// IVC gaps this small sit inside our margin — don't crown a "winner".
const TIE_THRESHOLD = 3;

function ivcColor(ivc: number) {
  return ivc >= 85 ? T.india : ivc >= 70 ? T.tax : T.abroad;
}

export function CompareTable({ products }: { products: DesignProduct[] }) {
  const narrow = useIsNarrow();
  const cols = products.length; // 1 or 2
  const tiedIvc =
    cols === 2 && Math.abs(products[0]!.ivc - products[1]!.ivc) <= TIE_THRESHOLD;

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: cols === 2 ? 520 : 280 }}>
        {/* Header cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `var(--label-col, 150px) repeat(${cols}, 1fr)`,
            gap: 0,
            ["--label-col" as string]: narrow ? "92px" : "150px",
          }}
        >
          <div /> {/* empty label cell */}
          {products.map((p) => (
            <div
              key={p.slug}
              style={{
                border: `1px solid ${T.line}`,
                borderRadius: 3,
                background: T.bgRaised,
                padding: narrow ? "16px 14px" : "22px 20px",
                margin: 4,
              }}
            >
              <Eyebrow style={{ color: T.inkFaint, fontSize: 9, marginBottom: 6 }}>
                {p.category}
              </Eyebrow>
              <div
                style={{
                  fontFamily: T.fontDisplay,
                  fontStyle: "italic",
                  fontSize: narrow ? 18 : 22,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  minHeight: narrow ? 40 : 50,
                }}
              >
                {p.brand}
              </div>
              <div style={{ color: T.inkDim, fontSize: 12, marginTop: 4 }}>
                {p.mrp != null ? `MRP ₹${p.mrp}` : "MRP —"}
              </div>
              <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 8 }}>
                <BigNumber
                  value={p.ivc}
                  suffix="%"
                  size="h2"
                  color={tiedIvc ? T.ink : ivcColor(p.ivc)}
                />
              </div>
              <div
                style={{
                  fontFamily: T.fontDisplay,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: T.inkDim,
                  marginTop: 2,
                }}
              >
                {p.verdict}
              </div>
              <div style={{ marginTop: 14 }}>
                <MoneyBar india={p.split.india} tax={p.split.tax} abroad={p.split.abroad} height={10} />
              </div>
            </div>
          ))}
        </div>

        {/* Metric rows */}
        <div style={{ marginTop: 18 }}>
          <MetricRow
            label="Indian Value Capture"
            products={products}
            value={(p) => p.ivc}
            suffix="%"
            higherIsBetter
            neutral={tiedIvc}
            narrow={narrow}
          />
          <MetricRow
            label="Composition (MII)"
            products={products}
            value={(p) => p.composition}
            suffix="%"
            higherIsBetter
            narrow={narrow}
          />
          <SplitRow products={products} narrow={narrow} />
          <MetricRow
            label="GST / tax"
            products={products}
            value={(p) => p.split.tax}
            suffix="%"
            higherIsBetter={false}
            narrow={narrow}
          />
          <MetricRow
            label="Goes abroad"
            products={products}
            value={(p) => p.split.abroad}
            suffix="%"
            higherIsBetter={false}
            narrow={narrow}
          />
          <MetricRow
            label="Hard-sourced"
            products={products}
            value={(p) => p.sourcedShare}
            suffix="% T1–2"
            higherIsBetter
            narrow={narrow}
          />
        </div>
      </div>
    </div>
  );
}

function rowGrid(cols: number, narrow: boolean) {
  return {
    display: "grid",
    gridTemplateColumns: `${narrow ? 92 : 150}px repeat(${cols}, 1fr)`,
    alignItems: "center",
    borderBottom: `1px solid ${T.line}`,
  } as const;
}

function MetricRow({
  label,
  products,
  value,
  suffix,
  higherIsBetter,
  neutral = false,
  narrow,
}: {
  label: string;
  products: DesignProduct[];
  value: (p: DesignProduct) => number;
  suffix: string;
  higherIsBetter: boolean;
  neutral?: boolean;
  narrow: boolean;
}) {
  const vals = products.map(value);
  // Winner index only when two products with a real gap.
  let winner = -1;
  if (!neutral && products.length === 2 && vals[0] !== vals[1]) {
    const better = higherIsBetter
      ? Math.max(vals[0]!, vals[1]!)
      : Math.min(vals[0]!, vals[1]!);
    winner = vals[0] === better ? 0 : 1;
  }
  return (
    <div style={rowGrid(products.length, narrow)}>
      <div
        style={{
          fontFamily: T.fontMono,
          fontSize: narrow ? 9 : 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: T.inkFaint,
          padding: "14px 0",
        }}
      >
        {label}
      </div>
      {products.map((p, i) => (
        <div
          key={p.slug}
          style={{
            padding: "14px 12px",
            fontFamily: T.fontDisplay,
            fontStyle: "italic",
            fontSize: narrow ? 20 : 26,
            color: winner === i ? T.india : winner === -1 ? T.ink : T.inkDim,
          }}
        >
          {vals[i]}
          <span style={{ fontFamily: T.fontMono, fontSize: 11, fontStyle: "normal", color: T.inkDim, marginLeft: 3 }}>
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

function SplitRow({ products, narrow }: { products: DesignProduct[]; narrow: boolean }) {
  return (
    <div style={rowGrid(products.length, narrow)}>
      <div
        style={{
          fontFamily: T.fontMono,
          fontSize: narrow ? 9 : 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: T.inkFaint,
          padding: "14px 0",
        }}
      >
        Money split
      </div>
      {products.map((p) => (
        <div key={p.slug} style={{ padding: "14px 12px" }}>
          <MoneyBar india={p.split.india} tax={p.split.tax} abroad={p.split.abroad} height={8} />
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkDim, marginTop: 6 }}>
            <span style={{ color: T.india }}>{p.split.india}</span>
            {" · "}
            <span style={{ color: T.tax }}>{p.split.tax}</span>
            {" · "}
            <span style={{ color: T.abroad }}>{p.split.abroad}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
