"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

/**
 * Counts a number up from 0 to `value` when it scrolls into view.
 * Respects prefers-reduced-motion (animate() honors it via duration clamp).
 */
export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 1.1,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
