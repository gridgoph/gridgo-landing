import { useEffect, useReducer, useRef, useState } from 'react';
import { EARLY_ACCESS_PAGE_SIZE, grantEarlyAccess, listEarlyAccess, type EarlyAccessSignup } from './api';
import { PHONE_COPY, hasMore, initialList, listKey, listReducer, phoneOf, statusLabel } from './earlyAccessList';
import { PhoneMark } from './PhoneMark';

type Filter = 'pending' | 'granted' | 'all';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function message(caught: unknown, fallback: string): string {
  return caught instanceof Error ? caught.message : fallback;
}

/**
 * Early-access sign-ups for both phones. Android: add the email to the Play
 * tester group, then Grant, which emails the opt-in link. iPhone: add the Apple
 * ID to TestFlight in App Store Connect, then Mark added; Apple sends the invite.
 */
export function EarlyAccessDesk() {
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  /** Bumped after a grant: the list it changed is fetched again from the top. */
  const [reloads, setReloads] = useState(0);
  const [list, dispatch] = useReducer(listReducer, initialList);
  const generation = useRef(0);
  const [notice, setNotice] = useState('');
  const [grantError, setGrantError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search as the operator types, without a request per keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const key = listKey(filter, query);
  useEffect(() => {
    const ticket = { key: listKey(filter, query), generation: ++generation.current };
    dispatch({ type: 'request', ...ticket });
    listEarlyAccess({ status: filter, q: query, offset: 0 }).then(
      (page) => dispatch({ type: 'page', ...ticket, offset: 0, page }),
      (caught) => dispatch({ type: 'failed', ...ticket, offset: 0, message: message(caught, 'Could not load sign-ups.') }),
    );
  }, [filter, query, reloads]);

  useEffect(() => {
    if (!copiedId) return;
    const timer = window.setTimeout(() => setCopiedId(null), 1500);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  function loadMore() {
    // Tied to the list on screen now; the reducer drops it if the filter,
    // search or generation has moved on by the time it answers.
    const ticket = { key: list.key, generation: list.generation };
    const offset = list.rows.length;
    dispatch({ type: 'request-more' });
    listEarlyAccess({ status: filter, q: query, offset }).then(
      (page) => dispatch({ type: 'page', ...ticket, offset, page }),
      (caught) => dispatch({ type: 'failed', ...ticket, offset, message: message(caught, 'Could not load more sign-ups.') }),
    );
  }

  async function grant(row: EarlyAccessSignup) {
    setBusyId(row.id);
    setGrantError('');
    setNotice('');
    try {
      const updated = await grantEarlyAccess(row.id);
      dispatch({ type: 'granted', row: updated });
      // The grant moved this person out of Pending, so offsets into the old
      // list no longer line up with the server's. Fetch it again from the top.
      setReloads((count) => count + 1);
      setNotice(PHONE_COPY[phoneOf(updated)].notice(updated.email));
    } catch (caught) {
      setGrantError(message(caught, 'Could not grant access.'));
    } finally {
      setBusyId(null);
    }
  }

  async function copy(row: EarlyAccessSignup) {
    try {
      await navigator.clipboard.writeText(row.email);
      setCopiedId(row.id);
    } catch {
      // Clipboard blocked: the address is selectable text.
    }
  }

  const { rows, counts, total, loadingMore } = list;
  // Rows from another filter are never shown; a reload of this list keeps its rows up.
  const loading = list.key !== key || (list.loading && rows.length === 0);
  const error = grantError || list.error;
  const label: Record<Filter, string> = {
    pending: `Pending ${counts.pending}`,
    granted: `Granted ${counts.granted}`,
    all: `All ${counts.pending + counts.granted}`,
  };
  const more = list.key === key && hasMore(list);

  return (
    <main aria-labelledby="early-access-desk-title" className="min-h-0 desk-scroll overflow-y-auto p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl">
        <h1 id="early-access-desk-title" className="text-2xl md:text-3xl font-bold mb-2">Early access</h1>
        <ul className="text-sm text-[#a3a3a3] mb-6 max-w-2xl space-y-1">
          <li className="flex items-center gap-2">
            <PhoneMark phone="android" />
            <span>Add the email to the Play tester group, then Grant. GRIDGO emails the Play invite.</span>
          </li>
          <li className="flex items-center gap-2">
            <PhoneMark phone="iphone" />
            <span>Add the Apple ID to TestFlight in App Store Connect, then Mark added. Apple emails the invite.</span>
          </li>
        </ul>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex gap-1 text-xs uppercase tracking-[0.18em]" role="tablist" aria-label="Status">
            {(['pending', 'granted', 'all'] as Filter[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={`px-3 py-2 whitespace-nowrap ${filter === key ? 'text-black bg-[#FFDE58]' : 'text-[#8a8a8a] hover:text-[#f4f4f4]'}`}
              >
                {label[key]}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search email"
            aria-label="Search email"
            maxLength={254}
            className="sm:ml-auto w-full sm:w-72 bg-[#101010] text-[#f4f4f4] border border-[#262626] px-4 py-2.5 text-sm outline-none focus:border-[#FFDE58]"
          />
        </div>

        {error ? <p className="text-red-400 text-sm mb-4" role="alert">{error}</p> : null}
        {notice ? <p className="text-[#FFDE58] text-sm mb-4" role="status">{notice}</p> : null}

        {loading ? (
          <p className="py-10 text-sm text-[#8a8a8a]">Loading sign-ups…</p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-sm text-[#8a8a8a]">
            {query ? 'No sign-ups match that email.' : filter === 'pending' ? 'Nobody is waiting.' : 'No sign-ups yet.'}
          </p>
        ) : (
          <table className="w-full text-sm border-t border-[#262626]">
            <thead className="hidden md:table-header-group">
              <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
                <th className="py-3 pr-4 font-normal">Email</th>
                <th className="py-3 pr-4 font-normal">Phone</th>
                <th className="py-3 pr-4 font-normal">Source</th>
                <th className="py-3 pr-4 font-normal">Status</th>
                <th className="py-3 pr-4 font-normal">Signed up</th>
                <th className="py-3 font-normal"><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const phone = phoneOf(row);
                const phoneCopy = PHONE_COPY[phone];
                return (
                <tr
                  key={row.id}
                  className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-4 md:table-row md:py-0 border-b border-[#1c1c1c]"
                >
                  <td className="min-w-0 md:py-4 md:pr-4">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold break-all select-all">{row.email}</span>
                      <button
                        type="button"
                        onClick={() => copy(row)}
                        className="shrink-0 text-[11px] text-[#8a8a8a] hover:text-[#FFDE58]"
                      >
                        {copiedId === row.id ? 'Copied' : 'Copy'}
                      </button>
                    </span>
                  </td>
                  <td className="col-start-1 text-[#cfcfcf] md:py-4 md:pr-4 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <span className="md:hidden text-[#8a8a8a]">Phone:</span>
                      <PhoneMark phone={phone} className="text-[#f4f4f4]" />
                      {phoneCopy.label}
                    </span>
                  </td>
                  <td className="col-start-1 text-[#cfcfcf] md:py-4 md:pr-4">
                    <span className="md:hidden text-[#8a8a8a]">Source: </span>
                    {row.source ?? <span className="text-[#a3a3a3]">direct</span>}
                  </td>
                  <td className="col-start-1 md:py-4 md:pr-4">
                    <span
                      className={`text-[10px] uppercase tracking-[0.2em] ${
                        row.status === 'pending' ? 'text-[#FFDE58]' : 'text-[#8a8a8a]'
                      }`}
                    >
                      {statusLabel(row)}
                    </span>
                    {row.status === 'granted' && row.grantedAt ? (
                      <span className="block text-[11px] text-[#8a8a8a]">{formatDate(row.grantedAt)}</span>
                    ) : null}
                  </td>
                  <td className="col-start-1 text-[#8a8a8a] md:py-4 md:pr-4 whitespace-nowrap">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="col-start-2 row-start-1 row-span-5 self-center md:py-4 text-right">
                    {row.status === 'pending' ? (
                      <span className="inline-flex flex-col items-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => grant(row)}
                          disabled={busyId === row.id}
                          aria-describedby={phoneCopy.reminder ? `reminder-${row.id}` : undefined}
                          className="px-5 py-2.5 bg-[#FFDE58] text-black font-bold whitespace-nowrap disabled:opacity-50"
                        >
                          {busyId === row.id ? phoneCopy.busy : phoneCopy.action}
                        </button>
                        {phoneCopy.reminder ? (
                          <span id={`reminder-${row.id}`} className="text-[11px] leading-snug text-[#a3a3a3] max-w-[8rem] md:max-w-[11rem]">
                            {phoneCopy.reminder}
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-[#a3a3a3] text-xs">{phoneCopy.doneNote}</span>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {more && !loading ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="mt-6 px-6 py-3 border border-[#262626] text-[#f4f4f4] hover:border-[#FFDE58] disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : `Show ${Math.min(EARLY_ACCESS_PAGE_SIZE, total - rows.length)} more`}
          </button>
        ) : null}
      </div>
    </main>
  );
}
