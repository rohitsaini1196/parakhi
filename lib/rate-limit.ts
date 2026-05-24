import { createHash } from "node:crypto";
import { db } from "@/lib/db";

/**
 * DB-backed rate limiting. Counts analysis requests (new-product searches),
 * not LLM calls — the deterministic compute path makes no LLM call, so an
 * LLM-row count would never trigger. Uses a RateHit counter table so limits
 * survive serverless cold starts (an in-memory map resets per lambda and is
 * effectively no limit on Vercel).
 *
 * Two limits (per brief §9.3):
 *   - per-IP per hour  (default 10)
 *   - global per day   (default 500) — protects the free-tier DB + any LLM bill
 *
 * Called only on the cache-miss path, so repeat product views are never
 * limited; only fresh analyses (which create DB rows) count.
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
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export interface RateCheck {
  ok: boolean;
  reason?: string;
}

/** Atomically increment a counter row and return its new value. */
async function bump(scope: string, windowKey: string): Promise<number> {
  const row = await db.rateHit.upsert({
    where: { scope_windowKey: { scope, windowKey } },
    update: { count: { increment: 1 } },
    create: { scope, windowKey, count: 1 },
  });
  return row.count;
}

export async function checkRateLimit(req: Request): Promise<RateCheck> {
  const now = new Date();
  const day = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const hour = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH
  const ip = hashIp(ipFrom(req));

  // Global daily cap first (protects DB + bill).
  const globalCount = await bump("global", day);
  if (globalCount > GLOBAL_PER_DAY) {
    return {
      ok: false,
      reason: "Service capacity reached for today. Try again tomorrow.",
    };
  }

  // Per-IP hourly cap.
  const ipCount = await bump(`ip:${ip}`, hour);
  if (ipCount > PER_IP_PER_HOUR) {
    return {
      ok: false,
      reason: `Slow down — max ${PER_IP_PER_HOUR} new analyses/hour per visitor.`,
    };
  }

  return { ok: true };
}
