import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  checkEarlyAccessStatus,
  clearStoredEarlyAccessEmail,
  getStoredEarlyAccessEmail,
  submitEarlyAccessRequest,
} from '../utils/earlyAccess';

const DEFAULT_PLAY_URL = 'https://play.google.com/apps/testing/com.gridgo.client';

export function EarlyAccessSection() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sourceParam = searchParams.get('src') || searchParams.get('source') || 'web';

  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [phoneType, setPhoneType] = useState<'android' | 'iphone'>('android');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States: 'form' | 'waiting' | 'granted'
  const [viewState, setViewState] = useState<'form' | 'waiting' | 'granted'>('form');
  const [activeEmail, setActiveEmail] = useState<string>('');
  const [optInUrl, setOptInUrl] = useState<string>(DEFAULT_PLAY_URL);

  // Countdown timer for waiting screen (5 minutes = 300 seconds)
  const [secondsLeft, setSecondsLeft] = useState(300);

  // Check stored email on mount
  useEffect(() => {
    const stored = getStoredEarlyAccessEmail();
    if (stored) {
      setActiveEmail(stored);
      setViewState('waiting');
      void checkStatus(stored);
    }
  }, []);

  // Poll status every 30 seconds when in waiting state
  useEffect(() => {
    if (viewState !== 'waiting' || !activeEmail) return;

    const interval = setInterval(() => {
      void checkStatus(activeEmail);
    }, 30000);

    return () => clearInterval(interval);
  }, [viewState, activeEmail]);

  // 1-second interval for countdown timer
  useEffect(() => {
    if (viewState !== 'waiting') return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [viewState]);

  async function checkStatus(targetEmail: string) {
    try {
      const res = await checkEarlyAccessStatus(targetEmail);
      if (res.status === 'granted') {
        if (res.optInUrl) setOptInUrl(res.optInUrl);
        setViewState('granted');
      }
    } catch {
      // Ignore background check failure
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!consent) {
      setError('Please accept the consent terms to proceed.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await submitEarlyAccessRequest(cleanEmail, consent, sourceParam);
      setActiveEmail(cleanEmail);
      setSecondsLeft(300);
      if (res.status === 'granted') {
        setViewState('granted');
      } else {
        setViewState('waiting');
      }
    } catch (err) {
      setError('Could not submit early access request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function simulateGranted() {
    setViewState('granted');
  }

  function handleReset() {
    clearStoredEarlyAccessEmail();
    setViewState('form');
    setEmail('');
    setConsent(false);
    setError(null);
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const timerFraction = secondsLeft / 300;
  const strokeDashoffset = 100 - timerFraction * 100;

  return (
    <div id="early-access" className="w-full mb-16 scroll-mt-24">
      {/* Two Choice Cards at the top */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {/* Choice 1: Google Play Early Access */}
        <div className="rounded-2xl border-2 border-[var(--color-primary)]/80 bg-[var(--color-primary)]/[0.04] dark:bg-[var(--color-primary)]/[0.07] p-6 sm:p-7 relative transition-all shadow-[0_0_25px_rgba(255,222,88,0.08)]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-primary)]">
              Option 1 · Recommended
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-primary)] text-black">
              Auto-updates
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2 text-black dark:text-white">
            Google Play Early Access
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Sign up with your Google Play email. You get access in about 5 minutes, install from the Play Store, and updates come automatically.
          </p>
        </div>

        {/* Choice 2: Direct Download (APK) */}
        <a
          href="#direct-download"
          className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:border-black/25 dark:hover:border-white/25 p-6 sm:p-7 transition-all group block"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-500 dark:text-gray-400">
              Option 2 · Instant
            </span>
            <span className="text-xs text-gray-400 group-hover:text-[var(--color-primary)] transition-colors inline-flex items-center gap-1">
              Jump down <ArrowRight size={13} />
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2 text-black dark:text-white group-hover:text-[var(--color-primary)] transition-colors">
            Direct Download (APK)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Download the installer straight from this site and install it now. No sign-up, but you'll need to download new versions yourself.
          </p>
        </a>
      </div>

      {/* Main Early Access Box */}
      <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-6 sm:p-10 md:p-12 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-black font-bold flex items-center justify-center text-sm">
                1
              </span>
              <h2 className="text-2xl font-bold text-black dark:text-white">
                Google Play Early Access
              </h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300">
              Android · iPhone via TestFlight
            </span>
          </div>

          <AnimatePresence mode="wait">
            {viewState === 'form' && (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                onSubmit={(e) => void handleSubmit(e)}
                className="space-y-6"
              >
                {/* Phone Toggle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    My phone
                  </label>
                  <div className="inline-flex rounded-xl p-1 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <button
                      type="button"
                      onClick={() => setPhoneType('android')}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                        phoneType === 'android'
                          ? 'bg-[var(--color-primary)] text-black shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      Android
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneType('iphone')}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                        phoneType === 'iphone'
                          ? 'bg-[var(--color-primary)] text-black shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      iPhone
                    </button>
                  </div>
                  {phoneType === 'iphone' && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      iPhone invites are currently processed manually via Apple TestFlight. Enter your Apple ID email below.
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="play-email" className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    {phoneType === 'android' ? 'Google Play email' : 'Apple ID email'}
                  </label>
                  <input
                    id="play-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="you@gmail.com"
                    className="w-full px-4 py-3.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-black/40 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-mono text-sm"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {phoneType === 'android'
                      ? 'The Gmail signed in to Google Play on your phone.'
                      : 'The Apple ID associated with your iPhone App Store.'}
                  </p>
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    id="consent-check"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (error) setError(null);
                    }}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <label htmlFor="consent-check" className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer select-none">
                    I agree that GRIDGO may use my details to send my early access invite and app updates, as described in the{' '}
                    <Link to="/privacy" className="underline hover:text-[var(--color-primary)]">
                      Privacy Policy
                    </Link>.
                  </label>
                </div>

                {error && (
                  <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                )}

                {/* Submit button & notes */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!consent || !email.trim() || submitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--color-primary)] text-black font-bold text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,222,88,0.25)] flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      'Submitting…'
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Get Early Access
                      </>
                    )}
                  </button>
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Access in about 5 minutes · Free
                  </p>
                </div>
              </motion.form>
            )}

            {/* Waiting Screen (Mockup 3) */}
            {viewState === 'waiting' && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center py-4"
              >
                {/* Circular timer */}
                <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="stroke-black/10 dark:stroke-white/10"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="stroke-[var(--color-primary)] transition-all duration-1000 ease-linear"
                      strokeWidth="3"
                      strokeDasharray="100"
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold font-mono text-black dark:text-white leading-none">
                      {formatTimer(secondsLeft)}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 mt-1">
                      LEFT
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-2 text-black dark:text-white">
                  Setting up your access…
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                  This usually takes about 5 minutes. You can close this page. We'll email your Google Play invite to{' '}
                  <strong className="text-black dark:text-white">{activeEmail}</strong>.
                </p>

                {/* 3 Steps */}
                <div className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5 mb-8 text-left space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </span>
                    <span className="text-sm font-semibold text-black dark:text-white">
                      Request received
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-ping" />
                    </span>
                    <span className="text-sm font-semibold text-black dark:text-white">
                      Adding you to the tester group
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-black/20 dark:border-white/20 text-gray-400 flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Sending your Google Play invite
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  No email after 15 minutes? Check Spam or Promotions. Can't wait?{' '}
                  <a href="#direct-download" className="text-[var(--color-primary)] font-semibold underline">
                    Use the direct download (APK).
                  </a>
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={simulateGranted}
                    className="text-xs font-mono text-gray-500 dark:text-gray-400 hover:text-[var(--color-primary)] border border-dashed border-black/20 dark:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Prototype: simulate access granted →
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Use another email
                  </button>
                </div>
              </motion.div>
            )}

            {/* "You're in" Screen */}
            {viewState === 'granted' && (
              <motion.div
                key="granted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center mb-5">
                  <CheckCircle2 size={36} strokeWidth={2.5} />
                </div>

                <h3 className="text-3xl font-extrabold mb-3 text-black dark:text-white">
                  You're in!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-8 leading-relaxed">
                  Your invite is in your inbox at{' '}
                  <strong className="text-black dark:text-white font-mono">{activeEmail}</strong>.
                  Open Google Play to accept the invite and install GRIDGO.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                  <a
                    href={optInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--color-primary)] text-black font-bold text-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(255,222,88,0.3)] inline-flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Open Google Play
                  </a>
                  <a
                    href="#direct-download"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/40 dark:bg-black/40 text-black dark:text-white text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                  >
                    Direct APK download
                  </a>
                </div>

                <div className="w-full max-w-md rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/[0.04] p-4 text-xs text-gray-700 dark:text-gray-300">
                  ⭐ <strong>Important:</strong> Please keep the app installed for 14 days to help us satisfy Google Play's closed test requirements.
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-6 text-xs text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Sign up with another email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
