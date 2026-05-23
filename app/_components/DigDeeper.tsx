"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Progressive-disclosure wrapper. Keeps the page near-textless by default;
 * the full data (component table, imports, sources, reasoning) lives behind
 * one toggle that expands with a layout animation.
 */
export function DigDeeper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface/40 px-4 py-3 text-sm text-muted transition-colors hover:text-foreground"
      >
        <span>{open ? "Hide the details" : "Dig deeper"}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          aria-hidden
        >
          ↓
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
