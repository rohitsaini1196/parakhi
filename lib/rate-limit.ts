import { createHash } from "node:crypto";
import { db } from "@/lib/db";

/**
 * DB-backed rate limiting using the LlmCall table as the source of truth —
 * one row per LLM call already, so we just count rows. Boring and good enough
 * until we outgrow SQLite.
 *
 * Two limits enforced per brief §9.3:
 *   - per-IP per hour  (default 10)
 *   - global per day   (default 500)
 */

const PER_IP_PER_HOUR = Number(process.env.RATE_LIMIT_PER_IP_PER_HOUR ?? 10);
const GLOBAL_PER_DAY = Number(process.env.RATE_LIMIT_GLOBAL_PER_DAY ?? 500);

const IP_SALT = process.env.IP_HASH_SALT ?? "parakhi-v1";

export function hashIp(ip: string): string {
  return createHash("sha256").update(IP_SALT + ip).digest("hex").slice(0, 32);
}

export function ipFrom(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "0.0.0.0";
}

export interface RateCheck {
  ok: boolean;
  reason?: string;
}

/**
 * We use Feedback's `submitterEmail` as a side-channel? No — we lean on
 * LlmCall logs. But LlmCall doesn't have IP. Add a small RateHit table?
 * Trade-off: avoid yet another table; just enforce the global limit via
 * LlmCall and the per-IP limit via a tiny in-memory map. Memory resets on
 * deploy, which is fine for a soft rate limit.
 */
const IP_HITS = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  req: Request,
  purpose: "estimate" | "resolve" | "categorize",
): Promise<RateCheck> {
  // Only the costly estimate endpoint counts toward global daily cap.
  if (purpose === "estimate") {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const todayCount = await db.llmCall.count({
      where: { endpoint: "estimate", createdAt: { gte: since } },
    });
    if (todayCount >= GLOBAL_PER_DAY) {
      return {
        ok: false,
        reason: "Service capacity reached for today. Try again tomorrow.",
      };
    }
  }

  const ip = hashIp(ipFrom(req));
  const now = Date.now();
  const hit = IP_HITS.get(ip);
  if (!hit || hit.resetAt < now) {
    IP_HITS.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return { ok: true };
  }
  if (hit.count >= PER_IP_PER_HOUR) {
    return {
      ok: false,
      reason: `Slow down — max ${PER_IP_PER_HOUR} requests/hour per IP.`,
    };
  }
  hit.count += 1;
  return { ok: true };
}
