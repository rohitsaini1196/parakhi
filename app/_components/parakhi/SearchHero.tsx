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
interface BrandHit {
  name: string;
  country: string;
}

export function SearchHero({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<ProductHit[]>([]);
  const [brands, setBrands] = useState<BrandHit[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const active = q.trim().length > 0;

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setProducts([]);
      setBrands([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(term)}`);
        if (!res.ok) return;
        const d = await res.json();
        setProducts(d.products ?? []);
        setBrands(d.brands ?? []);
        setOpen(true);
      } catch {
        /* ignore */
      }
    }, 160);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(term: string) {
    if (!term.trim()) return;
    setSubmitting(true);
    window.location.href = `/api/search?q=${encodeURIComponent(term.trim())}`;
  }

  const hasSug = products.length > 0 || brands.length > 0;

  return (
    <div ref={box} style={{ width: "100%", maxWidth: 640, position: "relative" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          border: `1.5px solid ${active ? T.india : T.line}`,
          borderRadius: 4,
          background: T.bgRaised,
          padding: "0 0 0 24px",
          transition: "border-color .2s",
        }}
      >
        <span style={{ color: T.inkFaint, fontFamily: T.fontMono, fontSize: 11, letterSpacing: "0.15em", marginRight: 14 }}>
          SEARCH
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hasSug && setOpen(true)}
          autoComplete="off"
          placeholder="Parle-G, Maggi, Surf Excel…"
          disabled={submitting}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "20px 0",
            background: "transparent",
            border: "none",
            outline: "none",
            color: T.ink,
            fontFamily: T.fontDisplay,
            fontSize: 24,
            fontStyle: "italic",
            letterSpacing: "-0.01em",
          }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            margin: 8,
            padding: "12px 18px",
            background: T.ink,
            color: T.bg,
            border: "none",
            borderRadius: 2,
            fontFamily: T.fontMono,
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {submitting ? "…" : "parakh →"}
        </button>
      </form>

      {open && hasSug && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            marginTop: 6,
            background: T.bgRaised,
            border: `1px solid ${T.line}`,
            borderRadius: 4,
            overflow: "hidden",
            zIndex: 10,
            textAlign: "left",
          }}
        >
          {products.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => router.push(`/p/${p.slug}`)}
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
                padding: "12px 18px",
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${T.lineSoft}`,
                cursor: "pointer",
                color: T.ink,
                textAlign: "left",
              }}
            >
              <span>
                <span style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 17 }}>{p.name}</span>
                <span style={{ color: T.inkDim, fontSize: 12, marginLeft: 8 }}>{p.brand}</span>
              </span>
              {p.ivc != null && (
                <span style={{ fontFamily: T.fontDisplay, fontStyle: "italic", fontSize: 18, color: T.india }}>{p.ivc}%</span>
              )}
            </button>
          ))}
          {brands.length > 0 && (
            <div style={{ padding: "8px 18px" }}>
              <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkFaint, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>
                Brands — type a product
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {brands.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => {
                      setQ(b.name + " ");
                      setOpen(false);
                    }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 2,
                      border: `1px solid ${T.line}`,
                      background: "transparent",
                      color: T.inkDim,
                      fontFamily: T.fontMono,
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
