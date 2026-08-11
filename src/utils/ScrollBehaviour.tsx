import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Scroll rules for the whole router, not for one link.
 *
 * A single-page app keeps the previous scroll offset across a route change, so
 * following Download from the bottom of the landing page dropped you halfway
 * down /download. Three cases, and getting any one of them wrong is its own bug:
 *
 *   hash changed    → an in-page anchor. Land on the section.
 *   POP (back/fwd)  → the reader has been here. Leave the browser's own scroll
 *                     restoration alone; it is the only thing that knows the
 *                     offset for that history entry, and taking it over by hand
 *                     was measurably worse than letting it do its job.
 *   PUSH / REPLACE  → a new page. Start at the top.
 *
 * The hash case is checked first, and by *change* rather than by navigation
 * type: a fragment link fires popstate, so react-router reports it as POP, and
 * treating it as a back-navigation left every nav anchor doing nothing.
 *
 * The jump is instant — `html { scroll-behavior: smooth }` would otherwise
 * animate a full-page scroll on every navigation — and happens after paint,
 * because the incoming route mounts lazily and scrolling before it exists is
 * undone the moment it arrives.
 */
export function ScrollBehaviour() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const previousHash = useRef(hash);

  useEffect(() => {
    const hashChanged = hash !== '' && hash !== previousHash.current;
    previousHash.current = hash;

    if (hashChanged) {
      const anchor = document.querySelector(hash);
      if (anchor) {
        anchor.scrollIntoView();
        return;
      }
    }

    if (navigationType === 'POP') return;

    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      });
    });

    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [pathname, hash, navigationType]);

  return null;
}
