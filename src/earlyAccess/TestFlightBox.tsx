import { ExternalLink } from 'lucide-react';
import { TESTFLIGHT_URL } from './logic';
import { TESTFLIGHT_QR_PATH, TESTFLIGHT_QR_SIZE } from './testflightQr';

/**
 * iPhone only. Until the App Store version clears review, GRIDGO reaches
 * iPhones through TestFlight, and the invite cannot be opened without it.
 * The QR shows only on a wide screen with a mouse: on a phone, the button is
 * the link.
 */
export function TestFlightBox({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-5 rounded-2xl border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/[0.06] p-5 text-left ${className}`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-bold mb-1">Install TestFlight first</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          The App Store version is still in Apple's review. Until then, GRIDGO comes through
          TestFlight, Apple's official app for testing.
        </p>
        <a
          href={TESTFLIGHT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-sm hover:opacity-85 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          Get TestFlight
          <ExternalLink size={16} aria-hidden="true" />
          <span className="sr-only">(opens the App Store in a new tab)</span>
        </a>
      </div>
      <figure className="hidden md:pointer-fine:flex shrink-0 flex-col items-center gap-2 m-0">
        <svg
          viewBox={`-2 -2 ${TESTFLIGHT_QR_SIZE + 4} ${TESTFLIGHT_QR_SIZE + 4}`}
          className="size-24 rounded-lg bg-white"
          shapeRendering="crispEdges"
          role="img"
          aria-label="QR code for TestFlight on the App Store"
        >
          <path d={TESTFLIGHT_QR_PATH} fill="#000" />
        </svg>
        <figcaption className="text-xs text-gray-600 dark:text-gray-400">Scan with your iPhone</figcaption>
      </figure>
    </div>
  );
}
