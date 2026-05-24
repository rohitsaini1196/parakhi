"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { T, FLAGS } from "@/lib/parakhi-tokens";

// ─── Narrow-viewport hook (for inline-style responsive switches) ─────
export function useIsNarrow(maxWidth = 760) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [maxWidth]);
  return narrow;
}

// ─── Count-up number ─────────────────────────────────────────────────
export function CountUp({
  to,
  duration = 1600,
  decimals = 0,
  suffix = "",
}: {
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}) {
  const [v, setV] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setV(to);
      return;
    }
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(eased * to);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [to, duration]);
  return (
    <>
      {v.toFixed(decimals)}
      {suffix}
    </>
  );
}

// ─── Big number with rupee/percent glyph ─────────────────────────────
export function BigNumber({
  value,
  suffix = "%",
  size = "mega",
  italic = true,
  color,
}: {
  value: number;
  suffix?: string;
  size?: keyof typeof T.scale;
  italic?: boolean;
  color?: string;
}) {
  return (
    <span
      style={{
        fontFamily: T.fontDisplay,
        fontSize: T.scale[size],
        lineHeight: 0.85,
        fontStyle: italic ? "italic" : "normal",
        color: color ?? T.ink,
        letterSpacing: "-0.04em",
        display: "inline-flex",
        alignItems: "baseline",
      }}
    >
      <CountUp to={value} duration={1800} />
      <span
        style={{
          fontStyle: "normal",
          fontSize: "0.45em",
          marginLeft: ".05em",
          color: T.inkDim,
        }}
      >
        {suffix}
      </span>
    </span>
  );
}

// ─── Eyebrow ─────────────────────────────────────────────────────────
export function Eyebrow({
  children,
  color = T.inkDim,
  style = {},
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: T.fontMono,
        fontSize: 11,
        letterSpacing: ".18em",
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Wordmark ────────────────────────────────────────────────────────
export function Wordmark({ size = 28, color }: { size?: number; color?: string }) {
  return (
    <span
      style={{
        fontFamily: T.fontDisplay,
        fontSize: size,
        lineHeight: 1,
        color: color ?? T.ink,
        letterSpacing: "-0.01em",
        fontStyle: "italic",
      }}
    >
      par<span style={{ fontStyle: "normal" }}>a</span>khi
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          marginLeft: 4,
          borderRadius: 999,
          background: T.india,
          verticalAlign: "middle",
        }}
      />
    </span>
  );
}

// ─── Money split bar ─────────────────────────────────────────────────
export function MoneyBar({
  india,
  tax,
  abroad,
  height = 18,
}: {
  india: number;
  tax: number;
  abroad: number;
  height?: number;
}) {
  const total = india + tax + abroad || 1;
  const a = (india / total) * 100;
  const b = (tax / total) * 100;
  const c = (abroad / total) * 100;
  const [played, setPlayed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPlayed(true), 60);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height,
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: `inset 0 0 0 1px ${T.line}`,
        background: T.bgInk,
      }}
    >
      <div
        style={{
          width: played ? `${a}%` : "0%",
          background: T.india,
          backgroundImage: `repeating-linear-gradient(45deg, transparent 0 8px, oklch(0.78 0.14 145 / 0.18) 8px 9px)`,
          transition: "width 1.2s cubic-bezier(.2,.7,.2,1)",
        }}
      />
      <div
        style={{
          width: played ? `${b}%` : "0%",
          background: T.tax,
          backgroundImage: `repeating-linear-gradient(45deg, transparent 0 6px, oklch(0.88 0.14 85 / 0.22) 6px 7px)`,
          transition: "width 1.2s 0.1s cubic-bezier(.2,.7,.2,1)",
        }}
      />
      <div
        style={{
          width: played ? `${c}%` : "0%",
          background: T.abroad,
          backgroundImage: `repeating-linear-gradient(45deg, transparent 0 6px, oklch(0.84 0.16 32 / 0.25) 6px 7px)`,
          transition: "width 1.2s 0.2s cubic-bezier(.2,.7,.2,1)",
        }}
      />
    </div>
  );
}

// ─── Confidence pill ─────────────────────────────────────────────────
export function Confidence({ level }: { level: "high" | "medium" | "low" }) {
  const dots = { high: 3, medium: 2, low: 1 }[level] ?? 0;
  const label = {
    high: "High confidence",
    medium: "Medium confidence",
    low: "Low confidence",
  }[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: T.fontMono,
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: ".08em",
        color: T.inkDim,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ display: "inline-flex", gap: 2 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: 1,
              background: i < dots ? T.india : T.lineSoft,
            }}
          />
        ))}
      </span>
      {label}
    </span>
  );
}

// ─── Source tier chip ────────────────────────────────────────────────
export function TierChip({ tier }: { tier: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: T.fontMono,
        fontSize: 10,
        letterSpacing: ".05em",
        padding: "2px 7px",
        borderRadius: 2,
        whiteSpace: "nowrap",
        border: `1px solid ${T.line}`,
        color: T.inkDim,
      }}
    >
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: 999,
          background: tier === 1 ? T.india : tier === 2 ? T.tax : T.abroad,
        }}
      />
      T{tier}
    </span>
  );
}

// ─── Fold marker ─────────────────────────────────────────────────────
export function FoldMarker({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
      <span
        style={{
          fontFamily: T.fontDisplay,
          fontStyle: "italic",
          fontSize: 56,
          lineHeight: 0.9,
          color: T.inkFaint,
        }}
      >
        {n}
      </span>
      <Eyebrow>{label}</Eyebrow>
    </div>
  );
}

// ─── As-of stamp ─────────────────────────────────────────────────────
export function AsOf({ date }: { date: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        fontFamily: T.fontMono,
        fontSize: 10,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: T.inkDim,
      }}
    >
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: 999,
          background: T.india,
          boxShadow: `0 0 8px ${T.india}`,
        }}
      />
      as of {date} · numbers move
    </span>
  );
}

// ─── Origin pill ─────────────────────────────────────────────────────
export function OriginPill({ origin }: { origin: string }) {
  const isTax = origin === "TAX";
  const isIN = origin === "IN";
  const color = isTax ? T.tax : isIN ? T.india : T.abroad;
  const label = isTax
    ? "Tax · India"
    : isIN
      ? "🇮🇳 India"
      : `${FLAGS[origin] ?? "🌍"} ${origin}`;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: T.fontMono,
        fontSize: 10,
        letterSpacing: ".08em",
        color,
        padding: "2px 7px",
        border: `1px solid ${color}`,
        borderRadius: 2,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
