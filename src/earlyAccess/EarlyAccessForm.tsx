import { useId, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock, Loader2 } from 'lucide-react';
import { AppleMark } from '../components/BrandMarks';
import { currentSource, EarlyAccessError, readSignUp, signUp, storeSignUp, forgetSignUp } from './api';
import {
  FORM_COPY,
  isShopClosed,
  looksLikeEmail,
  SHOP_FORM_COPY,
  SHOP_IPHONE_NOTE,
  SHOP_NAME_MAX,
  SHOP_OPENS_SOON,
  statusPath,
  type EarlyApp,
  type Platform,
} from './logic';
import { PhoneChoice } from './PhoneChoice';
import { TestFlightBox } from './TestFlightBox';

/**
 * The whole form is the phone, an email, one consent box and one button; the
 * shop version adds an optional shop name. The app and the phone are the
 * parent's, so the title and steps beside the form follow them too.
 * Everything a visitor needs to know afterwards is on the waiting page.
 */
export function EarlyAccessForm({
  app = 'customer',
  platform,
  onPlatformChange,
}: {
  app?: EarlyApp;
  platform: Platform;
  onPlatformChange: (next: Platform) => void;
}) {
  // Each app is its own form: a different email, consent and sign-up on this device.
  return <AppForm key={app} app={app} platform={platform} onPlatformChange={onPlatformChange} />;
}

function AppForm({
  app,
  platform,
  onPlatformChange,
}: {
  app: EarlyApp;
  platform: Platform;
  onPlatformChange: (next: Platform) => void;
}) {
  const reduceMotion = useReducedMotion();
  const shop = app === 'shop';
  const copy = shop ? SHOP_FORM_COPY[platform] : FORM_COPY[platform];
  const emailId = useId();
  const hintId = useId();
  const errorId = useId();
  const shopNameId = useId();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  /** The server is not taking shops yet: said kindly, not as an error. */
  const [closed, setClosed] = useState(false);
  const [existing, setExisting] = useState(() => readSignUp(app));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!consent || busy) return;
    if (!looksLikeEmail(email)) {
      setError(copy.invalidEmail);
      return;
    }
    setBusy(true);
    setError('');
    setClosed(false);
    try {
      const result = await signUp({
        email,
        source: currentSource(search),
        platform,
        app,
        ...(shop ? { shopName } : {}),
      });
      storeSignUp({ token: result.token, app: result.app, createdAt: result.createdAt, platform: result.platform });
      navigate(statusPath(result.token), { state: { duplicate: result.duplicate } });
    } catch (caught) {
      if (shop && caught instanceof EarlyAccessError && isShopClosed(caught.code)) {
        setClosed(true);
      } else {
        setError(caught instanceof Error ? caught.message : 'Sign-up is not working right now. Try again in a few minutes.');
      }
      setBusy(false);
    }
  };

  if (existing) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {shop
            ? existing.platform === 'iphone'
              ? 'Your shop is already on the list to hear when the shop app comes to iPhone.'
              : 'You already asked to join the shop test on this device.'
            : 'You already asked for access on this device.'}
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
            forgetSignUp(app);
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
        {shop && platform === 'iphone' ? (
          <motion.div
            key="shop-iphone"
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden -mt-1"
          >
            <p className="flex items-start gap-3 rounded-2xl border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/[0.08] px-4 py-3.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              <AppleMark className="mt-0.5 size-4 shrink-0" />
              <span>{SHOP_IPHONE_NOTE}</span>
            </p>
          </motion.div>
        ) : null}
        {!shop && platform === 'iphone' ? (
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

      {shop ? (
        <div className="flex flex-col gap-2">
          <label htmlFor={shopNameId} className="font-bold">
            Shop name <span className="font-normal text-gray-600 dark:text-gray-400">(optional)</span>
          </label>
          <input
            id={shopNameId}
            type="text"
            autoComplete="organization"
            maxLength={SHOP_NAME_MAX}
            placeholder="The name on your shop sign"
            value={shopName}
            disabled={busy}
            onChange={(event) => {
              setShopName(event.target.value);
              if (error) setError('');
            }}
            className="w-full bg-white text-black text-base placeholder-gray-500 border border-black/15 dark:border-white/20 rounded-2xl px-5 py-4 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition disabled:opacity-60"
          />
        </div>
      ) : null}

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

      {closed ? (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] px-4 py-3.5">
          <Clock size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--color-primary-text)]" />
          <span className="text-sm leading-relaxed">
            <span className="block font-bold">{SHOP_OPENS_SOON.title}</span>
            <span className="block text-gray-700 dark:text-gray-300">{SHOP_OPENS_SOON.body}</span>
          </span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!consent || busy}
        className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full bg-[var(--color-primary)] text-black font-bold text-base hover:brightness-110 transition shadow-[0_0_20px_rgba(255,222,88,0.25)] disabled:shadow-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      >
        {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null}
        {shop ? (busy ? SHOP_FORM_COPY[platform].busy : SHOP_FORM_COPY[platform].button) : busy ? 'Requesting access…' : 'Get Early Access'}
      </button>
    </form>
  );
}
