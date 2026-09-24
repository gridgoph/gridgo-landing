import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ClerkProvider, SignIn, useAuth, useClerk, useUser } from '@clerk/react';
import { Mark } from './Mark';
import {
  deleteTicket,
  listTickets,
  replyToTicket,
  setTokenProvider,
  type Ticket,
} from './api';

const DESK_EMAIL = 'gridgo26@gmail.com';
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? '';

type Filter = 'open' | 'closed' | 'all';

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DeskPage() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#070707] text-[#8a8a8a] px-6 text-center text-sm">
        Desk sign-in is not configured.
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/desk">
      <DeskGate />
    </ClerkProvider>
  );
}

function DeskGate() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';

  useEffect(() => {
    setTokenProvider(() => getToken());
    return () => setTokenProvider(null);
  }, [getToken]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#070707] text-[#8a8a8a] tracking-[0.3em] uppercase text-xs">
        Opening desk
      </div>
    );
  }

  if (!isSignedIn) {
    return <LoginScreen />;
  }

  if (email !== DESK_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#070707] text-[#f4f4f4]">
        <div className="w-full max-w-md">
          <p className="text-sm text-[#8a8a8a] mb-6">
            This desk only accepts {DESK_EMAIL}.
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className="py-3 px-6 bg-[#FFDE58] text-black font-bold tracking-wide"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <Desk username={email} onSignOut={() => signOut()} />;
}

function LoginScreen() {
  return (
    <div className="desk-sign-in min-h-screen flex items-center justify-center px-6 bg-[#070707] text-[#f4f4f4]">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <Mark size={22} />
          <div>
            <p className="text-xl font-extrabold tracking-[0.28em]">GRIDGO</p>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8a8a8a]">Ticketing desk</p>
          </div>
        </div>
        <p className="text-sm text-[#8a8a8a] mb-6">Sign in with {DESK_EMAIL}.</p>
        <SignIn
          routing="virtual"
          withSignUp={false}
          fallbackRedirectUrl="/desk"
          appearance={{
            elements: {
              rootBox: 'w-full',
              cardBox: 'w-full',
              card: 'w-full bg-[#101010] text-[#f4f4f4] border border-[#262626] shadow-none rounded-none',
              headerTitle: 'text-[#f4f4f4]',
              headerSubtitle: 'text-[#8a8a8a]',
              socialButtonsBlockButton: 'bg-[#070707] text-[#f4f4f4] border border-[#262626] rounded-none shadow-none',
              socialButtonsBlockButtonText: 'text-[#f4f4f4]',
              dividerLine: 'bg-[#262626]',
              dividerText: 'text-[#8a8a8a]',
              formFieldLabel: 'text-[#f4f4f4]',
              formFieldInput: 'bg-[#070707] text-[#f4f4f4] border border-[#262626] rounded-none shadow-none',
              formButtonPrimary: 'bg-[#FFDE58] text-black rounded-none shadow-none hover:bg-[#FFDE58]',
              footer: 'bg-transparent',
              footerActionText: 'text-[#8a8a8a]',
              footerActionLink: 'text-[#FFDE58]',
            },
          }}
        />
      </div>
    </div>
  );
}

function Desk({ username, onSignOut }: { username: string; onSignOut: () => void }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<Filter>('open');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listTickets()
      .then((rows) => {
        if (cancelled) return;
        setTickets(rows);
        setSelectedId((current) => current ?? rows.find((row) => row.status === 'open')?.id ?? rows[0]?.id ?? null);
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : 'Could not load tickets.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    if (filter === 'all') return tickets;
    return tickets.filter((ticket) => ticket.status === filter);
  }, [tickets, filter]);

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;
  const openCount = tickets.filter((ticket) => ticket.status === 'open').length;

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] bg-[#070707] text-[#f4f4f4]">
      <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <Mark size={18} />
          <div>
            <p className="font-extrabold tracking-[0.22em] text-sm">GRIDGO</p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#8a8a8a]">Ticketing desk</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <p className="text-[#8a8a8a]">
            {openCount} open
          </p>
          <p>{username}</p>
          <button type="button" onClick={onSignOut} className="text-[#FFDE58]">
            Sign out
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(280px,360px)_1fr] min-h-0">
        <aside className="border-b lg:border-b-0 lg:border-r border-[#262626] min-h-0 flex flex-col">
          <div className="flex gap-1 p-3 border-b border-[#262626] text-xs uppercase tracking-[0.18em]">
            {(['open', 'closed', 'all'] as Filter[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-2 ${filter === key ? 'text-black bg-[#FFDE58]' : 'text-[#8a8a8a]'}`}
              >
                {key}
              </button>
            ))}
          </div>
          <div className="desk-scroll overflow-y-auto flex-1">
            {loading ? (
              <p className="p-6 text-sm text-[#8a8a8a]">Loading queue…</p>
            ) : visible.length === 0 ? (
              <p className="p-6 text-sm text-[#8a8a8a]">No tickets in this queue.</p>
            ) : (
              visible.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket.id)}
                  className={`w-full text-left px-5 py-4 border-b border-[#1c1c1c] ${
                    ticket.id === selectedId ? 'bg-[#161616]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span
                      className={`text-[10px] uppercase tracking-[0.2em] ${
                        ticket.status === 'open' ? 'text-[#FFDE58]' : 'text-[#8a8a8a]'
                      }`}
                    >
                      {ticket.status}
                    </span>
                    <span className="text-[11px] text-[#8a8a8a]">{formatWhen(ticket.createdAt)}</span>
                  </div>
                  <p className="font-semibold truncate">{ticket.subject}</p>
                  <p className="text-sm text-[#8a8a8a] truncate">{ticket.name}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="min-h-0 desk-scroll overflow-y-auto p-6 md:p-10">
          {error ? <p className="text-red-400 text-sm mb-4">{error}</p> : null}
          {notice ? <p className="text-[#FFDE58] text-sm mb-4">{notice}</p> : null}
          {selected ? (
            <TicketPane
              key={selected.id}
              ticket={selected}
              onReplied={async (updated) => {
                setTickets((current) => current.map((row) => (row.id === updated.id ? updated : row)));
              }}
              onDeleted={async (id) => {
                setTickets((current) => current.filter((row) => row.id !== id));
                setSelectedId(null);
              }}
              onError={setError}
              onNotice={setNotice}
            />
          ) : (
            <p className="text-[#8a8a8a]">Select a ticket from the queue.</p>
          )}
        </main>
      </div>
    </div>
  );
}

function TicketPane({
  ticket,
  onReplied,
  onDeleted,
  onError,
  onNotice,
}: {
  ticket: Ticket;
  onReplied: (ticket: Ticket) => Promise<void>;
  onDeleted: (id: string) => Promise<void>;
  onError: (message: string) => void;
  onNotice: (message: string) => void;
}) {
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  async function sendReply(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    onError('');
    onNotice('');
    try {
      const updated = await replyToTicket(ticket.id, reply);
      await onReplied(updated);
      setReply('');
      if (updated.emailSent === false) {
        onError('Reply saved, but Gmail did not accept the email. Check EMAIL_USER / EMAIL_PASSWORD and the API log.');
      } else {
        onNotice(
          `Reply emailed to ${updated.email}. If they do not see it, have them check Spam and Promotions — Gmail accepted the message.`,
        );
      }
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : 'Could not send reply.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    onError('');
    onNotice('');
    try {
      await deleteTicket(ticket.id);
      await onDeleted(ticket.id);
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : 'Could not delete ticket.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="max-w-3xl">
      <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a8a8a] mb-3">
        Ticket {ticket.id.slice(0, 8)} · {formatWhen(ticket.createdAt)}
      </p>
      <h1 className="text-3xl font-bold mb-2">{ticket.subject}</h1>
      <p className="text-[#cfcfcf] mb-8">
        {ticket.name} · {ticket.email}
      </p>

      <section className="border-l-2 border-[#333] pl-5 mb-10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a8a8a] mb-3">Customer message</p>
        <p className="whitespace-pre-wrap leading-relaxed text-[#e8e8e8]">{ticket.message}</p>
      </section>

      {ticket.status === 'closed' ? (
        <section className="border border-[#FFDE58]/30 bg-[#FFDE58]/5 p-6 mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#FFDE58] mb-3">Admin response</p>
          <p className="whitespace-pre-wrap leading-relaxed">{ticket.adminReply}</p>
        </section>
      ) : (
        <form onSubmit={sendReply} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            Reply — this is emailed to the customer
            <textarea
              rows={8}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              required
              className="bg-[#101010] text-[#f4f4f4] border border-[#262626] px-4 py-3 outline-none focus:border-[#FFDE58] resize-y"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !reply.trim()}
            className="self-start px-8 py-3 bg-[#FFDE58] text-black font-bold disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send reply'}
          </button>
        </form>
      )}

      {ticket.status === 'closed' ? (
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="mt-4 text-sm text-red-400 disabled:opacity-50"
        >
          Delete ticket
        </button>
      ) : null}
    </article>
  );
}
