import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ImagePlus, X } from 'lucide-react';
import { apiBaseUrl } from './utils/apiBase';
import { useTheme } from './utils/useTheme';

/**
 * /report: anyone can tell the team about a problem. Issue text is the only
 * required field. Reports land in gridgo-api (`POST /issue-reports`) and are
 * written up later on the public reports site.
 */

const MAX_SHOTS = 6;
const MAX_ISSUE = 5000;
// Screenshots under this size go up untouched; larger ones are redrawn smaller.
const SEND_AS_IS_BYTES = 1.5 * 1024 * 1024;
const MAX_EDGE = 2400;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const CATEGORIES = [
  { value: 'bug', label: 'Bug, issue or concern' },
  { value: 'feature', label: 'Feature or change request' },
  { value: 'other', label: 'Something else' },
] as const;
type Category = (typeof CATEGORIES)[number]['value'];

type Shot = { id: string; name: string; preview: string; data: string };

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Keep small screenshots byte-exact; redraw big photos so the upload stays quick on mobile data. */
async function prepareShot(file: File): Promise<string> {
  if (file.size <= SEND_AS_IS_BYTES || file.type === 'image/gif') return readAsDataUrl(file);
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9));
  if (blob && blob.type === 'image/webp') return readAsDataUrl(blob);
  const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
  return jpeg ? readAsDataUrl(jpeg) : readAsDataUrl(file);
}

export function ReportPage() {
  useTheme();
  const issueId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [issue, setIssue] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const shotCount = useRef(0);
  useEffect(() => {
    shotCount.current = shots.length;
  }, [shots]);

  const addFiles = useCallback(async (files: Iterable<File>) => {
    const all = [...files];
    const images = all.filter((file) => ACCEPTED.includes(file.type));
    const room = MAX_SHOTS - shotCount.current;
    let message = images.length < all.length ? 'Only PNG, JPEG, WebP and GIF images can be attached.' : '';
    if (images.length > room) message = `You can attach up to ${MAX_SHOTS} screenshots.`;
    const prepared: Shot[] = [];
    for (const file of images.slice(0, Math.max(room, 0))) {
      try {
        const data = await prepareShot(file);
        prepared.push({ id: crypto.randomUUID(), name: file.name || 'Pasted screenshot', preview: data, data });
      } catch {
        message = `${file.name || 'That image'} could not be read. Try saving it as PNG or JPEG.`;
      }
    }
    shotCount.current += prepared.length;
    setShots((current) => [...current, ...prepared].slice(0, MAX_SHOTS));
    setNotice(message);
  }, []);

  // Paste a screenshot straight from the clipboard anywhere on the page.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const files = [...(event.clipboardData?.files ?? [])];
      if (!files.length) return;
      event.preventDefault();
      void addFiles(files);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addFiles]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!issue.trim()) {
      setStatus('error');
      setError('Describe the issue before sending.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl}/issue-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue: issue.trim(), category, screenshots: shots.map((shot) => shot.data) }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'The report could not be sent. Try again.');
      setReference(String(body.id || '').slice(0, 8).toUpperCase());
      setStatus('sent');
      setIssue('');
      setCategory(null);
      setShots([]);
      setNotice('');
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof TypeError
          ? 'The report could not reach GRIDGO. Check your connection and send it again.'
          : err instanceof Error
            ? err.message
            : 'The report could not be sent. Try again.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 pt-8 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] rounded"
        >
          <ArrowLeft size={16} aria-hidden />
          GRIDGO
        </Link>

        {/* The highlighter band is the tracker sheet's header row. */}
        <header className="mt-10 mb-10">
          <h1 className="inline bg-[#FFDE58] text-black px-2 -mx-2 box-decoration-clone text-4xl sm:text-5xl font-bold leading-[1.25]">
            Report an issue
          </h1>
          <p className="mt-5 max-w-prose text-base leading-relaxed text-gray-600 dark:text-gray-400">
            Tell us what went wrong or what should change. Screenshots help us find it faster.
          </p>
        </header>

        {status === 'sent' ? (
          <section aria-live="polite" className="border-t-4 border-[#FFDE58] pt-8">
            <h2 className="text-2xl font-bold">Report sent</h2>
            <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-400">
              Thanks. The team reviews every report and posts what it finds on the GRIDGO reports page.
              {reference && (
                <>
                  {' '}Your reference is <strong className="text-black dark:text-white">{reference}</strong>.
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-8 rounded-lg border-2 border-black dark:border-white px-5 py-2.5 font-semibold hover:bg-[#FFDE58] hover:text-black hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              Report another issue
            </button>
          </section>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-9">
            <div className="flex flex-col gap-2">
              <label htmlFor={issueId} className="font-semibold">
                What is the issue?
              </label>
              <textarea
                id={issueId}
                value={issue}
                onChange={(event) => setIssue(event.target.value)}
                maxLength={MAX_ISSUE}
                rows={7}
                required
                aria-describedby={`${issueId}-hint`}
                placeholder="Where it happened, what you did, and what you expected instead."
                className="w-full resize-y rounded-lg border-2 border-black/15 bg-white px-4 py-3 text-base text-black placeholder-gray-500 focus:border-black focus:outline-none focus:ring-4 focus:ring-[#FFDE58]/70 dark:border-white/25"
              />
              <p id={`${issueId}-hint`} className="text-right text-xs text-gray-500">
                {issue.length.toLocaleString()} / {MAX_ISSUE.toLocaleString()}
              </p>
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 font-semibold">
                Category <span className="font-normal text-gray-500">(optional)</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((option) => {
                  const selected = category === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCategory(selected ? null : option.value)}
                      className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                        selected
                          ? 'border-black bg-[#FFDE58] text-black'
                          : 'border-black/15 dark:border-white/25 hover:border-black dark:hover:border-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex flex-col gap-3">
              <p className="font-semibold" id="shots-label">
                Screenshots <span className="font-normal text-gray-500">(optional, up to {MAX_SHOTS})</span>
              </p>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  void addFiles(event.dataTransfer.files);
                }}
                className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  dragging ? 'border-black bg-[#FFDE58]/40 dark:border-white' : 'border-black/20 dark:border-white/25'
                }`}
              >
                <button
                  type="button"
                  aria-describedby="shots-label"
                  disabled={shots.length >= MAX_SHOTS}
                  onClick={() => fileInput.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                >
                  <ImagePlus size={18} aria-hidden />
                  Add screenshots
                </button>
                <p className="mt-3 text-sm text-gray-500">or drop them here, or paste with Ctrl+V</p>
                <input
                  ref={fileInput}
                  type="file"
                  accept={ACCEPTED.join(',')}
                  multiple
                  hidden
                  onChange={(event) => {
                    if (event.target.files) void addFiles(event.target.files);
                    event.target.value = '';
                  }}
                />
              </div>
              {notice && <p className="text-sm text-orange-700 dark:text-orange-400">{notice}</p>}
              {shots.length > 0 && (
                <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {shots.map((shot) => (
                    <li key={shot.id} className="relative aspect-square overflow-hidden rounded-lg border border-black/15 dark:border-white/20 bg-gray-100 dark:bg-gray-900">
                      <img src={shot.preview} alt={shot.name} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setShots((current) => current.filter((item) => item.id !== shot.id))}
                        aria-label={`Remove ${shot.name}`}
                        className="absolute right-1.5 top-1.5 rounded-full bg-black/75 p-1 text-white hover:bg-black focus-visible:outline-2 focus-visible:outline-[#FFDE58]"
                      >
                        <X size={14} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {status === 'error' && (
              <p role="alert" className="rounded-lg border-2 border-red-600/40 bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="self-start rounded-lg bg-[#FFDE58] px-7 py-3.5 text-base font-bold text-black border-2 border-black hover:bg-[#ffd21f] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white"
            >
              {status === 'sending' ? 'Sending report…' : 'Send report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
