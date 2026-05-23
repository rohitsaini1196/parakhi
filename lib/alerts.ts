import { appendFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Append-only alert log. Score deltas above a threshold (a recompute that
 * meaningfully moved a product's IVC) get written to data/alerts/<date>.md so
 * the change is reviewable in git history. A cron job commits the file, which
 * notifies the repo owner.
 *
 * This is the whole "alerting system" — no SMTP, no webhook, no infra. The
 * signal is a git commit to data/alerts/.
 */

const ALERTS_DIR = resolve(process.cwd(), "data", "alerts");

/** IVC point-delta beyond which a recompute is considered noteworthy. */
export const SCORE_DELTA_THRESHOLD = 10;

export interface ScoreDeltaAlert {
  slug: string;
  metric: "IVC" | "Composition-MII";
  previous: number;
  next: number;
  reason: string;
}

function todayFile(): string {
  const d = new Date().toISOString().slice(0, 10);
  return resolve(ALERTS_DIR, `${d}.md`);
}

export async function writeScoreDeltaAlert(
  alert: ScoreDeltaAlert,
): Promise<void> {
  await mkdir(ALERTS_DIR, { recursive: true });
  const ts = new Date().toISOString();
  const delta = (alert.next - alert.previous).toFixed(1);
  const line =
    `- **${alert.slug}** ${alert.metric} ${alert.previous.toFixed(1)}% → ` +
    `${alert.next.toFixed(1)}% (Δ ${delta}) — ${alert.reason} _(${ts})_\n`;
  await appendFile(todayFile(), line, "utf-8");
}

/** Returns true if the delta crosses the threshold and warrants an alert. */
export function isNoteworthy(previous: number | null, next: number): boolean {
  if (previous == null) return false; // first-time computes aren't alerts
  return Math.abs(next - previous) >= SCORE_DELTA_THRESHOLD;
}
