/**
 * Design tokens ported from the Parakhi design handoff (claude.ai/design).
 * Used as inline-style values to keep visual fidelity with the prototype.
 * Colors mirror the CSS variables in globals.css.
 */
export const T = {
  bg: "var(--bg)",
  bgRaised: "var(--bg-raised)",
  bgInk: "var(--bg-ink)",
  paper: "var(--paper)",
  paperInk: "var(--paper-ink)",
  ink: "var(--ink)",
  inkDim: "var(--ink-dim)",
  inkFaint: "var(--ink-faint)",
  line: "var(--line)",
  lineSoft: "var(--line-soft)",
  india: "var(--india)",
  indiaSoft: "var(--india-soft)",
  tax: "var(--tax)",
  taxSoft: "var(--tax-soft)",
  abroad: "var(--abroad)",
  abroadSoft: "var(--abroad-soft)",
  fontDisplay: "var(--font-display), 'Instrument Serif', Georgia, serif",
  fontBody: "var(--font-body), 'Geist', system-ui, sans-serif",
  fontMono: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace",
  fontDeva: "var(--font-deva), 'Tiro Devanagari Hindi', serif",
  scale: {
    mega: "clamp(88px, 20vw, 190px)",
    display: "clamp(64px, 12vw, 104px)",
    h1: "56px",
    h2: "36px",
    h3: "1.25rem",
    body: "1.0625rem",
    small: "0.875rem",
    tiny: "0.75rem",
    micro: "0.6875rem",
  },
} as const;

export const FLAGS: Record<string, string> = {
  IN: "🇮🇳", ID: "🇮🇩", MY: "🇲🇾", US: "🇺🇸", CN: "🇨🇳", AE: "🇦🇪",
  BH: "🇧🇭", OM: "🇴🇲", TH: "🇹🇭", CH: "🇨🇭", GB: "🇬🇧", FR: "🇫🇷",
  DE: "🇩🇪", NL: "🇳🇱", DK: "🇩🇰", JP: "🇯🇵", LK: "🇱🇰", EU: "🇪🇺",
  SA: "🇸🇦", BE: "🇧🇪", IE: "🇮🇪", BF: "🇧🇫", IT: "🇮🇹", KR: "🇰🇷",
  SG: "🇸🇬", AU: "🇦🇺", MIXED: "🌐", TAX: "🏛️",
  "ID/MY": "🇮🇩🇲🇾", "EU/US": "🇪🇺🇺🇸",
};

export function flagFor(code: string): string {
  return FLAGS[code] ?? "🏳️";
}

export function verdictFor(ivc: number): string {
  if (ivc >= 95) return "Almost all Indian";
  if (ivc >= 85) return "Mostly Indian";
  if (ivc >= 70) return "Largely Indian";
  if (ivc >= 50) return "Half imported";
  if (ivc >= 30) return "Largely imported";
  return "Barely Indian";
}

/** Shape the product page renders against (mapped from DB in the server page). */
export interface DesignProduct {
  slug: string;
  brand: string;
  variant: string;
  category: string;
  mrp: number | null;
  ivc: number;
  verdict: string;
  composition: number;
  split: { india: number; tax: number; abroad: number };
  components: DesignComponent[];
  imports: DesignImport[];
  sources: DesignSource[];
  catch?: string;
  hero: boolean;
  asOf: string;
  /** % of the breakdown (by share of MRP) resting on Tier-1/2 hard data. */
  sourcedShare: number;
  /** True when the category template is still an unreviewed draft. */
  isDraft: boolean;
  /** Declared ingredients from the product label (Open Food Facts), if known. */
  declaredIngredients?: string[];
  longform?: { kicker: string; body: string[] };
  shrinkflation?: { year: number; weight: number; price: number }[];
}

export interface DesignComponent {
  name: string;
  pct: number;
  rupees: number | null;
  origin: string; // "IN" | "TAX" | country code
  confidence: "high" | "medium" | "low";
  tier: 1 | 2 | 3 | 4;
  note?: string;
  confirmedOnLabel?: boolean;
}

export interface DesignImport {
  input: string;
  pct: number;
  countries: { code: string; name: string; prob: number }[];
  note?: string;
}

export interface DesignSource {
  tier: number;
  title: string;
  ref: string;
  url?: string;
}
