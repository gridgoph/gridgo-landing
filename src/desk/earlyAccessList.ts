/**
 * The desk's early-access list as a reducer, kept free of React and the
 * network so scripts/check-early-access.mjs can replay the races it guards.
 *
 * Every request carries the filter/search it was made for and a generation.
 * A response only lands if both still match: a slow "Show more" from Pending
 * can never append to Granted, and a grant (which changes what Pending means)
 * starts a fresh generation that reloads from offset zero rather than paging
 * on from an offset the server no longer agrees with.
 */
import type { EarlyAccessPage, EarlyAccessSignup } from './api';

export type ListState = {
  /** `${filter}|${query}` the rows belong to. */
  key: string;
  generation: number;
  rows: EarlyAccessSignup[];
  counts: { pending: number; granted: number };
  total: number;
  loading: boolean;
  loadingMore: boolean;
  error: string;
};

export type ListAction =
  /** A first page for `key` was requested (new filter, new search, or a reload after a grant). */
  | { type: 'request'; key: string; generation: number }
  /** The next page of the current list was requested. */
  | { type: 'request-more' }
  | { type: 'page'; key: string; generation: number; offset: number; page: EarlyAccessPage }
  | { type: 'failed'; key: string; generation: number; offset: number; message: string }
  /** A grant came back: show the updated row until the reload replaces the list. */
  | { type: 'granted'; row: EarlyAccessSignup };

export const initialList: ListState = {
  key: '',
  generation: 0,
  rows: [],
  counts: { pending: 0, granted: 0 },
  total: 0,
  loading: true,
  loadingMore: false,
  error: '',
};

export function listKey(filter: string, query: string): string {
  return `${filter}|${query}`;
}

function current(state: ListState, action: { key: string; generation: number }): boolean {
  return action.key === state.key && action.generation === state.generation;
}

export function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case 'request':
      return {
        ...state,
        key: action.key,
        generation: action.generation,
        loading: true,
        loadingMore: false,
        error: '',
        // A reload of the same list keeps its rows on screen until the fresh page lands.
        rows: action.key === state.key ? state.rows : [],
      };
    case 'request-more':
      return { ...state, loadingMore: true, error: '' };
    case 'page': {
      if (!current(state, action)) return state;
      const rows =
        action.offset === 0
          ? action.page.signups
          : [...state.rows, ...action.page.signups.filter((row) => !state.rows.some((r) => r.id === row.id))];
      return {
        ...state,
        rows,
        counts: action.page.counts,
        total: action.page.total,
        loading: false,
        loadingMore: false,
        error: '',
      };
    }
    case 'failed':
      if (!current(state, action)) return state;
      return {
        ...state,
        rows: action.offset === 0 ? [] : state.rows,
        loading: false,
        loadingMore: false,
        error: action.message,
      };
    case 'granted':
      return { ...state, rows: state.rows.map((row) => (row.id === action.row.id ? action.row : row)) };
  }
}

/** Another page exists on the server for the list on screen. */
export function hasMore(state: ListState): boolean {
  return !state.loading && state.rows.length < state.total;
}

// ── Phone type ─────────────────────────────────────────────────────────────

export type Phone = 'android' | 'iphone';

/** The phone a sign-up is for. Rows from before iPhone sign-up (or without the field) are Android. */
export function phoneOf(row: { platform?: string | null }): Phone {
  return row.platform === 'iphone' ? 'iphone' : 'android';
}

/** What staff do per phone, and how the desk words it. */
export const PHONE_COPY: Record<
  Phone,
  { label: string; action: string; busy: string; done: string; doneNote: string; reminder: string | null; notice: (email: string) => string }
> = {
  android: {
    label: 'Android',
    action: 'Grant',
    busy: 'Granting…',
    done: 'granted',
    doneNote: 'Invite sent',
    reminder: null,
    notice: (email) => `Granted. The Google Play invite is on its way to ${email}.`,
  },
  iphone: {
    label: 'iPhone',
    action: 'Mark added',
    busy: 'Saving…',
    done: 'added',
    doneNote: 'Apple invites',
    reminder: 'Add Apple ID in App Store Connect first',
    notice: (email) => `Marked added. Apple sends ${email} the TestFlight invite.`,
  },
};

/** The status word on a row: an iPhone that has been granted reads "added". */
export function statusLabel(row: { platform?: string | null; status: 'pending' | 'granted' }): string {
  return row.status === 'pending' ? 'pending' : PHONE_COPY[phoneOf(row)].done;
}
