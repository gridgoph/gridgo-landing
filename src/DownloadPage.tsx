import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GRIDGO_APPS, minimumAndroidVersion } from './utils/landingLinks';
import type { GridgoApp } from './utils/landingLinks';
import {
  fetchApkRelease,
  formatBytes,
  formatUpdated,
} from './utils/apkReleases';
import type { ApkRelease } from './utils/apkReleases';

function Sha256({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard is blocked (insecure context, or the user said no). The
      // digest is selectable text either way, so there is nothing to recover.
    }
  };

  return (
    <div className="mt-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5">
        SHA-256
      </p>
      <div className="flex items-start gap-2">
        <code className="flex-1 min-w-0 text-[11px] leading-relaxed text-gray-400 font-mono break-all select-all bg-black/50 border border-white/10 rounded-lg px-3 py-2">
          {value}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy the SHA-256 checksum"
          className="shrink-0 p-2 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <p className="text-[11px] text-gray-500 mt-1.5">
        {copied ? 'Copied.' : 'Optional: compare this against the file you downloaded.'}
      </p>
    </div>
  );
}

function AppDownloadPanel({ app, index }: { app: GridgoApp; index: number }) {
  const [release, setRelease] = useState<ApkRelease>({ state: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchApkRelease(app).then((result) => {
      if (!cancelled) setRelease(result);
    });
    return () => {
      cancelled = true;
    };
  }, [app]);

  const updated =
    release.state === 'available' ? formatUpdated(release.sidecar.updated) : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-60px' }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 flex flex-col"
    >
      <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-primary)] mb-2">
        {app.audience}
      </p>
      <h2 className="text-2xl font-bold mb-1">{app.name}</h2>
      <p className="text-xs text-gray-500 font-mono mb-4 break-all">{app.slug}</p>
      <p className="text-sm text-gray-300 leading-relaxed mb-6">{app.whoItIsFor}</p>

      <div className="mt-auto">
        {release.state === 'loading' && (
          <div className="h-[46px] rounded-full bg-white/5 border border-white/10 animate-pulse" />
        )}

        {release.state === 'unavailable' && (
          <>
            <div className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
              <TriangleAlert size={18} className="text-gray-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-300">Not available yet</p>
                <p className="text-[12px] text-gray-500 leading-relaxed">{release.reason}</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 mt-2">
              Check back here — this page shows a build the moment it is published.
            </p>
          </>
        )}

        {release.state === 'available' && (
          <>
            <a
              href={release.downloadUrl}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[var(--color-primary)] text-black font-bold text-sm hover:bg-[#FFE57F] transition-colors"
            >
              <Download size={18} />
              Download for Android
            </a>
            <dl className="grid grid-cols-2 gap-3 mt-4 text-left">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Size</dt>
                <dd className="text-sm font-semibold">{formatBytes(release.sidecar.bytes)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Updated</dt>
                <dd className="text-sm font-semibold">{updated ?? 'Unknown'}</dd>
              </div>
            </dl>
            <Sha256 value={release.sidecar.sha256} />
          </>
        )}
      </div>
    </motion.section>
  );
}

const INSTALL_STEPS = [
  [
    'Tap the download button',
    'Your phone saves a file ending in .apk. Chrome may warn you that this kind of file can harm your device — that warning appears for every app downloaded outside the Play Store. Tap "Download anyway".',
  ],
  [
    'Open the file',
    'Pull down the notification shade and tap the finished download, or open your Files app and find it under Downloads.',
  ],
  [
    'Allow this one source',
    'Android will say the browser or Files app is "not allowed to install unknown apps". Tap Settings on that message, turn on "Allow from this source", then press Back. You only do this once.',
  ],
  [
    'Tap Install, then Open',
    'The install takes a few seconds. If Play Protect asks to scan the app, let it — GRIDGO has nothing to hide.',
  ],
];

export function DownloadPage() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#FFDE58]/5 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors mb-12"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-[#FFDE58]/10 text-[var(--color-primary)] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#FFDE58]/20">
            <Smartphone size={18} />
            Android · {minimumAndroidVersion} or newer
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get GRIDGO</h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Three apps, one for each side of the job. Pick the one that describes you, install it, and
            you are in.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {GRIDGO_APPS.map((app, i) => (
            <AppDownloadPanel key={app.key} app={app} index={i} />
          ))}
        </div>

        {/* Sideloading instructions */}
        <motion.section
          initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-60px' }}
          className="rounded-3xl border border-[var(--color-primary)]/20 bg-[#0A0A0A] p-8 md:p-12 mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">How to install it</h2>
          <p className="text-sm text-gray-400 mb-8 max-w-2xl leading-relaxed">
            GRIDGO installs from a file you download here, not from the Play Store, so Android asks
            for permission the first time. Four steps, once per phone.
          </p>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {INSTALL_STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-black font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold mb-1">{title}</p>
                  <p className="text-[13px] text-gray-400 leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.section>

        {/* Distribution honesty */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-60px' }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10"
        >
          <div className="flex items-start gap-4">
            <ShieldCheck size={28} className="text-[var(--color-primary)] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="min-w-0">
              <h2 className="text-xl font-bold mb-3">Where these files come from</h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">
                Each app is signed by GRIDGO with our own release key and uploaded straight to this
                site. Downloading it here is currently the only way to install GRIDGO — there is no
                Google Play or App Store listing for any of these apps today. Play Store distribution
                is planned, and this page will say so when it happens.
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Because it does not come from a store, verify it if you want to: the SHA-256 shown on
                each app is the checksum of the exact file we published. Only install GRIDGO from
                gridgo.talasora.com — a GRIDGO APK offered anywhere else is not ours.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
