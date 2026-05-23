export function paiseToRupees(paise: number | null | undefined): string {
  if (paise == null) return "—";
  return `₹${(paise / 100).toFixed(2)}`;
}

export function pct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function pctRange(low: number, high: number, digits = 0): string {
  if (low === high) return pct(low, digits);
  return `${pct(low, digits)}–${pct(high, digits)}`;
}

export const COUNTRY_FLAG: Record<string, string> = {
  IN: "🇮🇳",
  ID: "🇮🇩",
  MY: "🇲🇾",
  TH: "🇹🇭",
  CN: "🇨🇳",
  US: "🇺🇸",
  CI: "🇨🇮",
  GH: "🇬🇭",
  MIXED: "🌐",
};

export function flagFor(code: string): string {
  return COUNTRY_FLAG[code] ?? "🏳️";
}
