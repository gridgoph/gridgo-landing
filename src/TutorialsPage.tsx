import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GRIDGO_APPS } from './utils/landingLinks';
import {
  TUTORIAL_GROUPS,
  isoDuration,
  tutorialPosterUrl,
  tutorialVideoUrl,
} from './utils/tutorials';
import type { Tutorial, TutorialGroup } from './utils/tutorials';
import { useTheme } from './utils/useTheme';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]';

/** Starting one video pauses any other, so two soundtracks never overlap. */
function pauseOthers(event: SyntheticEvent<HTMLVideoElement>) {
  document.querySelectorAll('video').forEach((video) => {
    if (video !== event.currentTarget) video.pause();
  });
}

function TutorialVideo({
  video,
  part,
  parts,
}: {
  video: Tutorial;
  part: number;
  parts: number;
}) {
  // A file not yet on the server 404s; say so instead of showing a dead player.
  // The 404 can land before React's onError is listening, so check the element
  // once it is mounted as well.
  const [missing, setMissing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleId = `${video.file}-title`;

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    if (element.error) {
      setMissing(true);
      return;
    }
    const onError = () => setMissing(true);
    element.addEventListener('error', onError);
    return () => element.removeEventListener('error', onError);
  }, []);

  return (
    <figure aria-labelledby={titleId}>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-black/10 dark:ring-white/10">
        {missing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-dashed border-white/15 rounded-2xl px-6 text-center">
            <p className="font-bold text-white">This video isn't up yet</p>
            <p className="text-sm text-gray-400">Check back soon.</p>
          </div>
        ) : (
          <video
            className="absolute inset-0 h-full w-full"
            src={tutorialVideoUrl(video)}
            poster={tutorialPosterUrl(video)}
            controls
            preload="metadata"
            playsInline
            aria-labelledby={titleId}
            ref={videoRef}
            onPlay={pauseOthers}
          />
        )}
      </div>

      <figcaption className="mt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 id={titleId} className="text-xl md:text-2xl font-bold tracking-tight">
            {parts > 1 && (
              <span className="mr-3 align-middle font-mono text-[13px] font-normal text-gray-500 dark:text-[#888]">
                {part} of {parts}
              </span>
            )}
            {video.title}
          </h3>
          <p className="font-mono text-[13px] text-gray-500 dark:text-[#888] flex gap-4">
            <span>{video.app}</span>
            <time dateTime={isoDuration(video.length)} aria-label={`${video.length} long`}>
              {video.length}
            </time>
          </p>
        </div>
        <p className="mt-2 max-w-[68ch] text-gray-600 dark:text-gray-400 leading-relaxed">
          {video.summary}
        </p>
      </figcaption>
    </figure>
  );
}

function GroupSection({ group }: { group: TutorialGroup }) {
  const app = GRIDGO_APPS.find((a) => a.key === group.appKey);
  const headingId = `${group.id}-heading`;

  return (
    <section
      id={group.id}
      aria-labelledby={headingId}
      className="scroll-mt-6 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 lg:gap-16 py-14 md:py-20 border-t border-black/10 dark:border-white/10"
    >
      <div className="lg:sticky lg:top-10 self-start flex lg:flex-col items-center lg:items-start gap-5">
        {app && (
          <img
            src={app.icon}
            alt=""
            width={64}
            height={64}
            className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl ring-1 ring-black/10 dark:ring-white/10 shrink-0"
          />
        )}
        <div className="min-w-0">
          <h2 id={headingId} className="text-3xl md:text-4xl font-bold tracking-tight">
            {group.name}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {group.intro}
          </p>
          {app && (
            <Link
              to="/download"
              className={`mt-3 inline-block text-sm font-semibold underline decoration-[var(--color-primary)] decoration-2 underline-offset-4 hover:text-[var(--color-primary)] transition-colors rounded ${focusRing}`}
            >
              Download {app.name}
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-14 md:space-y-16 min-w-0">
        {group.videos.map((video, i) => (
          <TutorialVideo key={video.file} video={video} part={i + 1} parts={group.videos.length} />
        ))}
      </div>
    </section>
  );
}

export function TutorialsPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative overflow-x-hidden custom-scrollbar">
      {/* Ambient wash, matching the download and support pages */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-[var(--color-primary)]/[0.07] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-14 md:py-20">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-16">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] transition-colors rounded ${focusRing}`}
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

        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 30, filter: 'blur(15px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-14 md:mb-16"
        >
          <p className="text-xs tracking-[0.35em] uppercase text-[var(--color-primary)] mb-3 font-bold">
            Learn the apps
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Tutorials</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg leading-relaxed">
            Step-by-step videos for each GRIDGO app. Find the one you use and follow along.
          </p>

          <nav aria-label="Tutorials by app" className="mt-8 flex flex-wrap gap-3">
            {TUTORIAL_GROUPS.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-black/15 dark:border-white/15 px-5 py-2 text-sm font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
              >
                {group.name}
                <span className="font-mono text-[12px] font-normal text-gray-500 dark:text-[#888]">
                  {group.videos.length === 1 ? '1 video' : `${group.videos.length} videos`}
                </span>
              </a>
            ))}
          </nav>
        </motion.header>

        {TUTORIAL_GROUPS.map((group) => (
          <GroupSection key={group.id} group={group} />
        ))}

        <section className="mt-6 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold mb-1">Still stuck?</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Send the GRIDGO Team a ticket and tell us where you got lost.
            </p>
          </div>
          <Link
            to="/support"
            className="shrink-0 self-start md:self-auto px-8 py-3 rounded-full bg-[var(--color-primary)] text-black font-bold text-sm hover:brightness-110 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            Open a ticket
          </Link>
        </section>
      </div>
    </div>
  );
}
