import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Pitch opener, once per browsing session.
 * Dots cascade, the top-right one takes the screen, and the yellow wordmark holds.
 * The yellow field then shrinks on its own onto the period after "Print."
 * Skip or scroll still finishes it early. Once it lands, the overlay and its
 * scroll room come down for good, so the top of the page is the hero.
 */
const HANDOFF_HOLD = 700;
const HANDOFF_MS = 1400;
const CENTRES = [0.15, 0.5, 0.85];
const RADIUS = 0.13;
const LIT_CELL = 2;
const ORDER = [6, 3, 0, 1, 4, 7, 8, 5, 2];
const LIT_STEP = ORDER.indexOf(LIT_CELL);
const LEAD_IN = 300;
const DOT_STAGGER = 90;
const DOT_MS = 400;
const GHOST = 0.08;
const CASCADE_SPAN = (ORDER.length - 1) * DOT_STAGGER + DOT_MS;
const ENGULF_AT = LEAD_IN + (ORDER.length - 1) * DOT_STAGGER + 120;
const ENGULF_MS = 600;
const WORDMARK_AT = ENGULF_AT + 700;
const WORDMARK_MS = 350;
const LINE_AT = WORDMARK_AT + 900;
const LINE_MS = 900;
const EASE_IN: [number, number, number, number] = [0.42, 0, 1, 1];
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FIELD = '#FFDE58';
const PLAYED_KEY = 'gridgo-opener-played';

let introFinished = false;

/**
 * sessionStorage throws when storage is blocked, the same as localStorage in
 * useTheme, so both directions fall back rather than taking the page down.
 */
function playedThisSession() {
  try {
    return sessionStorage.getItem(PLAYED_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberPlayed() {
  introFinished = true;
  try {
    sessionStorage.setItem(PLAYED_KEY, '1');
  } catch {
    // The module flag still skips it for in-app navigation this visit.
  }
}

function openerShouldPlay() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return !introFinished && !playedThisSession();
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
const dotProgress = (clock: number, step: number) => clamp01((clock - step * DOT_STAGGER) / DOT_MS);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const instant = 'instant' as ScrollBehavior;

function colourOf(cell: number) {
  if (cell % 3 < 2) return '#ffffff';
  return '#8a8a8a';
}

function isControl(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('a, button, input, select, textarea'));
}

function Dot({
  cell,
  cascade,
  size,
}: {
  cell: number;
  cascade: MotionValue<number>;
  size: number;
}) {
  const step = ORDER.indexOf(cell);
  const opacity = useTransform(cascade, (clock) => {
    const arrival = easeOutCubic(dotProgress(clock, step));
    return GHOST + (1 - GHOST) * arrival;
  });
  const scale = useTransform(cascade, (clock) => {
    const arrival = easeOutCubic(dotProgress(clock, step));
    return 0.4 + 0.6 * arrival;
  });
  const r = RADIUS * size;
  return (
    <motion.span
      className="absolute rounded-full"
      style={{
        left: CENTRES[cell % 3] * size - r,
        top: CENTRES[Math.floor(cell / 3)] * size - r,
        width: r * 2,
        height: r * 2,
        background: colourOf(cell),
        opacity,
        scale,
      }}
    />
  );
}

type Target = { cx: number; cy: number; d: number };
type Landing = { to: 'top' } | { to: 'keep'; bottom: number };

function measureDot(sticky: HTMLElement): Target | null {
  const dot = sticky.querySelector<HTMLElement>('[data-print-dot]');
  if (!dot) return null;
  const box = dot.getBoundingClientRect();
  if (box.width < 1) return null;
  return {
    cx: box.left + box.width / 2,
    cy: box.top + box.height / 2,
    d: Math.max(box.width, box.height),
  };
}

function readViewport() {
  return {
    w: typeof window === 'undefined' ? 0 : window.innerWidth,
    h: typeof window === 'undefined' ? 0 : window.innerHeight,
  };
}

export function OpenerStage({
  children,
  onHero,
  onNav,
  onSkipReady,
}: {
  children: ReactNode;
  onHero: () => void;
  onNav: () => void;
  /** Receives a function that jumps straight to the hero while the opener is up, and null once it is gone. */
  onSkipReady?: (skip: (() => void) | null) => void;
}) {
  const [play] = useState(openerShouldPlay);

  useLayoutEffect(() => {
    if (!play) {
      onHero();
      onNav();
    }
  }, [play, onHero, onNav]);

  if (!play) return children;
  return (
    <OpenerPlay onHero={onHero} onNav={onNav} onSkipReady={onSkipReady}>
      {children}
    </OpenerPlay>
  );
}

function OpenerPlay({
  children,
  onHero,
  onNav,
  onSkipReady,
}: {
  children: ReactNode;
  onHero: () => void;
  onNav: () => void;
  onSkipReady?: (skip: (() => void) | null) => void;
}) {
  const [vp, setVp] = useState(readViewport);
  const [held, setHeld] = useState(false);
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const heldRef = useRef(false);
  const doneRef = useRef(false);
  const navSent = useRef(false);
  const previousOverflow = useRef('');
  const stopRef = useRef<() => void>(() => {});
  const landing = useRef<Landing>({ to: 'top' });
  const onHeroRef = useRef(onHero);
  const onNavRef = useRef(onNav);
  const geometry = useRef({ top: 0, pin: 1 });
  const targetRef = useRef<Target>({ cx: 0, cy: 0, d: 14 });
  const vpRef = useRef(vp);
  const cascade = useMotionValue(0);
  const engulf = useMotionValue(0);
  const word = useMotionValue(0);
  const after = useMotionValue(0);
  const progress = useMotionValue(0);
  const circleX = useMotionValue(0);
  const circleY = useMotionValue(0);
  const circleScale = useMotionValue(1);
  const circleOpacity = useMotionValue(1);
  const landTint = useMotionValue(0);

  useLayoutEffect(() => {
    onHeroRef.current = onHero;
    onNavRef.current = onNav;
  }, [onHero, onNav]);

  const showNav = useCallback(() => {
    if (navSent.current) return;
    navSent.current = true;
    onNavRef.current();
  }, []);

  // The animations have run (or been cut short): the yellow wordmark holds and the page can scroll.
  const hold = useCallback(() => {
    if (heldRef.current) return;
    heldRef.current = true;
    engulf.set(1);
    word.set(1);
    after.set(1);
    rememberPlayed();
    document.body.style.overflow = previousOverflow.current;
    setHeld(true);
    onHeroRef.current();
  }, [engulf, word, after]);

  // The one way out. 'top' lands on the hero; 'keep' holds what the visitor is looking at in place.
  const finish = useCallback(
    (to: 'top' | 'keep') => {
      if (doneRef.current) return;
      stopRef.current();
      hold();
      doneRef.current = true;
      showNav();
      landing.current =
        to === 'top' ? { to } : { to, bottom: stageRef.current?.getBoundingClientRect().bottom ?? 0 };
      setDone(true);
    },
    [hold, showNav],
  );

  // Place the travelling circle for handoff progress p, with transforms only.
  const place = useCallback(
    (p: number) => {
      const view = vpRef.current;
      const target = targetRef.current;
      const cover = Math.hypot(view.w, view.h) || 1;
      const e = easeOutCubic(p);
      const d = lerp(cover, target.d || 14, e);
      circleX.set(lerp(view.w / 2, target.cx || view.w / 2, e) - cover / 2);
      circleY.set(lerp(view.h / 2, target.cy || view.h / 2, e) - cover / 2);
      circleScale.set(d / cover);
      landTint.set(clamp01((p - 0.8) / 0.14));
      circleOpacity.set(p > 0.94 ? 1 - (p - 0.94) / 0.06 : 1);
    },
    [circleX, circleY, circleScale, circleOpacity, landTint],
  );

  // Layout is read here, on hold and on resize, never on scroll.
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const sticky = stickyRef.current;
    if (!stage || !sticky) return;
    geometry.current = {
      top: stage.getBoundingClientRect().top + window.scrollY,
      pin: Math.max(1, stage.offsetHeight - sticky.offsetHeight),
    };
    const dot = measureDot(sticky);
    if (dot) targetRef.current = dot;
  }, []);

  useEffect(() => {
    if (done) return;
    const read = () => {
      const next = readViewport();
      vpRef.current = next;
      setVp(next);
      measure();
      place(progress.get());
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, [done, measure, place, progress]);

  useEffect(() => {
    if (heldRef.current || window.innerWidth === 0) return;
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const runs = [
      animate(cascade, CASCADE_SPAN, {
        duration: CASCADE_SPAN / 1000,
        delay: LEAD_IN / 1000,
        ease: 'linear',
      }),
      animate(engulf, 1, {
        duration: ENGULF_MS / 1000,
        delay: ENGULF_AT / 1000,
        ease: EASE_IN,
      }),
      animate(word, 1, {
        duration: WORDMARK_MS / 1000,
        delay: WORDMARK_AT / 1000,
        ease: EASE_OUT,
      }),
      animate(after, 1, {
        duration: LINE_MS / 1000,
        delay: LINE_AT / 1000,
        ease: EASE_OUT,
      }),
    ];
    const settle = window.setTimeout(hold, LINE_AT + LINE_MS);
    let handoffRun: { stop: () => void } | null = null;
    const handoff = window.setTimeout(() => {
      hold();
      measure();
      handoffRun = animate(progress, 1, {
        duration: HANDOFF_MS / 1000,
        ease: 'linear',
        onUpdate: (value) => {
          place(value);
          if (value > 0.18) showNav();
        },
        onComplete: () => finish('top'),
      });
    }, LINE_AT + LINE_MS + HANDOFF_HOLD);
    stopRef.current = () => {
      window.clearTimeout(settle);
      window.clearTimeout(handoff);
      handoffRun?.stop();
      runs.forEach((run) => run.stop());
    };

    return () => {
      stopRef.current();
      if (!heldRef.current) document.body.style.overflow = previousOverflow.current;
    };
  }, [cascade, engulf, word, after, hold, measure, place, progress, showNav, finish]);

  useEffect(() => {
    if (done) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && event.key !== 'Enter' && event.key !== ' ') return;
      if (event.key !== 'Escape' && isControl(event.target)) return;
      event.preventDefault();
      finish('top');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, finish]);

  useEffect(() => {
    if (!onSkipReady || done) return;
    onSkipReady(() => finish('top'));
    return () => onSkipReady(null);
  }, [onSkipReady, done, finish]);

  useEffect(() => {
    if (!held || done) return;
    const onScroll = () => {
      const { top, pin } = geometry.current;
      const p = clamp01((window.scrollY - top) / pin);
      progress.set(p);
      place(p);
      if (p > 0.18) showNav();
      if (p >= 1) finish('keep');
    };
    measure();
    onScroll();
    // Webfonts can move the Print stop after the first measurement.
    let live = true;
    document.fonts?.ready.then(() => {
      if (!live) return;
      measure();
      place(progress.get());
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      live = false;
      window.removeEventListener('scroll', onScroll);
    };
  }, [held, done, measure, place, progress, showNav, finish]);

  // The overlay and the spacer are gone; put the visitor where they should be before paint.
  useLayoutEffect(() => {
    if (!done) return;
    const stage = stageRef.current;
    if (!stage) return;
    const box = stage.getBoundingClientRect();
    const land = landing.current;
    if (land.to === 'top') {
      window.scrollTo({ top: box.top + window.scrollY, behavior: instant });
    } else {
      window.scrollBy({ top: box.bottom - land.bottom, behavior: instant });
    }
  }, [done]);

  const size = Math.min(vp.w, vp.h) * 0.28 || 0;
  const markLeft = (vp.w - size) / 2;
  const markTop = (vp.h - size) / 2;
  const litX = markLeft + CENTRES[2] * size;
  const litY = markTop + CENTRES[0] * size;
  const reach = Math.hypot(Math.max(litX, vp.w - litX), Math.max(litY, vp.h - litY));
  const field = reach * 2 * 1.04;
  const dotUnit = size > 0 ? (RADIUS * size * 2) / field : 1;
  const cover = Math.hypot(vp.w, vp.h);

  const fieldScale = useTransform(() => {
    const arrival = easeOutCubic(dotProgress(cascade.get(), LIT_STEP));
    const grow = 0.4 + 0.6 * arrival;
    const spread = 1 + engulf.get() * (1 / dotUnit - 1);
    return dotUnit * grow * spread;
  });
  const fieldOpacity = useTransform(cascade, (clock) => {
    const arrival = easeOutCubic(dotProgress(clock, LIT_STEP));
    return GHOST + (1 - GHOST) * arrival;
  });

  const typeOpacity = useTransform(() => {
    const fade = clamp01((progress.get() - 0.02) / 0.22);
    return word.get() * (1 - fade);
  });
  const skipPointer = useTransform(progress, (p) => (p < 0.02 ? 'auto' : 'none'));
  const lineY = useTransform(after, [0, 1], [18, 0]);

  const viewHero = () => {
    if (!heldRef.current) {
      finish('top');
      return;
    }
    const { top, pin } = geometry.current;
    window.scrollTo({ top: top + pin, behavior: 'smooth' });
  };

  return (
    <div ref={stageRef} className="relative">
      <div ref={stickyRef} className={done ? undefined : 'sticky top-0 z-20'}>
        {children}
        {!done && (
          <div className="pointer-events-none fixed inset-0 z-40">
            {!held && <div className="absolute inset-0 bg-[#000001]" />}
            <motion.button
              type="button"
              className="absolute inset-0 z-[1] cursor-pointer"
              style={{ pointerEvents: skipPointer }}
              aria-label="Skip intro"
              onClick={() => finish('top')}
            />
            {!held && (
              <div
                className="absolute"
                style={{ left: markLeft, top: markTop, width: size, height: size }}
                aria-hidden="true"
              >
                {ORDER.filter((cell) => cell !== LIT_CELL).map((cell) => (
                  <Dot key={cell} cell={cell} cascade={cascade} size={size} />
                ))}
              </div>
            )}
            {!held && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  left: litX - field / 2,
                  top: litY - field / 2,
                  width: field,
                  height: field,
                  background: FIELD,
                  scale: fieldScale,
                  opacity: fieldOpacity,
                }}
                aria-hidden="true"
              />
            )}
            {held && (
              <motion.div
                className="absolute left-0 top-0 overflow-hidden rounded-full"
                style={{
                  width: cover,
                  height: cover,
                  background: FIELD,
                  x: circleX,
                  y: circleY,
                  scale: circleScale,
                  opacity: circleOpacity,
                }}
                aria-hidden="true"
              >
                {/* Light mode's Print stop is a darker yellow; blend into it before landing. */}
                <motion.div className="absolute inset-0 bg-[var(--color-primary)]" style={{ opacity: landTint }} />
              </motion.div>
            )}
            <motion.div
              className="absolute inset-0 z-[2] flex flex-col items-center justify-center px-6 text-center text-[#000001]"
              style={{ opacity: typeOpacity }}
              aria-hidden="true"
            >
              <p className="mr-[-0.06em] text-[clamp(2.6rem,12vw,9rem)] font-bold leading-none tracking-[0.06em] md:mr-[-0.125em] md:tracking-[0.125em]">
                GRID<span className="text-[rgba(0,0,1,0.5)]">GO</span>
              </p>
              <motion.p
                className="mt-[2.2rem] hidden pl-[0.28em] text-center text-[clamp(0.85rem,1.6vw,1.15rem)] font-bold tracking-[0.28em] text-[rgba(0,0,1,0.55)] md:block"
                style={{ opacity: after, y: lineY }}
              >
                MAPPING THE FUTURE OF PRINTING
              </motion.p>
              <motion.p
                className="mx-auto mt-5 max-w-[15rem] pl-[0.16em] text-center text-[0.78rem] font-bold leading-relaxed tracking-[0.16em] text-[rgba(0,0,1,0.55)] md:hidden"
                style={{ opacity: after, y: lineY }}
              >
                <span className="block">MAPPING THE FUTURE</span>
                <span className="block">OF PRINTING</span>
              </motion.p>
            </motion.div>
            {/* A mouse or trackpad scrolls down to move on; a finger swipes up. */}
            <motion.button
              type="button"
              onClick={viewHero}
              className="pointer-events-auto absolute inset-x-0 bottom-8 z-[3] flex cursor-pointer items-center justify-center gap-2 bg-transparent px-6 text-center text-[0.68rem] font-bold tracking-[0.22em] text-[rgba(0,0,1,0.55)] md:bottom-12 md:text-[clamp(0.68rem,1.4vw,1rem)] md:tracking-[0.32em]"
              style={{ opacity: typeOpacity }}
            >
              <motion.span
                className="inline-flex"
                animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
                transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="pointer-coarse:hidden" size={18} strokeWidth={2.5} />
                <ChevronUp className="hidden pointer-coarse:block" size={18} strokeWidth={2.5} />
              </motion.span>
              <span className="pointer-coarse:hidden">SCROLL DOWN TO VIEW</span>
              <span className="hidden pointer-coarse:inline">SWIPE UP TO VIEW</span>
            </motion.button>
          </div>
        )}
      </div>
      {!done && <div className="h-[100svh]" aria-hidden="true" />}
    </div>
  );
}
