import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';
import { saveCookieChoice, useVideosAllowed } from '../consent/cookieChoice';

const HOW_IT_WORKS_VIDEOS = [
  {
    label: 'GRIDGO Organizations',
    badge: 'Organizations',
    youtubeId: 'nFvyJB_Xiw4',
    embedSrc:
      'https://www.youtube.com/embed/nFvyJB_Xiw4?mute=1&loop=1&playlist=nFvyJB_Xiw4&controls=1&rel=0',
    iframeTitle: 'GRIDGO Organizations',
    description:
      'See how teams request print work, review proofs, and track delivery from one dashboard.',
  },
  {
    label: 'GRIDGO Supplier',
    badge: 'Supplier',
    youtubeId: 'Oqo_ZUgPStk',
    embedSrc:
      'https://www.youtube.com/embed/Oqo_ZUgPStk?mute=1&loop=1&playlist=Oqo_ZUgPStk&controls=1&rel=0',
    iframeTitle: 'GRIDGO Supplier',
    description:
      'See how print shops accept jobs, produce the work, and hand off to GRIDGO delivery.',
  },
] as const;

type WalkthroughVideo = (typeof HOW_IT_WORKS_VIDEOS)[number];

function YoutubeThumb({ id, alt }: { id: string; alt: string }) {
  const [src, setSrc] = useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);
  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setSrc(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
    />
  );
}

/**
 * YouTube sets its own tracking cookies as soon as the player loads, so
 * without the visitor's permission (src/consent/cookieChoice.ts) pressing play
 * asks first, in place, rather than loading the player.
 */
function YoutubeConsentPrompt({
  video,
  onAllow,
  onCancel,
}: {
  video: WalkthroughVideo;
  onAllow: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const allowRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    allowRef.current?.focus();
  }, []);

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className="absolute inset-0 z-[3] flex flex-col items-center justify-center overflow-y-auto bg-black/85 px-6 py-6 text-center backdrop-blur-sm"
    >
      <h3 id={titleId} className="text-xl sm:text-2xl font-bold leading-snug text-white">
        This video plays from YouTube
      </h3>
      <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-white/75">
        YouTube sets its own cookies when the video loads. Allow YouTube videos to watch it here, or
        open it on YouTube instead.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          ref={allowRef}
          type="button"
          onClick={onAllow}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#FFDE58] px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFDE58]"
        >
          <Play size={16} fill="currentColor" aria-hidden />
          Allow and play
        </button>
        <a
          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-white/80 px-5 py-2.5 text-sm font-bold text-white transition hover:border-[#FFDE58] hover:text-[#FFDE58] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFDE58]"
        >
          Watch on YouTube
          <ExternalLink size={16} aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="mt-4 min-h-11 px-3 text-sm font-semibold text-white/70 underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFDE58] rounded"
      >
        Not now
      </button>
    </div>
  );
}

function WalkthroughCard({
  video,
  dimmed = false,
  playing = false,
  asking = false,
  focusPlay = false,
  onPlay,
  onAllow,
  onCancel,
}: {
  video: WalkthroughVideo;
  dimmed?: boolean;
  playing?: boolean;
  asking?: boolean;
  /** Put focus back on Play after the YouTube prompt is dismissed. */
  focusPlay?: boolean;
  onPlay?: () => void;
  onAllow?: () => void;
  onCancel?: () => void;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-[#0B0B0B] border border-white/10 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.65)]">
      {playing ? (
        <iframe
          src={`${video.embedSrc}&autoplay=1`}
          title={video.iframeTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <>
          <YoutubeThumb id={video.youtubeId} alt={video.label} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
          {!dimmed && onPlay && !asking && (
            <button
              ref={focusPlay ? (button) => button?.focus() : undefined}
              type="button"
              onClick={onPlay}
              aria-label={`Play ${video.label}`}
              className="absolute inset-x-0 top-0 z-[2] flex h-[56%] items-center justify-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-black shadow-[0_0_32px_rgba(255,222,88,0.4)] transition-transform duration-300 hover:scale-105">
                <Play size={28} fill="currentColor" className="ml-0.5" />
              </span>
            </button>
          )}
          <div className="absolute inset-x-0 bottom-0 z-[1] p-5 sm:p-7 md:p-8 pt-20 pointer-events-none">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
              {video.badge}
            </span>
            <h3 className="mt-3 font-heading text-2xl sm:text-3xl md:text-[2.15rem] font-bold tracking-tight text-white">
              {video.label}
            </h3>
            <p className="mt-2 max-w-2xl text-sm md:text-base leading-relaxed text-white/70 line-clamp-2 md:line-clamp-3">
              {video.description}
            </p>
          </div>
          {asking && onAllow && onCancel && (
            <YoutubeConsentPrompt video={video} onAllow={onAllow} onCancel={onCancel} />
          )}
        </>
      )}
      {dimmed && <div className="absolute inset-0 bg-black/30 pointer-events-none" />}
    </div>
  );
}

function NavDisc({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-primary)]/45 bg-black/55 text-[var(--color-primary)] backdrop-blur-md shadow-[0_0_24px_rgba(255,222,88,0.16)] transition-all duration-300 hover:border-[var(--color-primary)] hover:bg-black/70 hover:shadow-[0_0_28px_rgba(255,222,88,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

export function HowItWorksVideos() {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const videosAllowed = useVideosAllowed();
  const [playRequested, setPlayRequested] = useState(false);
  const [direction, setDirection] = useState(1);
  const [focusPlay, setFocusPlay] = useState(false);
  // Withdrawing permission in Cookie settings unloads a playing video.
  const playing = playRequested && videosAllowed;
  const asking = playRequested && !videosAllowed;

  const count = HOW_IT_WORKS_VIDEOS.length;
  const active = HOW_IT_WORKS_VIDEOS[activeIndex];

  const go = useCallback(
    (delta: number) => {
      setDirection(delta >= 0 ? 1 : -1);
      setPlayRequested(false);
      setFocusPlay(false);
      setActiveIndex((current) => (current + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (playRequested || reduceMotion) return;
    const timer = setInterval(() => {
      go(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [go, playRequested, reduceMotion]);

  return (
    <div id="how-it-works-videos" className="mt-32 relative max-w-5xl mx-auto px-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-50px' }}
        className="relative flex flex-col items-center"
      >
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="How GRIDGO works walkthroughs"
          className="relative w-full h-[22rem] sm:h-[26rem] md:h-[30rem] lg:h-[35rem] overflow-hidden"
        >
          <motion.div
            key={active.youtubeId}
            role="group"
            aria-roledescription="slide"
            aria-label={`${activeIndex + 1} of ${count}: ${active.label}`}
            className="relative z-20 h-full w-full"
            initial={reduceMotion ? { opacity: 0.4 } : { opacity: 0.4, x: direction > 0 ? 36 : -36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            drag={playRequested ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={(_, info) => {
              if (info.offset.x < -72) go(1);
              if (info.offset.x > 72) go(-1);
            }}
          >
            <WalkthroughCard
              video={active}
              playing={playing}
              asking={asking}
              focusPlay={focusPlay}
              onPlay={() => {
                setFocusPlay(false);
                setPlayRequested(true);
              }}
              onAllow={() => saveCookieChoice(true)}
              onCancel={() => {
                setFocusPlay(true);
                setPlayRequested(false);
              }}
            />
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-8 mt-10">
          <NavDisc label="Previous walkthrough" onClick={() => go(-1)}>
            <ChevronLeft size={22} />
          </NavDisc>
          <div className="flex gap-2">
            {HOW_IT_WORKS_VIDEOS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to video ${idx + 1}`}
                onClick={() => {
                  if (idx === activeIndex) return;
                  setDirection(idx > activeIndex ? 1 : -1);
                  setPlayRequested(false);
                  setFocusPlay(false);
                  setActiveIndex(idx);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? 'w-8 bg-[var(--color-primary)]'
                    : 'w-2.5 bg-gray-400/30 dark:bg-gray-600/50 hover:bg-gray-400/50 dark:hover:bg-gray-500/50'
                }`}
              />
            ))}
          </div>
          <NavDisc label="Next walkthrough" onClick={() => go(1)}>
            <ChevronRight size={22} />
          </NavDisc>
        </div>

        <p className="sr-only" aria-live="polite">
          {active.label}
        </p>
      </motion.div>
    </div>
  );
}
