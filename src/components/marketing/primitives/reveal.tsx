import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: ReactNode;
  /** Stagger helper — seconds to delay the entrance. */
  delay?: number;
  /** Entrance direction. */
  from?: Direction;
  className?: string;
  /** Render element tag (defaults to div). */
  as?: 'div' | 'li' | 'span' | 'section';
}

const OFFSET = 24;

function offsetFor(dir: Direction) {
  switch (dir) {
    case 'up':
      return { y: OFFSET };
    case 'down':
      return { y: -OFFSET };
    case 'left':
      return { x: OFFSET };
    case 'right':
      return { x: -OFFSET };
    default:
      return {};
  }
}

/**
 * Scroll-triggered reveal. Animates once when it enters the viewport, and
 * collapses to a plain fade (no transform) when the user prefers reduced motion.
 */
export function Reveal({ children, delay = 0, from = 'up', className, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion();

  // Reduced motion (and any environment without IntersectionObserver-driven
  // animation): render fully-visible static content — never gated behind a
  // scroll trigger, so content is always shown.
  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, ...offsetFor(from) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
