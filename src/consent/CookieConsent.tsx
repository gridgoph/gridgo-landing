import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  closeCookieSettings,
  saveCookieChoice,
  useCookieChoice,
  useCookieSettingsOpen,
  openCookieSettings,
} from './cookieChoice';

export const COOKIE_NOTICE_PATH = '/legal/cookie-notice';

/** What the site keeps for itself. Kept in step with what the code stores. */
const ALWAYS_ON = [
  'Your light or dark theme',
  'That the opening animation has played, for this visit only',
  'When you last sent a support request, so another cannot follow within a minute',
  'This cookie choice',
  'Sign-in cookies on the page GRIDGO staff use to answer support requests',
];

const primaryButton =
  'inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';
const secondaryButton =
  'inline-flex min-h-11 items-center justify-center rounded-full border-2 border-black/80 dark:border-white/80 px-5 py-2.5 text-sm font-bold text-black dark:text-white transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';
const quietLink =
  'font-semibold underline decoration-[var(--color-primary)] decoration-2 underline-offset-4 hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] rounded';

/**
 * The cookie banner and the settings dialog, on every public route.
 *
 * Nothing renders until the browser has read the stored choice, so the
 * prerendered /privacy and /delete-account hydrate cleanly. /desk is the
 * operators' screen, not the public site, and is left alone.
 */
export function CookieConsent() {
  const choice = useCookieChoice();
  const settingsOpen = useCookieSettingsOpen();
  const { pathname } = useLocation();

  if (choice === undefined || pathname.startsWith('/desk')) return null;

  return (
    <>
      {choice === null && !settingsOpen && <CookieBanner />}
      {settingsOpen && <CookieSettingsDialog initialVideos={choice?.videos ?? false} />}
    </>
  );
}

function CookieBanner() {
  const headingId = useId();

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      className="cookie-rise fixed inset-x-3 bottom-3 z-[70] max-h-[calc(100svh-1.5rem)] overflow-y-auto rounded-3xl border border-black/10 dark:border-white/15 bg-white dark:bg-black text-black dark:text-white p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] sm:inset-x-auto sm:left-6 sm:bottom-6 sm:w-[min(30rem,calc(100vw-3rem))] sm:p-6"
    >
      <h2 id={headingId} className="text-lg font-bold leading-snug">
        <span className="bg-[#FFDE58] text-black px-1.5 -mx-1.5 box-decoration-clone">Cookies on GRIDGO</span>
      </h2>
      <p className="mt-2.5 text-sm sm:text-[0.9375rem] leading-relaxed text-gray-700 dark:text-gray-300">
        The site keeps only what it needs to work. The How it Works videos come from YouTube, which
        sets its own cookies, so they stay off until you allow them.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:gap-2.5">
        <button type="button" className={primaryButton} onClick={() => saveCookieChoice(true)}>
          Allow YouTube videos
        </button>
        <button type="button" className={secondaryButton} onClick={() => saveCookieChoice(false)}>
          Keep videos off
        </button>
      </div>
      <p className="mt-3.5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
        <button type="button" className={quietLink} onClick={openCookieSettings}>
          See what is stored
        </button>
        <Link to={COOKIE_NOTICE_PATH} className={quietLink}>
          Read the Cookie Notice
        </Link>
      </p>
    </section>
  );
}

function CookieSettingsDialog({ initialVideos }: { initialVideos: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [videos, setVideos] = useState(initialVideos);
  const titleId = useId();
  const videosLabelId = useId();
  const videosHelpId = useId();

  // No cleanup: unmounting removes the dialog, which closes it. Closing it by
  // hand would fire `close` after StrictMode's remount and shut it again.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    // Start at the title, not on the first link halfway through a sentence.
    titleRef.current?.focus();
  }, []);

  const save = () => {
    saveCookieChoice(videos);
    closeCookieSettings();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={closeCookieSettings}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> itself.
        if (event.target === event.currentTarget) closeCookieSettings();
      }}
      className="m-auto w-[min(34rem,calc(100vw-1.5rem))] max-h-[calc(100svh-1.5rem)] overflow-y-auto rounded-3xl border border-black/10 dark:border-white/15 bg-white dark:bg-black p-0 text-black dark:text-white shadow-[0_30px_80px_-24px_rgba(0,0,0,0.6)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="px-6 pt-6 sm:px-8 sm:pt-8">
        <h2 ref={titleRef} id={titleId} tabIndex={-1} className="text-2xl font-bold leading-snug outline-none">
          <span className="bg-[#FFDE58] text-black px-1.5 -mx-1.5 box-decoration-clone">Cookie settings</span>
        </h2>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-gray-700 dark:text-gray-300">
          Choose what this site may load. You can change it again from Cookie settings at the bottom of
          the home page. The{' '}
          <Link to={COOKIE_NOTICE_PATH} onClick={closeCookieSettings} className={quietLink}>
            Cookie Notice
          </Link>{' '}
          explains it in full.
        </p>

        <section aria-labelledby={`${titleId}-needed`} className="mt-7 border-t border-black/10 dark:border-white/15 pt-6">
          <div className="flex items-start justify-between gap-4">
            <h3 id={`${titleId}-needed`} className="text-base font-bold leading-snug">
              Needed for the site to work
            </h3>
            <span className="shrink-0 rounded-full bg-black/[0.06] dark:bg-white/10 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
              Always on
            </span>
          </div>
          <ul className="mt-3 space-y-1.5 text-[0.9375rem] leading-relaxed text-gray-700 dark:text-gray-300 list-disc pl-5 marker:text-[var(--color-primary)]">
            {ALWAYS_ON.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            These stay in your browser. The site has no analytics or advertising cookies.
          </p>
        </section>

        <section className="mt-6 border-t border-black/10 dark:border-white/15 pt-6">
          <div className="flex items-start justify-between gap-4">
            <h3 id={videosLabelId} className="text-base font-bold leading-snug">
              YouTube videos
            </h3>
            <button
              type="button"
              role="switch"
              aria-checked={videos}
              aria-labelledby={videosLabelId}
              aria-describedby={videosHelpId}
              onClick={() => setVideos((on) => !on)}
              className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                videos
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                  : 'border-black/30 dark:border-white/35 bg-black/[0.06] dark:bg-white/10'
              }`}
            >
              <span
                aria-hidden
                className={`inline-block h-6 w-6 rounded-full shadow transition-transform ${
                  videos ? 'translate-x-6 bg-black' : 'translate-x-0.5 bg-white dark:bg-gray-300'
                }`}
              />
            </button>
          </div>
          <p id={videosHelpId} className="mt-3 text-[0.9375rem] leading-relaxed text-gray-700 dark:text-gray-300">
            The How it Works walkthroughs play from YouTube. Once a video loads, YouTube sets its own
            cookies and can recognise your browser. While this is off, the walkthroughs show a picture
            until you choose to play one.
          </p>
          <p className="mt-2 text-sm font-semibold" aria-live="polite">
            {videos ? 'On: videos play here.' : 'Off: videos do not load.'}
          </p>
        </section>

        {/* Stays in view while the list scrolls on a small screen. */}
        <div className="sticky bottom-0 -mx-6 mt-8 border-t border-black/10 dark:border-white/15 bg-white dark:bg-black px-6 py-4 sm:-mx-8 sm:px-8 sm:py-6">
          <div className="grid grid-cols-2 gap-2.5 sm:ml-auto sm:w-fit">
            <button type="button" className={secondaryButton} onClick={closeCookieSettings}>
              Cancel
            </button>
            <button type="button" className={primaryButton} onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
