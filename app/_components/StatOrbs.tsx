"use client";

import { motion } from "motion/react";
import { CountUp } from "./CountUp";

interface Orb {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  sub: string;
  accent: string;
}

/**
 * Three minimal animated stat chips below the hero bar: Composition-MII, GST,
 * Imported share. Numbers count up; cards lift on hover to reveal the sub-line.
 */
export function StatOrbs({ orbs }: { orbs: Orb[] }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {orbs.map((orb, i) => (
        <motion.div
          key={orb.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-border bg-surface/50 p-4"
        >
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
            {orb.label}
          </div>
          <div
            className="mt-1 font-serif text-3xl font-semibold tabular-nums"
            style={{ color: orb.accent }}
          >
            <CountUp
              value={orb.value}
              decimals={orb.decimals ?? 0}
              suffix={orb.suffix ?? ""}
              prefix={orb.prefix ?? ""}
            />
          </div>
          <div className="mt-1 text-xs text-muted">{orb.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}
