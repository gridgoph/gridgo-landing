import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Platform } from './logic';

export function AndroidGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.6 9.48l1.84-3.18a.38.38 0 0 0-.14-.52.38.38 0 0 0-.52.14l-1.87 3.23a11.4 11.4 0 0 0-9.82 0L5.22 5.92a.38.38 0 0 0-.52-.14.38.38 0 0 0-.14.52L6.4 9.48A10.8 10.8 0 0 0 1 18h22a10.8 10.8 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
    </svg>
  );
}

export function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 14.363c-.015-3.08 2.502-4.545 2.617-4.618-1.428-2.091-3.64-2.378-4.423-2.42-1.894-.19-3.693 1.115-4.654 1.115-.963 0-2.434-1.09-4.01-1.059-2.063.03-3.965 1.196-5.029 3.037-2.146 3.712-.55 9.206 1.543 12.235 1.025 1.48 2.235 3.134 3.84 3.076 1.531-.061 2.112-.99 3.94-.99 1.828 0 2.35.99 3.94 1.02 1.636.03 2.686-1.449 3.706-2.94 1.176-1.716 1.66-3.376 1.682-3.46-.035-.015-3.146-1.206-3.152-4.996zM14.935 5.568c.843-1.02 1.411-2.436 1.256-3.848-1.218.049-2.695.811-3.565 1.826-.701.815-1.383 2.264-1.198 3.645 1.364.105 2.663-.603 3.507-1.623z" />
    </svg>
  );
}

const OPTIONS: { value: Platform; label: string; Glyph: typeof AppleGlyph }[] = [
  { value: 'android', label: 'Android', Glyph: AndroidGlyph },
  { value: 'iphone', label: 'iPhone', Glyph: AppleGlyph },
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
        {OPTIONS.map(({ value: option, label, Glyph }) => {
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
              <Glyph className="relative size-5 shrink-0" />
              <span className="relative">{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
