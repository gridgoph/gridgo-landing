import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag, Store } from 'lucide-react';
import { APP_CHOICES, type EarlyApp } from './logic';

const ICONS: Record<EarlyApp, typeof Store> = { customer: ShoppingBag, shop: Store };

/**
 * The customer app or the shop app, as two radio buttons drawn as one switch,
 * the same way the phone choice is. It sits at the top of Early Access on every
 * screen size, because everything below it (title, steps, fields, consent and
 * button) follows it.
 */
export function AppChoice({
  value,
  onChange,
  disabled,
}: {
  value: EarlyApp;
  onChange: (next: EarlyApp) => void;
  disabled?: boolean;
}) {
  const name = useId();
  const pill = useId();
  const reduceMotion = useReducedMotion();

  return (
    <fieldset disabled={disabled} className="flex flex-col gap-2 min-w-0">
      <legend className="font-bold mb-3">Which app do you want to test?</legend>
      <div className="grid grid-cols-2 gap-1 p-1 rounded-[1.75rem] border border-black/15 dark:border-white/20 bg-white/70 dark:bg-white/[0.04]">
        {APP_CHOICES.map(({ value: option, name: label, who }) => {
          const checked = value === option;
          const Icon = ICONS[option];
          return (
            <label
              key={option}
              className={`relative flex items-center gap-3 rounded-3xl px-3 py-3 sm:px-5 sm:py-3.5 cursor-pointer select-none transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-primary)] has-[:disabled]:cursor-not-allowed ${
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
                  className="absolute inset-0 rounded-3xl bg-[var(--color-primary)]"
                  aria-hidden="true"
                />
              ) : null}
              <Icon size={22} aria-hidden="true" className="relative shrink-0 hidden min-[400px]:block" />
              <span className="relative min-w-0 flex flex-col leading-tight">
                <span className="font-bold">{label}</span>
                <span className={`text-[13px] mt-0.5 ${checked ? 'text-black/75' : 'text-gray-600 dark:text-gray-400'}`}>{who}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
