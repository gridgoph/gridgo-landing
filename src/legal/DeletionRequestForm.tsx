import { useState } from 'react';
import { apiBaseUrl } from '../utils/apiBase';
import { submitDeletionRequest } from './deletionRequest';

export function DeletionRequestForm() {
  const [email, setEmail] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  if (sent) return <p role="status"><strong>We will delete your account within 30 days</strong><br />Operations will contact you to verify ownership. We never ask for your password.</p>;
  return <form className="flex flex-col gap-4 my-6" onSubmit={async (event) => {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { await submitDeletionRequest(email, confirmed, apiBaseUrl); setSent(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not send your request. Please try again.'); }
    finally { setBusy(false); }
  }}>
    <label className="flex flex-col gap-2">Your GRIDGO account email
      <input type="email" autoComplete="email" maxLength={254} required value={email} disabled={busy} onChange={(event) => setEmail(event.target.value)} className="min-h-11 rounded-lg border border-current bg-white text-black px-3 py-2" />
    </label>
    <label className="flex gap-3 items-start min-h-11 cursor-pointer">
      <input type="checkbox" required checked={confirmed} disabled={busy} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1 size-5 shrink-0" />
      <span>I request deletion of my GRIDGO account and personal data across GRIDGO apps. I understand deletion cannot be undone and some records must be retained as described below.</span>
    </label>
    {error && <p role="alert">{error}</p>}
    <button type="submit" disabled={busy} className="min-h-11 rounded-lg border border-current px-4 py-3 font-semibold disabled:opacity-50">{busy ? 'Sending request…' : 'Send deletion request'}</button>
    <noscript>Enable JavaScript to send this form, or use the email instructions below.</noscript>
  </form>;
}
