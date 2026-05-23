import type { CostComponent } from "@/lib/schemas";

// 11 muted, distinguishable shades. Cycles if more components.
const SEGMENT_COLORS = [
  "bg-amber-700",
  "bg-amber-500",
  "bg-orange-600",
  "bg-stone-500",
  "bg-yellow-700",
  "bg-rose-600",
  "bg-emerald-700",
  "bg-sky-700",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-zinc-600",
];

export function StackedBar({ components }: { components: CostComponent[] }) {
  const total = components.reduce((s, c) => s + c.sharePct, 0);
  return (
    <div>
      <div className="flex h-6 w-full overflow-hidden rounded-md">
        {components.map((c, i) => (
          <div
            key={c.label}
            className={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
            style={{ width: `${(c.sharePct / total) * 100}%` }}
            title={`${c.label}: ${c.sharePct.toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
        {components.map((c, i) => (
          <span key={c.label} className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-sm ${SEGMENT_COLORS[i % SEGMENT_COLORS.length]}`}
            />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
