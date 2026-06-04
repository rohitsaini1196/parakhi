"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/parakhi-tokens";

interface ProductHit {
  slug: string;
  brand: string;
  name: string;
  variant: string | null;
  ivc: number | null;
}

export interface Selected {
  slug: string;
  title: string;
}

function urlFor(slugs: string[]): string {
  const p = new URLSearchParams();
  if (slugs[0]) p.set("a", slugs[0]);
  if (slugs[1]) p.set("b", slugs[1]);
  const qs = p.toString();
  return qs ? `/compare?${qs}` : "/compare";
}

export function ComparePicker({ selected }: { selected: Selected[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [hits, setHits] = useState<ProductHit[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const slugs = selected.map((s) => s.slug);
  const full = slugs.length >= 2;

  // Debounced autocomplete (reuses the search endpoint).
  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data = await res.json();
        setHits(data.products ?? []);
        setOpen(true);
      } catch {
        /* ignore autocomplete errors */
      }
    }, 180);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function add(slug: string) {
    if (slugs.includes(slug) || full) return;
    router.push(urlFor([...slugs, slug]));
    setValue("");
    setHits([]);
    setOpen(false);
  }

  function remove(slug: string) {
    router.push(urlFor(slugs.filter((s) => s !== slug)));
  }

  return (
    <div ref={boxRef} style={{ position: "relative", maxWidth: 560 }}>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {selected.map((s) => (
            <span
              key={s.slug}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: `1px solid ${T.line}`,
                borderRadius: 2,
                padding: "5px 6px 5px 11px",
                fontSize: 13,
                color: T.ink,
                background: T.bgRaised,
              }}
            >
              {s.title}
              <button
                type="button"
                onClick={() => remove(s.slug)}
                aria-label={`Remove ${s.title}`}
                style={{
                  border: "none",
                  background: "transparent",
                  color: T.inkDim,
                  cursor: "pointer",
                  fontSize: 15,
                  lineHeight: 1,
                  padding: "0 2px",
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {!full && (
        <input
          type="search"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => hits.length > 0 && setOpen(true)}
          placeholder={selected.length === 0 ? "Add a product to compare…" : "Add one more to compare…"}
          style={{
            width: "100%",
            background: T.bgInk,
            border: `1px solid ${T.line}`,
            borderRadius: 3,
            color: T.ink,
            fontSize: 15,
            padding: "12px 14px",
            outline: "none",
          }}
        />
      )}

      {open && !full && hits.length > 0 && (
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            marginTop: 6,
            width: "100%",
            background: T.bgRaised,
            border: `1px solid ${T.line}`,
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 8px 28px oklch(0 0 0 / 0.4)",
          }}
        >
          {hits
            .filter((h) => !slugs.includes(h.slug))
            .map((h) => (
              <button
                key={h.slug}
                type="button"
                onClick={() => add(h.slug)}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  borderBottom: `1px solid ${T.line}`,
                  color: T.ink,
                  padding: "10px 14px",
                  cursor: "pointer",
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {h.name}
                  </span>
                  <span style={{ display: "block", fontSize: 12, color: T.inkDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {h.brand}
                    {h.variant ? ` · ${h.variant}` : ""}
                  </span>
                </span>
                {h.ivc != null && (
                  <span style={{ flexShrink: 0, fontFamily: T.fontMono, fontSize: 13, color: T.inkDim }}>{h.ivc}%</span>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
