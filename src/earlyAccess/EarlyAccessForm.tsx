import { useId, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { currentSource, readSignUp, signUp, storeSignUp, forgetSignUp } from './api';
import { FORM_COPY, looksLikeEmail, statusPath, type Platform } from './logic';
import { PhoneChoice } from './PhoneChoice';
import { TestFlightBox } from './TestFlightBox';

/**
 * The whole form is the phone, an email, one consent box and one button.
 * The phone is the parent's, so the steps beside the form follow it too.
 * Everything a visitor needs to know afterwards is on the waiting page.
 */
export function EarlyAccessForm({
  platform,
  onPlatformChange,
}: {
  platform: Platform;
  onPlatformChange: (next: Platform) => void;
}) {
  const reduceMotion = useReducedMotion();
  const copy = FORM_COPY[platform];
  const emailId = useId();
  const hintId = useId();
  const errorId = useId();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState(readSignUp);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!consent || busy) return;
    if (!looksLikeEmail(email)) {
      setError(copy.invalidEmail);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await signUp({ email, source: currentSource(search), platform });
      storeSignUp({ token: result.token, createdAt: result.createdAt, platform: result.platform });
      navigate(statusPath(result.token), { state: { duplicate: result.duplicate } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Sign-up is not working right now. Try again in a few minutes.');
      setBusy(false);
    }
  };

  if (existing) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          You already asked for access on this device.
        </p>
        <Link
          to={statusPath(existing.token)}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto sm:self-start px-8 py-4 rounded-full bg-[var(--color-primary)] text-black font-bold hover:brightness-110 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          See your status
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => {
            forgetSignUp();
            setExisting(null);
          }}
          className="self-start text-sm text-gray-600 dark:text-gray-400 underline underline-offset-4 hover:text-[var(--color-primary-text)] transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <PhoneChoice
        value={platform}
        disabled={busy}
        onChange={(next) => {
          onPlatformChange(next);
          if (error) setError('');
        }}
      />

      <AnimatePresence initial={false}>
        {platform === 'iphone' ? (
          <motion.div
            key="testflight"
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden -mt-1"
          >
            <TestFlightBox />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex flex-col gap-2">
        <label htmlFor={emailId} className="font-bold">
          {copy.label}
        </label>
        <input
          id={emailId}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={254}
          required
          placeholder={copy.placeholder}
          value={email}
          disabled={busy}
          aria-describedby={`${hintId}${error ? ` ${errorId}` : ''}`}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError('');
          }}
          className="w-full bg-white text-black text-base placeholder-gray-500 border border-black/15 dark:border-white/20 rounded-2xl px-5 py-4 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition disabled:opacity-60"
        />
        <p id={hintId} className="text-sm text-gray-600 dark:text-gray-400">
          {copy.hint}
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={consent}
          disabled={busy}
          required
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--color-primary)]"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {copy.consent} I agree to the{' '}
          <Link
            to="/privacy"
            className="underline underline-offset-4 decoration-[var(--color-primary)] hover:text-[var(--color-primary-text)]"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {error ? (
        <p id={errorId} role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!consent || busy}
        className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full bg-[var(--color-primary)] text-black font-bold text-base hover:brightness-110 transition shadow-[0_0_20px_rgba(255,222,88,0.25)] disabled:shadow-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      >
        {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null}
        {busy ? 'Requesting access…' : 'Get Early Access'}
      </button>
    </form>
  );
}
