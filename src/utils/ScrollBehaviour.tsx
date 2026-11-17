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

    if (hashChanged && isPageAnchor(hash)) {
      const anchor = document.querySelector(hash);
      if (anchor) {
        anchor.scrollIntoView();
        return;
      }
    }

    // A link into another route's section (/download#early-access) arrives
    // before that route's lazy chunk has mounted, so the section does not exist
    // yet. Start at the top as usual, then land on it once it appears.
    // Not tied to this effect's cleanup: StrictMode re-runs the effect, and the
    // re-run no longer sees the hash as changed.
    if (hashChanged && isAnchorSyntax(hash)) scrollWhenMounted(hash);

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

/** Clerk sign-in steps use hashes such as `#/factor-one`, which are not element ids. */
function isAnchorSyntax(hash: string): boolean {
  return /^#[A-Za-z][\w-]*$/.test(hash);
}

/**
 * Watch for the element for a few seconds; give up quietly if it never comes
 * or the reader has already moved on to another address.
 */
function scrollWhenMounted(hash: string) {
  const path = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== path || window.location.hash !== hash) return stop();
    const anchor = document.querySelector(hash);
    if (!anchor) return;
    stop();
    // After the route's own first paint, or its scroll-to-top wins.
    requestAnimationFrame(() => requestAnimationFrame(() => anchor.scrollIntoView()));
  });
  const timer = window.setTimeout(() => stop(), 6000);
  function stop() {
    observer.disconnect();
    window.clearTimeout(timer);
  }
  observer.observe(document.body, { childList: true, subtree: true });
}

function isPageAnchor(hash: string): boolean {
  if (!isAnchorSyntax(hash)) return false;
  try {
    return document.querySelector(hash) != null;
  } catch {
    return false;
  }
}
