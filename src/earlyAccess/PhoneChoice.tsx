import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Platform } from './logic';
import { AndroidMark, AppleMark } from '../components/BrandMarks';

/** Each mark at its own proportions: the Android head is wide, the Apple logo tall. */
const OPTIONS: { value: Platform; label: string; Mark: typeof AppleMark; size: string }[] = [
  { value: 'android', label: 'Android', Mark: AndroidMark, size: 'h-[15px] w-[26px]' },
  { value: 'iphone', label: 'iPhone', Mark: AppleMark, size: 'size-5' },
];

/**
 * Android or iPhone, as two radio buttons drawn as one switch. The yellow pill
 * slides to the chosen phone; everything below it follows without a reload.
 */
export function PhoneChoice({
  value,
  onChange,
  disabled,
}: {
  value: Platform;
  onChange: (next: Platform) => void;
  disabled?: boolean;
}) {
  const name = useId();
  const pill = useId();
  const reduceMotion = useReducedMotion();

  return (
    <fieldset disabled={disabled} className="flex flex-col gap-2 min-w-0">
      <legend className="font-bold mb-2">Your phone</legend>
      <div className="grid grid-cols-2 gap-1 p-1 rounded-full border border-black/15 dark:border-white/20 bg-white/70 dark:bg-white/[0.04]">
        {OPTIONS.map(({ value: option, label, Mark, size }) => {
          const checked = value === option;
          return (
            <label
              key={option}
              className={`relative flex items-center justify-center gap-2 rounded-full px-4 py-3 font-bold cursor-pointer select-none transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-primary)] has-[:disabled]:cursor-not-allowed ${
                checked ? 'text-black' : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {checked ? (
                <motion.span
                  layoutId={pill}
                  transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
                  className="absolute inset-0 rounded-full bg-[var(--color-primary)]"
                  aria-hidden="true"
                />
              ) : null}
              <Mark className={`relative shrink-0 ${size}`} />
              <span className="relative">{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
