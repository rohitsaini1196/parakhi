"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

export function SearchForm({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<ProductHit[]>([]);
  const [brands, setBrands] = useState<BrandHit[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete fetch.
  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setProducts([]);
      setBrands([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data = await res.json();
        setProducts(data.products ?? []);
        setBrands(data.brands ?? []);
        setOpen(true);
      } catch {
        /* ignore autocomplete errors */
      }
    }, 180);
    return () => clearTimeout(t);
  }, [value]);

  // Close dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(q: string) {
    if (!q.trim()) return;
    setSubmitting(true);
    window.location.href = `/api/search?q=${encodeURIComponent(q.trim())}`;
  }

  const hasSuggestions = products.length > 0 || brands.length > 0;

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="flex w-full items-center gap-2"
      >
        <input
          name="q"
          type="search"
          required
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => hasSuggestions && setOpen(true)}
          disabled={submitting}
          placeholder="Try: Parle-G, Surf Excel 1kg, Maggi, or a barcode"
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-zinc-900 focus:outline-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-w-[6.5rem] items-center justify-center rounded-lg bg-zinc-900 px-5 py-3 text-base font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> Analyzing
            </span>
          ) : (
            "Search"
          )}
        </button>
      </form>

      {open && hasSuggestions && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          {products.length > 0 && (
            <ul>
              {products.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => router.push(`/p/${p.slug}`)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {p.name}
                      </span>
                      <span className="block truncate text-xs text-zinc-500">
                        {p.brand}
                        {p.variant ? ` · ${p.variant}` : ""}
                      </span>
                    </span>
                    {p.ivc != null && (
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {p.ivc}%
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {brands.length > 0 && (
            <div className="border-t border-zinc-100 dark:border-zinc-800">
              <div className="px-4 pt-2 text-[10px] uppercase tracking-wide text-zinc-400">
                Brands — type a product to analyze
              </div>
              <ul className="pb-1">
                {brands.map((b) => (
                  <li key={b.name}>
                    <button
                      type="button"
                      onClick={() => {
                        setValue(b.name + " ");
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-4 py-1.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <span>{b.name}</span>
                      <span className="text-xs text-zinc-400">{b.country}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden
    />
  );
}
