import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

/**
 * Pitch opener, then a scroll handoff.
 * Dots cascade, the top-right one takes the screen, and the yellow wordmark holds.
 * Scrolling shrinks that yellow field onto the period after "Print."
 */
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

let introFinished = false;

function openerShouldPlay() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return !introFinished;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const dotProgress = (clock: number, step: number) =>
  Math.min(Math.max((clock - step * DOT_STAGGER) / DOT_MS, 0), 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function colourOf(cell: number) {
  if (cell % 3 < 2) return '#ffffff';
  return '#8a8a8a';
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

export function OpenerStage({
  children,
  onHero,
  onNav,
}: {
  children: ReactNode;
  onHero: () => void;
  onNav: () => void;
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
    <OpenerPlay onHero={onHero} onNav={onNav}>
      {children}
    </OpenerPlay>
  );
}

function OpenerPlay({
  children,
  onHero,
  onNav,
}: {
  children: ReactNode;
  onHero: () => void;
  onNav: () => void;
}) {
  const [vp, setVp] = useState(() => ({
    w: typeof window === 'undefined' ? 0 : window.innerWidth,
    h: typeof window === 'undefined' ? 0 : window.innerHeight,
  }));
  const [held, setHeld] = useState(false);
  const [handoffDone, setHandoffDone] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const heldRef = useRef(false);
  const started = useRef(false);
  const navSent = useRef(false);
  const pendingScroll = useRef(false);
  const stopRef = useRef<() => void>(() => {});
  const onHeroRef = useRef(onHero);
  const onNavRef = useRef(onNav);
  const targetRef = useRef<Target>({ cx: 0, cy: 0, d: 14 });
  const vpRef = useRef(vp);
  const cascade = useMotionValue(0);
  const engulf = useMotionValue(0);
  const word = useMotionValue(0);
  const after = useMotionValue(0);
  const progress = useMotionValue(0);

  useLayoutEffect(() => {
    onHeroRef.current = onHero;
    onNavRef.current = onNav;
  }, [onHero, onNav]);

  useEffect(() => {
    vpRef.current = vp;
  }, [vp]);

  useEffect(() => {
    const read = () => {
      const next = { w: window.innerWidth, h: window.innerHeight };
      vpRef.current = next;
      setVp(next);
      if (stickyRef.current) {
        const measured = measureDot(stickyRef.current);
        if (measured) targetRef.current = measured;
      }
      progress.set(progress.get());
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, [progress]);

  useEffect(() => {
    if (started.current || window.innerWidth === 0) return;
    started.current = true;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const arrive = () => {
      if (heldRef.current) return;
      heldRef.current = true;
      introFinished = true;
      document.body.style.overflow = '';
      engulf.set(1);
      word.set(1);
      after.set(1);
      setHeld(true);
      onHeroRef.current();
    };

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
    const hold = window.setTimeout(arrive, LINE_AT + LINE_MS);
    stopRef.current = () => {
      window.clearTimeout(hold);
      runs.forEach((run) => run.stop());
    };

    const onKey = (event: KeyboardEvent) => {
      if (heldRef.current) return;
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.clearTimeout(hold);
        runs.forEach((run) => run.stop());
        arrive();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      runs.forEach((run) => run.stop());
      window.clearTimeout(hold);
      window.removeEventListener('keydown', onKey);
      if (!heldRef.current) {
        document.body.style.overflow = previous;
        started.current = false;
      }
    };
  }, [cascade, engulf, word, after]);

  useEffect(() => {
    if (!held) return;
    const onScroll = () => {
      const stage = stageRef.current;
      const sticky = stickyRef.current;
      if (!stage || !sticky) return;
      const measured = measureDot(sticky);
      if (measured) targetRef.current = measured;
      const pin = Math.max(1, stage.offsetHeight - sticky.offsetHeight);
      const scrolled = window.scrollY - stage.offsetTop;
      const p = Math.min(1, Math.max(0, scrolled / pin));
      progress.set(p);
      if (!navSent.current && p > 0.18) {
        navSent.current = true;
        onNavRef.current();
      }
      const finished = p >= 1;
      if (finished !== handoffDone) setHandoffDone(finished);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    if (pendingScroll.current) {
      pendingScroll.current = false;
      scrollToPin();
    }
    return () => window.removeEventListener('scroll', onScroll);
  }, [held, progress, handoffDone]);

  const size = Math.min(vp.w, vp.h) * 0.28 || 0;
  const markLeft = (vp.w - size) / 2;
  const markTop = (vp.h - size) / 2;
  const litX = markLeft + CENTRES[2] * size;
  const litY = markTop + CENTRES[0] * size;
  const reach = Math.hypot(Math.max(litX, vp.w - litX), Math.max(litY, vp.h - litY));
  const field = reach * 2 * 1.04;
  const dotUnit = size > 0 ? (RADIUS * size * 2) / field : 1;

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

  const travel = useTransform(() => {
    const view = vpRef.current;
    const p = progress.get();
    const e = easeOutCubic(p);
    const cover = Math.hypot(view.w, view.h);
    const end = targetRef.current.d || 14;
    const d = lerp(cover, end, e);
    const cx = lerp(view.w / 2, targetRef.current.cx || view.w / 2, e);
    const cy = lerp(view.h / 2, targetRef.current.cy || view.h / 2, e);
    const fade = p > 0.94 ? 1 - (p - 0.94) / 0.06 : 1;
    return { left: cx - d / 2, top: cy - d / 2, size: d, opacity: fade };
  });
  const travelLeft = useTransform(travel, (v) => v.left);
  const travelTop = useTransform(travel, (v) => v.top);
  const travelSize = useTransform(travel, (v) => v.size);
  const travelOpacity = useTransform(travel, (v) => v.opacity);

  const typeOpacity = useTransform(() => {
    const fade = Math.min(1, Math.max(0, (progress.get() - 0.02) / 0.22));
    return word.get() * (1 - fade);
  });
  const lineY = useTransform(after, [0, 1], [18, 0]);

  const scrollToPin = () => {
    const stage = stageRef.current;
    const sticky = stickyRef.current;
    if (!stage) return;
    const pin = Math.max(0, stage.offsetHeight - (sticky?.offsetHeight ?? window.innerHeight));
    window.scrollTo({ top: stage.offsetTop + pin, behavior: 'smooth' });
  };

  const viewHero = () => {
    if (!heldRef.current) {
      stopRef.current();
      engulf.set(1);
      word.set(1);
      after.set(1);
      heldRef.current = true;
      introFinished = true;
      document.body.style.overflow = '';
      setHeld(true);
      onHeroRef.current();
      pendingScroll.current = true;
      return;
    }
    scrollToPin();
  };

  return (
    <div ref={stageRef} className="relative">
      <div ref={stickyRef} className="sticky top-0 z-20">
        {children}
        <div
          className="pointer-events-none fixed inset-0 z-40"
          style={{ visibility: handoffDone ? 'hidden' : 'visible' }}
        >
          {!held && <div className="absolute inset-0 bg-[#000001]" />}
          {!held && (
            <button
              type="button"
              className="pointer-events-auto absolute inset-0 z-[3] cursor-pointer"
              aria-label="Skip intro"
              onClick={() => {
                stopRef.current();
                engulf.set(1);
                word.set(1);
                after.set(1);
                if (!heldRef.current) {
                  heldRef.current = true;
                  introFinished = true;
                  document.body.style.overflow = '';
                  setHeld(true);
                  onHeroRef.current();
                }
              }}
            />
          )}
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
              className="absolute rounded-full bg-[#FFDE59]"
              style={{
                left: litX - field / 2,
                top: litY - field / 2,
                width: field,
                height: field,
                scale: fieldScale,
                opacity: fieldOpacity,
              }}
              aria-hidden="true"
            />
          )}
          {held && (
            <motion.div
              className="absolute rounded-full bg-[#FFDE59]"
              style={{
                left: travelLeft,
                top: travelTop,
                width: travelSize,
                height: travelSize,
                opacity: travelOpacity,
              }}
              aria-hidden="true"
            />
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
          <motion.button
            type="button"
            onClick={viewHero}
            className="pointer-events-auto absolute inset-x-0 bottom-8 z-[2] flex cursor-pointer items-center justify-center gap-2 bg-transparent px-6 text-center text-[0.68rem] font-bold tracking-[0.22em] text-[rgba(0,0,1,0.55)] md:bottom-12 md:text-[clamp(0.68rem,1.4vw,1rem)] md:tracking-[0.32em]"
            style={{ opacity: typeOpacity }}
          >
            <motion.span
              className="inline-flex"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronUp size={18} strokeWidth={2.5} />
            </motion.span>
            SCROLL UP TO VIEW
          </motion.button>
        </div>
      </div>
      <div className="h-[100svh]" aria-hidden="true" />
    </div>
  );
}
