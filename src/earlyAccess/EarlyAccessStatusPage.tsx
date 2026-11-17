import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ExternalLink, Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../utils/useTheme';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import { EarlyAccessError, fetchStatus, forgetSignUp, readSignUp, storeSignUp, type StatusResult } from './api';
import { formatCountdown, litDots, POLL_MS, statusPath, waitingPhase } from './logic';
import { GridDots } from './GridDots';

type Load =
  | { state: 'loading' }
  | { state: 'missing' }
  | { state: 'ready'; result: StatusResult; stale: boolean };

/** Move focus to a view's heading when it appears, so a screen reader announces it. */
function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return ref;
}

const STEPS = ['Request received', 'Adding you to the tester group', 'Sending your Google Play invite'];

/**
 * /early-access/status?token=… — the waiting page and, once the team grants
 * access, the "You're in" page. Safe to close: the email is the hand-off, and
 * the token in localStorage brings a returning visitor straight back here.
 */
export function EarlyAccessStatusPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const urlToken = params.get('token')?.trim() || null;
  const duplicate = (location.state as { duplicate?: boolean } | null)?.duplicate === true;

  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [createdAt, setCreatedAt] = useState(() => {
    const stored = readSignUp();
    return stored && (!urlToken || stored.token === urlToken) ? stored.createdAt : new Date().toISOString();
  });
  const [now, setNow] = useState(() => Date.now());

  const granted = Boolean(urlToken) && load.state === 'ready' && load.result.status === 'granted';
  useDocumentTitle(granted ? "You're in · GRIDGO" : 'Setting up your access · GRIDGO');

  // The token is in this page's address: never hand it to another site as a referrer.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  // No token in the link: use the one this device signed up with.
  const storedToken = urlToken ? null : (readSignUp()?.token ?? null);
  useEffect(() => {
    if (storedToken) navigate(statusPath(storedToken), { replace: true });
  }, [storedToken, navigate]);
  const shown: Load = urlToken ? load : storedToken ? { state: 'loading' } : { state: 'missing' };

  const check = useCallback(async () => {
    if (!urlToken) return;
    try {
      const result = await fetchStatus(urlToken);
      setLoad({ state: 'ready', result, stale: false });
      const stored = readSignUp();
      const since = result.createdAt ?? (stored?.token === urlToken ? stored.createdAt : undefined);
      if (since) setCreatedAt(since);
      storeSignUp({ token: urlToken, createdAt: since ?? stored?.createdAt ?? new Date().toISOString() });
    } catch (caught) {
      if (caught instanceof EarlyAccessError && caught.status === 404) {
        if (readSignUp()?.token === urlToken) forgetSignUp();
        setLoad({ state: 'missing' });
        return;
      }
      // Offline or the API hiccuped: keep what is on screen (or show the wait)
      // and let the next poll try again.
      setLoad((current) =>
        current.state === 'ready'
          ? { ...current, stale: true }
          : current.state === 'loading'
            ? { state: 'ready', result: { status: 'pending', grantedAt: null, optInUrl: null }, stale: true }
            : current,
      );
    }
  }, [urlToken]);

  // Check now, every 30 seconds while pending, and whenever the tab comes back.
  useEffect(() => {
    if (!urlToken || granted) return;
    const first = window.setTimeout(() => void check(), 0);
    const poll = window.setInterval(() => void check(), POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [urlToken, granted, check]);

  useEffect(() => {
    if (granted) return;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, [granted]);

  return (
    <div className="min-h-[100svh] bg-white dark:bg-black text-black dark:text-white relative overflow-x-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-[var(--color-primary)]/[0.08] to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 pt-8 md:pt-14 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary-text)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] rounded"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
        <button
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-6 py-12 md:py-20 flex flex-col">
        {shown.state === 'loading' ? (
          <div className="flex flex-col items-center gap-8 pt-10" role="status">
            <GridDots lit={0} size={22} />
            <p className="text-gray-600 dark:text-gray-400">Checking your access…</p>
          </div>
        ) : shown.state === 'missing' ? (
          <Missing />
        ) : (
          <>
            {duplicate ? (
              <p className="mb-8 w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] px-5 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                This email already asked for access. Here is where it stands.
              </p>
            ) : null}
            {granted ? (
              <Granted optInUrl={shown.result.optInUrl} />
            ) : (
              <Waiting createdAt={createdAt} now={now} stale={shown.stale} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Waiting({ createdAt, now, stale }: { createdAt: string; now: number; stale: boolean }) {
  const { remaining, showSpamHint } = waitingPhase(createdAt, now);
  const lit = litDots(remaining, 'pending');
  const heading = useFocusOnMount<HTMLHeadingElement>();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center text-center"
    >
      <GridDots lit={lit} size={22} />

      <h1 ref={heading} tabIndex={-1} className="mt-10 text-3xl md:text-4xl font-bold tracking-tight outline-none" aria-live="polite">
        Setting up your access…
      </h1>

      <p
        className="mt-4 text-6xl md:text-7xl font-bold tabular-nums tracking-tight text-[var(--color-primary-text)]"
        role="timer"
        aria-label={remaining > 0 ? `About ${Math.ceil(remaining / 60)} minutes left` : 'Any minute now'}
      >
        {remaining > 0 ? formatCountdown(remaining) : '0:00'}
      </p>
      {remaining === 0 ? (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Any minute now.</p>
      ) : null}

      <ol className="mt-10 w-full flex flex-col gap-4 text-left">
        {STEPS.map((step, i) => {
          const state = i === 0 ? 'done' : i === 1 ? 'active' : 'next';
          return (
            <li key={step} className="flex items-center gap-4">
              <span
                className={`shrink-0 size-8 rounded-full flex items-center justify-center border ${
                  state === 'done'
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-black'
                    : state === 'active'
                      ? 'border-[var(--color-primary)] text-[var(--color-primary-text)]'
                      : 'border-black/15 dark:border-white/15 text-gray-600 dark:text-gray-400'
                }`}
                aria-hidden="true"
              >
                {state === 'done' ? (
                  <Check size={16} strokeWidth={3} />
                ) : state === 'active' ? (
                  <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
                ) : (
                  <span className="text-[13px] font-bold">{i + 1}</span>
                )}
              </span>
              <span
                className={
                  state === 'next' ? 'text-gray-600 dark:text-gray-400' : 'font-semibold text-black dark:text-white'
                }
              >
                {step}
                <span className="sr-only">{state === 'done' ? ' (done)' : state === 'active' ? ' (in progress)' : ''}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {showSpamHint ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 w-full rounded-2xl border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/[0.06] p-5 text-left"
        >
          <p className="font-bold mb-1">Still waiting?</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Check your Spam and Promotions folders for the invite. Or install the app now from the
            direct download.
          </p>
          <Link
            to="/download#apk"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/20 dark:border-white/25 font-bold text-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary-text)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            Direct download (APK)
          </Link>
        </motion.div>
      ) : null}

      <p className="mt-12 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        You can close this page. We'll email you when you're in.
      </p>
      {stale ? (
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400" role="status">
          Could not check just now. Trying again shortly.
        </p>
      ) : null}
    </motion.div>
  );
}

function Granted({ optInUrl }: { optInUrl: string | null }) {
  const heading = useFocusOnMount<HTMLHeadingElement>();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center text-center"
    >
      <GridDots lit={9} size={22} />
      <h1 ref={heading} tabIndex={-1} className="mt-10 text-5xl md:text-6xl font-bold tracking-tight text-[var(--color-primary-text)] outline-none" aria-live="polite">
        You're in
      </h1>
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Your invite is in your inbox.</p>

      {optInUrl ? (
        <a
          href={optInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full bg-[var(--color-primary)] text-black font-bold text-base hover:brightness-110 transition shadow-[0_0_20px_rgba(255,222,88,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          Open Google Play
          <ExternalLink size={18} aria-hidden="true" />
        </a>
      ) : null}
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Use the same Google account you signed up with.
      </p>

      <p className="mt-12 w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] px-5 py-4 font-semibold">
        Keep the app for 14 days.
      </p>
    </motion.div>
  );
}

function Missing() {
  return (
    <div className="flex flex-col items-center text-center pt-6">
      <GridDots lit={0} size={22} />
      <h1 className="mt-10 text-3xl font-bold tracking-tight">No sign-up found</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
        This link has no early-access request behind it. Ask for access with your Google Play email.
      </p>
      <Link
        to="/download#early-access"
        className="mt-8 inline-flex items-center justify-center w-full px-8 py-4 rounded-full bg-[var(--color-primary)] text-black font-bold hover:brightness-110 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      >
        Get Early Access
      </Link>
    </div>
  );
}
