import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

/**
 * Counts up from 0 to `value` the first time it scrolls into view. Jumps
 * straight to the final value when the user prefers reduced motion.
 */
export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 1.6,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });
  const reduce = useReducedMotion();
  // Under reduced motion, show the final value immediately — never gated behind
  // a scroll trigger.
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, reduce, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {Math.round(display)}
      {suffix}
    </span>
  );
}
