import { useCallback, useEffect, useState } from 'react';
import { apiBaseUrl } from '../utils/apiBase';

/**
 * The legal library GRIDGO publishes through gridgo-api (docs/LEGAL_API.md in
 * that repo). Super Admin edits and publishes the texts; this site only reads
 * the public, effective versions, so a new text appears here without a
 * website release.
 */
export type LegalAudience = 'all' | 'client' | 'supplier' | 'rider' | 'staff';

export type LegalVersion = {
  /** Opaque version ID. */
  id: string;
  /** Stable slot, used in this site's URLs: /legal/<documentId>. */
  documentId: string;
  version: number;
  title: string;
  audience: LegalAudience;
  /** Plain text. Never rendered as HTML. */
  text: string;
  pdfUrl: string | null;
  effectiveAt: string;
  publishedAt: string;
  placeholder: boolean;
  changeSummary: string;
  status: 'placeholder' | 'live';
};

/**
 * The eight launch slots the API seeds, in reading order. Used to order the
 * library and to keep the footer and page titles readable when the API cannot
 * be reached; documents added later are listed after these.
 */
export const LAUNCH_SLOTS: { documentId: string; title: string; audience: LegalAudience }[] = [
  { documentId: 'terms-of-service', title: 'Terms of Service', audience: 'all' },
  { documentId: 'privacy-notice', title: 'Privacy Notice', audience: 'all' },
  { documentId: 'cookie-notice', title: 'Cookie Notice', audience: 'all' },
  { documentId: 'acceptable-use', title: 'Acceptable Use and Artwork Rights', audience: 'all' },
  { documentId: 'age-policy', title: 'Age Policy', audience: 'all' },
  { documentId: 'supplier-agreement', title: 'Supplier Agreement', audience: 'supplier' },
  { documentId: 'rider-agreement', title: 'Rider Agreement', audience: 'rider' },
  { documentId: 'hub-staff-terms', title: 'Hub Staff Terms', audience: 'staff' },
];

export const AUDIENCE_ORDER: LegalAudience[] = ['all', 'client', 'supplier', 'rider', 'staff'];

export const AUDIENCE_HEADINGS: Record<LegalAudience, string> = {
  all: 'For everyone',
  client: 'For customers',
  supplier: 'For print shops',
  rider: 'For riders',
  staff: 'For hub staff',
};

/** Who a document applies to, as a phrase: "Applies to print shops". */
export const AUDIENCE_NAMES: Record<LegalAudience, string> = {
  all: 'everyone',
  client: 'customers',
  supplier: 'print shops',
  rider: 'riders',
  staff: 'hub staff',
};

export function slotTitle(documentId: string) {
  return LAUNCH_SLOTS.find((slot) => slot.documentId === documentId)?.title;
}

function slotRank(documentId: string) {
  const index = LAUNCH_SLOTS.findIndex((slot) => slot.documentId === documentId);
  return index === -1 ? LAUNCH_SLOTS.length : index;
}

export function sortDocuments<T extends { documentId: string; title: string }>(documents: T[]) {
  return [...documents].sort(
    (a, b) => slotRank(a.documentId) - slotRank(b.documentId) || a.title.localeCompare(b.title),
  );
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Manila',
});

/** "1 January 2026", the form the other legal pages use, in Philippine time. */
export function formatLegalDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : dateFormat.format(date);
}

function isVersion(value: unknown): value is LegalVersion {
  const v = value as LegalVersion;
  return (
    typeof v?.id === 'string' &&
    typeof v.documentId === 'string' &&
    typeof v.title === 'string' &&
    typeof v.version === 'number' &&
    typeof v.text === 'string'
  );
}

async function requestDocuments(): Promise<LegalVersion[]> {
  const response = await fetch(`${apiBaseUrl}/legal/documents`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`legal documents: HTTP ${response.status}`);
  const body = (await response.json()) as { documents?: unknown };
  if (!Array.isArray(body.documents)) throw new Error('legal documents: unexpected response');
  return sortDocuments(body.documents.filter(isVersion));
}

/*
 * One request per page load, shared by the footer and the legal pages, so
 * moving from one to the other does not flash a loading state. A failure is
 * not cached: "Try again" makes a fresh request.
 */
let shared: Promise<LegalVersion[]> | null = null;
let settled: LegalVersion[] | null = null;

function loadDocuments(fresh = false) {
  if (fresh || !shared) {
    settled = null;
    shared = requestDocuments().then(
      (documents) => {
        settled = documents;
        return documents;
      },
      (error: unknown) => {
        shared = null;
        throw error;
      },
    );
  }
  return shared;
}

export type LegalLibraryState =
  | { status: 'loading' }
  | { status: 'ready'; documents: LegalVersion[] }
  | { status: 'error' };

export function useLegalLibrary() {
  const [state, setState] = useState<LegalLibraryState>(() =>
    settled ? { status: 'ready', documents: settled } : { status: 'loading' },
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    loadDocuments(attempt > 0).then(
      (documents) => active && setState({ status: 'ready', documents }),
      () => active && setState({ status: 'error' }),
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}

/**
 * The PDF route answers with a short-lived signed link rather than the file,
 * so it has to be asked for at the moment the reader wants it.
 */
export async function signedPdfUrl(version: LegalVersion) {
  // A path on the API, never another origin.
  if (!version.pdfUrl || !/^\/(?![/\\])/.test(version.pdfUrl)) throw new Error('no pdf');
  const response = await fetch(`${apiBaseUrl}${version.pdfUrl}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`legal pdf: HTTP ${response.status}`);
  const body = (await response.json()) as { url?: unknown };
  if (typeof body.url !== 'string') throw new Error('legal pdf: unexpected response');
  // The page navigates to it, so only a web address will do.
  const url = new URL(body.url);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('legal pdf: unexpected link');
  return url.href;
}
