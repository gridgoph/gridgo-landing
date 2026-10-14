import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, FileDown, RotateCw } from 'lucide-react';
import { openCookieSettings } from '../consent/cookieChoice';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import { LegalFooter, LegalTopBar } from './LegalLayout';
import { PRIVACY_CONTACT } from './legalPages';
import {
  AUDIENCE_HEADINGS,
  AUDIENCE_NAMES,
  AUDIENCE_ORDER,
  formatLegalDate,
  signedPdfUrl,
  slotTitle,
  useLegalLibrary,
} from './legalLibrary';
import type { LegalVersion } from './legalLibrary';

/*
 * /legal and /legal/:documentId. The texts come from gridgo-api at view time,
 * so unlike /privacy these pages are not prerendered; they share its chrome
 * and type so the two read as one set.
 */

const kickerClass = 'text-xs tracking-[0.35em] uppercase text-[var(--color-primary)] mb-5 font-bold';
const titleClass =
  'inline bg-[#FFDE58] text-black px-2 -mx-2 box-decoration-clone text-4xl sm:text-5xl font-bold leading-[1.3]';
const metaClass =
  'mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[0.75rem] font-mono uppercase tracking-[0.15em] text-gray-500 dark:text-[#888]';
const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';

function Page({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 pt-8 pb-16">
        <LegalTopBar />
        {children}
      </div>
      <LegalFooter />
    </div>
  );
}

function versionLine(doc: LegalVersion) {
  const effective = formatLegalDate(doc.effectiveAt);
  return effective ? `Version ${doc.version}, effective ${effective}` : `Version ${doc.version}`;
}

function PlaceholderTag() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-[var(--color-primary)] px-2.5 py-0.5 text-xs font-semibold text-black dark:text-white">
      Placeholder
    </span>
  );
}

/** The API is down or unreachable. Says what happened and what to do. */
function Unavailable({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <div role="status" className="max-w-2xl rounded-2xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.03] p-6 sm:p-8">
      <h2 className="text-xl font-bold leading-snug">{what} could not be loaded</h2>
      <p className="mt-3 text-base leading-relaxed text-gray-700 dark:text-gray-300">
        GRIDGO's server did not answer. Check your connection, then try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className={`mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110 ${focusRing}`}
      >
        <RotateCw size={16} aria-hidden />
        Try again
      </button>
      <p className="mt-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        You can also ask for a copy at{' '}
        <a href={`mailto:${PRIVACY_CONTACT}`} className="underline decoration-[var(--color-primary)] decoration-2 underline-offset-4 hover:text-[var(--color-primary)]">
          {PRIVACY_CONTACT}
        </a>
        .
      </p>
    </div>
  );
}

function SkeletonLines({ count }: { count: number }) {
  return (
    <div aria-hidden className="space-y-3 motion-safe:animate-pulse">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-4 rounded bg-black/[0.07] dark:bg-white/10" style={{ width: `${92 - ((i * 17) % 35)}%` }} />
      ))}
    </div>
  );
}

// ── /legal ──────────────────────────────────────────────────────────────────

export function LegalLibraryPage() {
  useDocumentTitle('Legal documents | GRIDGO');
  const { state, retry } = useLegalLibrary();

  return (
    <Page>
      <header className="mt-12 mb-12 max-w-3xl">
        <p className={kickerClass}>Legal</p>
        <h1 className={titleClass}>Legal documents</h1>
        <div className="legal-prose mt-8">
          <p>
            The terms and policies for GRIDGO's apps and this website. Each one shows its version and the
            date it took effect. When GRIDGO publishes a new version, it replaces the old one here.
          </p>
        </div>
      </header>

      <main className="max-w-3xl" aria-busy={state.status === 'loading'}>
        {state.status === 'loading' && (
          <>
            <p className="sr-only" role="status">Loading legal documents</p>
            <SkeletonLines count={6} />
          </>
        )}
        {state.status === 'error' && <Unavailable what="The legal documents" onRetry={retry} />}
        {state.status === 'ready' && state.documents.length === 0 && (
          <p className="text-base text-gray-700 dark:text-gray-300">No legal documents are published yet.</p>
        )}
        {state.status === 'ready' &&
          AUDIENCE_ORDER.map((audience) => {
            const group = state.documents.filter((doc) => doc.audience === audience);
            if (group.length === 0) return null;
            return (
              <section key={audience} aria-labelledby={`legal-${audience}`} className="mb-12">
                <h2 id={`legal-${audience}`} className="text-2xl sm:text-[1.75rem] font-bold leading-tight mb-2">
                  {AUDIENCE_HEADINGS[audience]}
                </h2>
                <ul>
                  {group.map((doc) => (
                    <li key={doc.documentId} className="border-b border-black/10 dark:border-white/10 last:border-b-0">
                      <Link
                        to={`/legal/${doc.documentId}`}
                        className={`group flex items-center gap-4 py-5 rounded ${focusRing}`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-lg font-bold leading-snug group-hover:text-[var(--color-primary)] transition-colors">
                            {doc.title}
                          </span>
                          <span className="mt-1 block text-sm text-gray-600 dark:text-gray-400">{versionLine(doc)}</span>
                        </span>
                        {doc.placeholder && <PlaceholderTag />}
                        <ChevronRight
                          size={20}
                          aria-hidden
                          className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

        <section aria-labelledby="legal-elsewhere" className="mt-4 rounded-2xl border border-black/10 dark:border-white/10 p-6 sm:p-8">
          <h2 id="legal-elsewhere" className="text-xl font-bold leading-snug">Also on this site</h2>
          <ul className="mt-4 space-y-4 text-base leading-relaxed">
            <li>
              <Link to="/privacy" className="font-bold underline decoration-[var(--color-primary)] decoration-2 underline-offset-4 hover:text-[var(--color-primary)]">
                Privacy Policy
              </Link>
              <span className="block text-sm text-gray-600 dark:text-gray-400">
                The policy the app stores link to: what the apps collect, why, and how long it is kept.
              </span>
            </li>
            <li>
              <Link to="/delete-account" className="font-bold underline decoration-[var(--color-primary)] decoration-2 underline-offset-4 hover:text-[var(--color-primary)]">
                Delete your account
              </Link>
              <span className="block text-sm text-gray-600 dark:text-gray-400">How to ask GRIDGO to delete your account and data.</span>
            </li>
            <li>
              <button
                type="button"
                onClick={openCookieSettings}
                className={`font-bold underline decoration-[var(--color-primary)] decoration-2 underline-offset-4 hover:text-[var(--color-primary)] rounded ${focusRing}`}
              >
                Cookie settings
              </button>
              <span className="block text-sm text-gray-600 dark:text-gray-400">Choose whether the How it Works videos may load from YouTube.</span>
            </li>
          </ul>
        </section>
      </main>
    </Page>
  );
}

// ── /legal/:documentId ──────────────────────────────────────────────────────

/** Plain text from the API: blank lines split paragraphs, single breaks stay. */
function DocumentText({ text }: { text: string }) {
  const paragraphs = text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="legal-prose">
      {paragraphs.map((paragraph, i) => (
        <p key={i} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function PdfButton({ doc }: { doc: LegalVersion }) {
  const [state, setState] = useState<'idle' | 'opening' | 'failed'>('idle');

  const open = async () => {
    setState('opening');
    try {
      window.location.assign(await signedPdfUrl(doc));
      setState('idle');
    } catch {
      setState('failed');
    }
  };

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={open}
        disabled={state === 'opening'}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-black/80 dark:border-white/80 px-5 py-2.5 text-sm font-bold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-60 ${focusRing}`}
      >
        <FileDown size={18} aria-hidden />
        {state === 'opening' ? 'Opening PDF…' : 'Download PDF'}
      </button>
      {state === 'failed' && (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">
          The PDF could not be opened. Try again in a moment.
        </p>
      )}
    </div>
  );
}

function OtherDocuments({ documents, current }: { documents: LegalVersion[]; current: string }) {
  return (
    <nav
      aria-labelledby="legal-other"
      className="mt-12 lg:mt-0 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-5 lg:p-0 lg:border-0 lg:bg-transparent lg:dark:bg-transparent lg:sticky lg:top-8 lg:self-start lg:col-start-1 lg:row-start-1"
    >
      <h2 id="legal-other" className="text-[0.6875rem] font-mono uppercase tracking-[0.2em] text-gray-500 dark:text-[#888] mb-3">
        Legal documents
      </h2>
      <ul className="space-y-1 text-sm">
        {documents.map((doc) => {
          const here = doc.documentId === current;
          return (
            <li key={doc.documentId}>
              <Link
                to={`/legal/${doc.documentId}`}
                aria-current={here ? 'page' : undefined}
                className={`block border-l-2 py-1 pl-3 leading-snug rounded-r ${focusRing} ${
                  here
                    ? 'border-[var(--color-primary)] font-bold text-black dark:text-white'
                    : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-[var(--color-primary)]'
                }`}
              >
                {doc.title}
                {doc.audience !== 'all' && (
                  <span className="block text-xs font-normal text-gray-500 dark:text-[#888]">For {AUDIENCE_NAMES[doc.audience]}</span>
                )}
              </Link>
            </li>
          );
        })}
        <li className="pt-2">
          <Link to="/legal" className={`block py-1 pl-3 text-gray-500 dark:text-[#888] hover:text-[var(--color-primary)] rounded ${focusRing}`}>
            All legal documents
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export function LegalDocumentPage() {
  const { documentId = '' } = useParams();
  const { state, retry } = useLegalLibrary();
  const doc = state.status === 'ready' ? state.documents.find((d) => d.documentId === documentId) : undefined;
  const missing = state.status === 'ready' && !doc;
  const title = doc?.title ?? (missing ? 'Document not found' : slotTitle(documentId) ?? 'Legal document');

  useDocumentTitle(`${title} | GRIDGO`);

  return (
    <Page>
      <header className="mt-12 mb-12 max-w-3xl">
        <Link to="/legal" className={`inline-block rounded ${kickerClass} hover:underline underline-offset-4 ${focusRing}`}>
          Legal documents
        </Link>
        <div>
          <h1 className={titleClass}>{title}</h1>
        </div>
        {doc && (
          <dl className={metaClass}>
            <div className="flex gap-2">
              <dt>Version</dt>
              <dd className="text-black dark:text-white">{doc.version}</dd>
            </div>
            <div className="flex gap-2">
              <dt>Effective</dt>
              <dd className="text-black dark:text-white">{formatLegalDate(doc.effectiveAt)}</dd>
            </div>
            <div className="flex gap-2">
              <dt>Applies to</dt>
              <dd className="text-black dark:text-white">{AUDIENCE_NAMES[doc.audience]}</dd>
            </div>
            {doc.placeholder && (
              <div className="flex gap-2">
                <dt>Status</dt>
                <dd className="text-black dark:text-white">Placeholder text</dd>
              </div>
            )}
          </dl>
        )}
      </header>

      <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
        <main className="min-w-0 max-w-3xl lg:col-start-2 lg:row-start-1" aria-busy={state.status === 'loading'}>
          {state.status === 'loading' && (
            <>
              <p className="sr-only" role="status">Loading the document</p>
              <SkeletonLines count={8} />
            </>
          )}
          {state.status === 'error' && <Unavailable what="This document" onRetry={retry} />}
          {missing && (
            <div className="legal-prose">
              <p>There is no legal document at this address. It may have been renamed, or not published yet.</p>
              <p>
                <Link to="/legal">See all legal documents</Link>
              </p>
            </div>
          )}
          {doc && (
            <>
              {doc.version > 1 && doc.changeSummary && (
                <section aria-labelledby="legal-changes" className="mb-8 border-l-4 border-[var(--color-primary)] pl-5">
                  <h2 id="legal-changes" className="text-base font-bold">What changed in version {doc.version}</h2>
                  <p className="mt-1 text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">{doc.changeSummary}</p>
                </section>
              )}
              {doc.pdfUrl && <PdfButton doc={doc} />}
              {doc.text.trim() ? (
                <DocumentText text={doc.text} />
              ) : (
                <p className="legal-prose">This version is published as a PDF.</p>
              )}
            </>
          )}
        </main>
        {state.status === 'ready' && state.documents.length > 0 && (
          <OtherDocuments documents={state.documents} current={documentId} />
        )}
      </div>
    </Page>
  );
}
