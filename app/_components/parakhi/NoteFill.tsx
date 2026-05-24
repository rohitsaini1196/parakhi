"use client";

import { useEffect, useState } from "react";
import { T } from "@/lib/parakhi-tokens";

/**
 * The signature visual: an outline of a ₹ note that fills L→R —
 * India green floods most of it, a turmeric-gold tax sliver, a coral abroad
 * tail. Ported from the design handoff (signature-visuals.jsx).
 */
export function NoteFill({
  split,
  ivc,
}: {
  split: { india: number; tax: number; abroad: number };
  ivc: number;
}) {
  const total = split.india + split.tax + split.abroad || 1;
  const a = (split.india / total) * 100;
  const b = (split.tax / total) * 100;
  const c = (split.abroad / total) * 100;
  const [played, setPlayed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPlayed(true), 60);
    return () => clearTimeout(t);
  }, []);

  const W = 780;
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg viewBox="0 0 800 360" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <pattern id="engr" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M0 6 L6 0" stroke="oklch(1 0 0 / 0.10)" strokeWidth="0.4" />
          </pattern>
          <pattern id="engrIndia" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M0 5 L5 0 M-1 1 L1 -1 M4 6 L6 4" stroke="oklch(0.40 0.07 145 / 0.5)" strokeWidth="0.35" />
          </pattern>
          <clipPath id="noteClip">
            <rect x="10" y="20" width="780" height="320" rx="6" />
          </clipPath>
        </defs>

        <rect x="10" y="20" width="780" height="320" rx="6" fill={T.bgInk} stroke={T.line} strokeWidth="1.2" />

        <g clipPath="url(#noteClip)">
          <rect x="10" y="20" width={played ? (W * a) / 100 : 0} height="320" fill={T.india}
            style={{ transition: "width 1.8s cubic-bezier(.2,.7,.2,1)" }} />
          <rect x="10" y="20" width={played ? (W * a) / 100 : 0} height="320" fill="url(#engrIndia)"
            style={{ transition: "width 1.8s cubic-bezier(.2,.7,.2,1)" }} />
          <rect x={10 + (W * a) / 100} y="20" width={played ? (W * b) / 100 : 0} height="320" fill={T.tax}
            style={{ transition: "width 1.8s 0.1s cubic-bezier(.2,.7,.2,1)" }} />
          <rect x={10 + (W * (a + b)) / 100} y="20" width={played ? (W * c) / 100 : 0} height="320" fill={T.abroad}
            style={{ transition: "width 1.8s 0.2s cubic-bezier(.2,.7,.2,1)" }} />

          <g opacity="0.18" stroke="oklch(1 0 0)" fill="none">
            <circle cx="640" cy="180" r="105" strokeWidth="0.8" />
            <circle cx="640" cy="180" r="80" strokeWidth="0.5" />
            <circle cx="640" cy="180" r="55" strokeWidth="0.4" />
            <circle cx="640" cy="180" r="35" strokeWidth="0.3" />
          </g>

          <text x="640" y="215" textAnchor="middle" fontFamily="var(--font-display), serif"
            fontStyle="italic" fontSize="120" fill="oklch(1 0 0 / 0.15)" stroke="oklch(1 0 0 / 0.25)" strokeWidth="0.6">₹</text>

          <rect x="10" y="20" width="780" height="320" fill="url(#engr)" />

          <text x="34" y="56" fontFamily="var(--font-display), serif" fontStyle="italic" fontSize="28" fill="oklch(1 0 0 / 0.45)">{ivc}</text>
          <text x="766" y="320" textAnchor="end" fontFamily="var(--font-display), serif" fontStyle="italic" fontSize="28" fill="oklch(1 0 0 / 0.45)">{ivc}</text>

          <text x="180" y="200" fontFamily="var(--font-display), serif" fontStyle="italic" fontSize="64"
            fill="oklch(1 0 0 / 0.12)" letterSpacing="-2">parakhi</text>

          <g fontFamily="var(--font-mono), monospace" fontSize="10" fill="oklch(1 0 0 / 0.7)" letterSpacing="0.06em">
            {a > 8 && <text x={10 + (W * a) / 200} y="332" textAnchor="middle">INDIA · {Math.round(a)}%</text>}
            {b > 6 && <text x={10 + (W * (a + b / 2)) / 100} y="332" textAnchor="middle">TAX · {Math.round(b)}%</text>}
            {c > 6 && <text x={10 + (W * (a + b + c / 2)) / 100} y="332" textAnchor="middle">ABROAD · {Math.round(c)}%</text>}
          </g>

          <line x1={10 + (W * a) / 100} y1="30" x2={10 + (W * a) / 100} y2="330" stroke="oklch(1 0 0 / 0.25)" strokeWidth="1" strokeDasharray="2 3" />
          <line x1={10 + (W * (a + b)) / 100} y1="30" x2={10 + (W * (a + b)) / 100} y2="330" stroke="oklch(1 0 0 / 0.25)" strokeWidth="1" strokeDasharray="2 3" />
        </g>

        <rect x="14" y="24" width="772" height="312" rx="4" fill="none" stroke="oklch(1 0 0 / 0.15)" strokeWidth="0.5" strokeDasharray="1 2" />
      </svg>
    </div>
  );
}
