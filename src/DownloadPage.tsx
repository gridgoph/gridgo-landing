import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Download,
  Moon,
  ShieldCheck,
  Sun,
  Users,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { GRIDGO_APPS, minimumAndroidVersion } from './utils/landingLinks';
import type { GridgoApp } from './utils/landingLinks';
import {
  fetchApkRelease,
  formatBytes,
  formatExactBytes,
  formatUpdated,
} from './utils/apkReleases';
import type { ApkRelease } from './utils/apkReleases';
import { useTheme } from './utils/useTheme';
import { EarlyAccessForm } from './earlyAccess/EarlyAccessForm';
import { AppChoice } from './earlyAccess/AppChoice';
import { AndroidMark, AppleMark, GooglePlayMark } from './components/BrandMarks';
import {
  appFromSearch,
  DEFAULT_APP,
  DEFAULT_PLATFORM,
  EARLY_ACCESS_NOTE,
  SECTION_COPY,
  SHOP_STEPS,
  SHOP_TEAM_NOTE,
  SIGN_UP_STEPS,
  type EarlyApp,
  type Platform,
} from './earlyAccess/logic';

/** The machine-readable facts about a build, set in mono like the site footer. */
function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-black/5 dark:border-white/5 last:border-0">
      <span className="text-[10px] tracking-[0.2em] uppercase text-gray-500 dark:text-[#666] font-mono shrink-0">
        {label}
      </span>
      <span className="text-[13px] font-mono text-gray-800 dark:text-gray-200 text-right">
        {value}
      </span>
    </div>
  );
}

function Checksum({ value }: { value: string }) {
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
      // Clipboard blocked. The digest is selectable text, so nothing is lost.
    }
  };

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] tracking-[0.2em] uppercase text-gray-500 dark:text-[#666] font-mono">
          SHA-256
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase font-mono text-gray-500 dark:text-[#666] hover:text-[var(--color-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] rounded"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <code className="block text-[11px] leading-[1.7] font-mono text-gray-600 dark:text-gray-400 break-all select-all rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-black/40 px-3 py-2.5">
        {value}
      </code>
    </div>
  );
}

function AppCard({ app, index, featured }: { app: GridgoApp; index: number; featured: boolean }) {
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
      initial={{ opacity: 0, y: 30, filter: 'blur(15px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-50px' }}
      className={`relative rounded-3xl border p-8 md:p-10 flex flex-col overflow-hidden transition-all duration-500 ${
        featured
          ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/[0.05] hover:border-[var(--color-primary)]/80'
          : 'border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/20 dark:hover:border-white/20'
      }`}
    >
      {featured && (
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/10 blur-[100px] pointer-events-none rounded-full" />
      )}

      <div className="relative z-10 flex flex-col h-full">
        <img
          src={app.icon}
          alt=""
          width={72}
          height={72}
          className={`w-[72px] h-[72px] rounded-2xl mb-7 ${
            featured
              ? 'shadow-[0_0_20px_rgba(255,222,88,0.3)] ring-1 ring-[var(--color-primary)]/40'
              : 'ring-1 ring-black/10 dark:ring-white/10'
          }`}
        />

        <div className="flex flex-col items-start gap-2 mb-3">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--color-primary)] font-bold">
            {app.audience}
          </p>
          <span className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border border-black/10 dark:border-white/15 text-gray-600 dark:text-gray-400">
            Android only, install now
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">{app.name}</h2>
        <p className="text-[11px] font-mono text-gray-500 dark:text-[#666] mb-5 break-all">
          {app.slug}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
          {app.whoItIsFor}
        </p>

        <div className="mt-auto">
          {release.state === 'loading' && (
            <div className="h-[50px] rounded-full bg-black/5 dark:bg-white/5 animate-pulse" />
          )}

          {release.state === 'unavailable' && (
            <div className="rounded-full border border-dashed border-black/15 dark:border-white/15 px-6 py-3.5 text-center">
              <span className="text-[11px] tracking-[0.25em] uppercase font-mono text-gray-500 dark:text-[#666]">
                Coming soon
              </span>
            </div>
          )}

          {release.state === 'available' && (
            <>
              <a
                href={release.downloadUrl}
                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-bold text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                  featured
                    ? 'bg-[var(--color-primary)] text-black hover:brightness-110 shadow-[0_0_15px_rgba(255,222,88,0.3)]'
                    : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                }`}
              >
                <Download size={17} />
                Download APK
              </a>

              {/* Version and size sit under the button so a short download is easy to spot. */}
              <p className="mt-3 text-center text-[13px] font-mono text-gray-600 dark:text-gray-400">
                {release.sidecar.version
                  ? `Version ${release.sidecar.version} · ${formatBytes(release.sidecar.bytes)}`
                  : formatBytes(release.sidecar.bytes)}
              </p>

              <div className="mt-6">
                <DataRow label="Exact size" value={formatExactBytes(release.sidecar.bytes)} />
                <DataRow label="Updated" value={updated ?? '—'} />
                <DataRow label="Requires" value={`Android ${minimumAndroidVersion}+`} />
              </div>

              <Checksum value={release.sidecar.sha256} />
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
}

/**
 * Some phones answer a signing-key clash or a cut-short download with the same
 * "package appears to be invalid" message (gridgoph/gridgo-supplier#75), so the
 * fix sits right under the buttons rather than in the steps further down.
 */
function InstallHelp() {
  return (
    <div className="max-w-3xl mx-auto mt-8 mb-24 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
      <p className="text-center px-2">
        Phone says the app isn't installed or the package is invalid? Uninstall any older GRIDGO
        app first, check the download finished at the full size above, then install again.
      </p>

      <details className="group mt-5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
        <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden px-5 py-3.5 rounded-2xl font-bold text-black dark:text-white hover:text-[var(--color-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]">
          Installing on Android
          <ChevronDown
            size={18}
            aria-hidden="true"
            className="shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <dl className="px-5 pb-5 space-y-4">
          <div>
            <dt className="font-bold text-black dark:text-white mb-1">Allow installs from your browser</dt>
            <dd>
              The first time, Android stops and says your browser isn't allowed to install apps.
              Tap Settings on that message, turn on "Allow from this source" for the browser you
              downloaded with, such as Chrome or Samsung Internet, then go back and tap Install.
            </dd>
          </div>
          <div>
            <dt className="font-bold text-black dark:text-white mb-1">Where the file lands</dt>
            <dd>
              It saves to Downloads. If the notification is gone, open your Files app (My Files on
              Samsung), go to Downloads and tap the file ending in .apk, such as{' '}
              <span className="font-mono text-[13px] whitespace-nowrap">gridgo-supplier.apk</span>.
            </dd>
          </div>
          <div>
            <dt className="font-bold text-black dark:text-white mb-1">Checking the size</dt>
            <dd>
              Phones don't all count megabytes the same way, so your Files app may show a figure
              about 5% higher than the one above. A file much smaller than that stopped partway:
              delete it and download again.
            </dd>
          </div>
        </dl>
      </details>
    </div>
  );
}

/** A real ordered procedure, which is why these are numbered. */
const INSTALL_STEPS: [string, string][] = [
  [
    'Tap download',
    'Your phone saves a file ending in .apk. If the browser asks whether to keep it, choose to keep it.',
  ],
  [
    'Open the file',
    'Pull down the notification shade and tap the finished download, or find it under Downloads in your Files app.',
  ],
  [
    'Allow this source',
    'Android will say the app you downloaded from is not allowed to install apps. Tap Settings on that message, turn on "Allow from this source", then press back. You only do this once.',
  ],
  [
    'Install and open',
    'It takes a few seconds. If your phone offers to scan the app first, let it.',
  ],
];

/** The two ways in, side by side. Each card jumps to its section below. */
function InstallChoices() {
  return (
    <nav aria-label="Ways to install" className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <a
        href="#early-access"
        className="group relative flex items-start gap-5 rounded-3xl border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/[0.07] p-6 md:p-8 transition hover:bg-[var(--color-primary)]/[0.12] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
      >
        <span className="shrink-0 size-12 rounded-2xl bg-[var(--color-primary)] text-black flex items-center justify-center gap-0.5">
          <AndroidMark className="size-[18px]" />
          <AppleMark className="size-[17px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Option 1</span>
            <span className="text-[11px] font-bold rounded-full px-2.5 py-0.5 bg-[var(--color-primary)] text-black">
              Recommended
            </span>
          </span>
          <span className="block text-xl font-bold leading-snug">Early Access</span>
          <span className="block mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Android or iPhone. Updates arrive on their own.
          </span>
        </span>
        <ArrowDown
          size={20}
          aria-hidden="true"
          className="shrink-0 mt-1 text-[var(--color-primary)] transition-transform group-hover:translate-y-1 motion-reduce:transition-none"
        />
      </a>

      <a
        href="#apk"
        className="group relative flex items-start gap-5 rounded-3xl border border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.02] p-6 md:p-8 transition hover:border-black/30 dark:hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
      >
        <span className="shrink-0 size-12 rounded-2xl border border-black/15 dark:border-white/15 flex items-center justify-center">
          <Download size={22} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Option 2</span>
          <span className="block text-xl font-bold leading-snug">Direct Download (APK)</span>
          <span className="block mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Install the file now. Android only.
          </span>
        </span>
        <ArrowDown
          size={20}
          aria-hidden="true"
          className="shrink-0 mt-1 text-gray-500 transition-transform group-hover:translate-y-1 motion-reduce:transition-none"
        />
      </a>
    </nav>
  );
}

function EarlyAccessSection() {
  const { search } = useLocation();
  // `?app=shop` (every "for print shops" link) preselects the shop app; the switch still works.
  const [app, setApp] = useState<EarlyApp>(() => appFromSearch(search) ?? DEFAULT_APP);
  const [platform, setPlatform] = useState<Platform>(DEFAULT_PLATFORM);
  // A later link with another ?app= (same page, new address) picks again.
  const linkedApp = appFromSearch(search);
  const [seenLink, setSeenLink] = useState(linkedApp);
  if (linkedApp !== seenLink) {
    setSeenLink(linkedApp);
    if (linkedApp) setApp(linkedApp);
  }
  const shop = app === 'shop';
  const copy = SECTION_COPY[app];
  const steps = shop ? SHOP_STEPS : SIGN_UP_STEPS[platform];
  return (
    <section id="early-access" className="scroll-mt-8 pt-20 md:pt-28">
      <div className="relative overflow-clip rounded-3xl border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/[0.05] p-6 sm:p-8 md:p-14">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[var(--color-primary)]/15 blur-[100px] pointer-events-none rounded-full" />
        {/* The app comes first on every screen: the title, steps and form below follow it. */}
        <div className="relative mb-10 md:mb-12 md:max-w-2xl">
          <AppChoice value={app} onChange={setApp} />
        </div>
        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_minmax(0,420px)] gap-8 md:gap-16 items-start">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[var(--color-primary-text)] mb-3 font-bold">
              Option 1
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{shop ? copy.title : 'Early Access'}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {shop ? copy.intro : <>For the GRIDGO customer app. {EARLY_ACCESS_NOTE}</>}
            </p>
            {/* Steps beside the form follow the app and the phone chosen in it.
                A shop sees its steps on a phone too: the last two are what the test asks of it. */}
            <ol className={`${shop ? 'flex' : 'hidden md:flex'} flex-col gap-5 mt-8 md:mt-10`}>
              {steps.map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full border border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10 text-[var(--color-primary-text)] font-mono text-[13px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-gray-700 dark:text-gray-300 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            {shop ? (
              <p className="mt-8 flex items-start gap-3 rounded-2xl border border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/[0.03] px-4 py-3.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                <Users size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--color-primary-text)]" />
                <span>{SHOP_TEAM_NOTE}</span>
              </p>
            ) : null}
          </div>
          <EarlyAccessForm app={app} platform={platform} onPlatformChange={setPlatform} />
        </div>
      </div>
    </section>
  );
}

export function DownloadPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const featuredKey = GRIDGO_APPS[0]?.key;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative overflow-x-hidden custom-scrollbar">
      {/* Ambient wash, matching the support page's treatment */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-[var(--color-primary)]/[0.07] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-14 md:py-20">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] rounded"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <button
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 30, filter: 'blur(15px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-xs tracking-[0.35em] uppercase text-[var(--color-primary)] mb-3 font-bold">
            Three apps. One grid.
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Get GRIDGO</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Two ways to install. Pick the one that fits you.
          </p>
        </motion.header>

        <InstallChoices />

        <EarlyAccessSection />

        {/* Option 2: the three APKs */}
        <section id="apk" className="scroll-mt-8 pt-20 md:pt-28">
          <header className="mb-10 md:mb-12 max-w-2xl">
            <p className="text-xs tracking-[0.35em] uppercase text-[var(--color-primary-text)] mb-3 font-bold">
              Option 2
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Direct Download (APK)</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              Each side of a print job has its own app. Pick the one that describes you.
            </p>
          </header>

          {/* The three apps */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {GRIDGO_APPS.map((app, i) => (
              <AppCard key={app.key} app={app} index={i} featured={app.key === featuredKey} />
            ))}
          </div>
        </section>

        <InstallHelp />

        {/* Install steps */}
        <motion.section
          initial={{ opacity: 0, y: 30, filter: 'blur(15px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-50px' }}
          className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-8 md:p-14 mb-8"
        >
          <p className="text-xs tracking-[0.35em] uppercase text-[var(--color-primary)] mb-3 font-bold">
            First time
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How to install it</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed mb-12">
            Installing GRIDGO takes four steps the first time, and one tap after that.
          </p>

          <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {INSTALL_STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-5">
                <span className="shrink-0 w-9 h-9 rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-mono text-[13px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-1">
                  <p className="font-bold mb-1.5">{title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.section>

        {/* Signed by GRIDGO + stores in preparation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-50px' }}
          className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8 justify-between"
        >
          <div className="flex items-start gap-4 max-w-xl">
            <ShieldCheck
              size={26}
              className="text-[var(--color-primary)] shrink-0 mt-0.5"
              strokeWidth={1.5}
            />
            <div className="min-w-0">
              <h2 className="text-lg font-bold mb-2">Signed by GRIDGO</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Every build here is signed with our own release key. The SHA-256 on each app is the
                checksum of the exact file we published, so you can verify what you downloaded.
              </p>
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            {/* App Store button */}
            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-black/40 rounded-lg px-3 py-1.5 flex items-center gap-2 h-[44px] opacity-70">
              <AppleMark className="w-[22px] h-[22px]" />
              <div className="flex flex-col items-start justify-center">
                <span className="text-[14px] font-semibold leading-[1]">App Store</span>
              </div>
            </div>

            {/* Google Play: early access is open, so this one is live */}
            <a
              href="#early-access"
              className="border border-black/20 dark:border-white/20 bg-white dark:bg-black/40 rounded-lg px-3 py-1.5 flex items-center gap-2 h-[44px] hover:border-[var(--color-primary)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              <GooglePlayMark className="w-[22px] h-[22px]" />
              <div className="flex flex-col items-start justify-center">
                <span className="text-[14px] font-semibold leading-[1]">Google Play</span>
              </div>
            </a>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
