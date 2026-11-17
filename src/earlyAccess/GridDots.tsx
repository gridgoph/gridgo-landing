import { motion, useReducedMotion } from 'framer-motion';

/**
 * The GRIDGO 3×3 mark as a progress meter: one dot per step of the wait,
 * filled in yellow as it passes. The next dot breathes so the page reads as
 * working, not frozen.
 */
export function GridDots({ lit, size = 18 }: { lit: number; size?: number }) {
  const reduceMotion = useReducedMotion();
  const gap = Math.round(size * 0.55);

  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-3 w-max"
      style={{ gap }}
    >
      {Array.from({ length: 9 }, (_, i) => {
        const on = i < lit;
        const next = i === lit;
        return (
          <motion.span
            key={i}
            className={`block rounded-full transition-colors duration-700 ${
              on ? 'bg-[var(--color-primary)]' : 'bg-black/10 dark:bg-white/12'
            }`}
            style={{
              width: size,
              height: size,
              boxShadow: on ? '0 0 18px color-mix(in srgb, var(--color-primary) 45%, transparent)' : undefined,
            }}
            animate={
              next && !reduceMotion
                ? { opacity: [0.35, 1, 0.35], scale: [0.9, 1, 0.9] }
                : { opacity: 1, scale: 1 }
            }
            transition={next && !reduceMotion ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
          />
        );
      })}
    </div>
  );
}
