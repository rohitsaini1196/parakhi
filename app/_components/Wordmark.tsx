"use client";

import { motion } from "motion/react";

export function Wordmark() {
  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="font-serif text-5xl font-semibold tracking-tight"
      >
        Parakhi
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="mt-1 font-serif text-lg italic text-muted"
      >
        Kya hai andar?
      </motion.p>
    </div>
  );
}
