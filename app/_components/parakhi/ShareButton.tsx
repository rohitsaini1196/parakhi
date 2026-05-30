"use client";

import { useState } from "react";
import { T } from "@/lib/parakhi-tokens";

export function ShareButton({ slug, title, ivc }: { slug: string; title: string; ivc: number }) {
  const [copied, setCopied] = useState(false);

  const url = `https://parakhi.in/p/${slug}`;
  const text = `${title} — ${ivc}% Indian Value Capture. Where does your money go? 👇`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  }

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
      <button
        onClick={copyLink}
        style={{
          fontFamily: T.fontMono,
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          padding: "8px 14px",
          border: `1px solid ${T.line}`,
          borderRadius: 2,
          background: "transparent",
          color: copied ? T.india : T.inkDim,
          cursor: "pointer",
          transition: "color 0.2s",
        }}
      >
        {copied ? "✓ copied" : "copy link"}
      </button>
      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          fontFamily: T.fontMono,
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          padding: "8px 14px",
          border: `1px solid ${T.line}`,
          borderRadius: 2,
          color: T.inkDim,
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        share on whatsapp
      </a>
    </div>
  );
}
