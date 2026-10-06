import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '../utils/useTheme';
import { EFFECTIVE_DATE, LAST_UPDATED, PRIVACY_CONTACT } from './legalPages';

export type LegalSection = {
  /** The anchor, so a section can be linked to directly: /privacy#retention. */
  id: string;
  title: string;
  body: ReactNode;
};

type LegalLayoutProps = {
  /** Browser tab title; the prerendered HTML carries the same one. */
  documentTitle: string;
  kicker: string;
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
};

/**
 * Long-form layout shared by /privacy and /delete-account.
 *
 * Both pages are prerendered and then hydrated (scripts/prerender-legal.mjs),
 * so nothing here may render differently on the server and in the browser.
 * The theme is the one that would: the server cannot read localStorage. The
 * toggle therefore renders both icons and lets the `dark` class pick one, and
 * no markup branches on the theme hook's dark flag.
 */
export function LegalLayout({ documentTitle, kicker, title, intro, sections }: LegalLayoutProps) {
  const { toggleDarkMode } = useTheme();

  useEffect(() => {
    const previous = document.title;
    document.title = documentTitle;
    return () => {
      document.title = previous;
    };
  }, [documentTitle]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 pt-8 pb-16">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] rounded"
          >
            <ArrowLeft size={16} aria-hidden />
            GRIDGO
          </Link>
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label="Switch between light and dark mode"
            className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            <Sun size={18} aria-hidden className="hidden dark:block" />
            <Moon size={18} aria-hidden className="block dark:hidden" />
          </button>
        </div>

        <header className="mt-12 mb-12 max-w-3xl">
          <p className="text-xs tracking-[0.35em] uppercase text-[var(--color-primary)] mb-5 font-bold">
            {kicker}
          </p>
          {/* The highlighter band, as on /report. */}
          <h1 className="inline bg-[#FFDE58] text-black px-2 -mx-2 box-decoration-clone text-4xl sm:text-5xl font-bold leading-[1.3]">
            {title}
          </h1>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[12px] font-mono uppercase tracking-[0.15em] text-gray-500 dark:text-[#888]">
            <div className="flex gap-2">
              <dt>Effective</dt>
              <dd className="text-black dark:text-white">{EFFECTIVE_DATE}</dd>
            </div>
            <div className="flex gap-2">
              <dt>Last updated</dt>
              <dd className="text-black dark:text-white">{LAST_UPDATED}</dd>
            </div>
          </dl>
          <div className="legal-prose mt-8">{intro}</div>
        </header>

        <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
          <nav
            aria-labelledby="legal-contents"
            className="mb-12 lg:mb-0 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-5 lg:p-0 lg:border-0 lg:bg-transparent lg:dark:bg-transparent lg:sticky lg:top-8 lg:self-start"
          >
            <h2
              id="legal-contents"
              className="text-[11px] font-mono uppercase tracking-[0.2em] text-gray-500 dark:text-[#888] mb-3"
            >
              Contents
            </h2>
            <ol className="space-y-1.5 text-sm">
              {sections.map((section, i) => (
                <li key={section.id} className="flex gap-2.5">
                  <span className="font-mono text-[12px] text-gray-400 dark:text-[#666] w-5 shrink-0 pt-px text-right">
                    {i + 1}.
                  </span>
                  <a
                    href={`#${section.id}`}
                    className="text-gray-700 dark:text-gray-300 hover:text-[var(--color-primary)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] rounded"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <main className="min-w-0 max-w-3xl">
            {sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-6 border-t border-black/10 dark:border-white/10 pt-8 pb-6 first:border-t-0 first:pt-0"
              >
                <h2 id={`${section.id}-title`} className="group text-2xl sm:text-[28px] font-bold leading-tight mb-5">
                  <span className="font-mono text-[var(--color-primary)] mr-3 text-xl align-[2px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                  <a
                    href={`#${section.id}`}
                    aria-label={`Link to section: ${section.title}`}
                    className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-[var(--color-primary)] no-underline"
                  >
                    #
                  </a>
                </h2>
                <div className="legal-prose">{section.body}</div>
              </section>
            ))}
          </main>
        </div>
      </div>

      <footer className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-[12px] font-mono tracking-wide text-gray-500 dark:text-[#888]">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-3 uppercase tracking-[0.15em]">
            <Link to="/privacy" className="hover:text-[var(--color-primary)]">Privacy Policy</Link>
            <Link to="/delete-account" className="hover:text-[var(--color-primary)]">Delete account</Link>
            <Link to="/support" className="hover:text-[var(--color-primary)]">Support</Link>
            <Link to="/report" className="hover:text-[var(--color-primary)]">Report an issue</Link>
          </nav>
          <p>
            Privacy questions:{' '}
            <a href={`mailto:${PRIVACY_CONTACT}`} className="text-black dark:text-white underline underline-offset-4 hover:text-[var(--color-primary)]">
              {PRIVACY_CONTACT}
            </a>
            <span className="mx-3" aria-hidden>·</span>
            &copy; 2026 GRIDGO
          </p>
        </div>
      </footer>
    </div>
  );
}
