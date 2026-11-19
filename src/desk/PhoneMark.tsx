import type { Phone } from './earlyAccessList';

/** A small monochrome mark for the phone type: the Android head or an apple. */
export function PhoneMark({ phone, className = '' }: { phone: Phone; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" className={`shrink-0 ${className}`} fill="currentColor">
      {phone === 'android' ? (
        <>
          <path d="M8.2 6.6 6.6 4.2M15.8 6.6l1.6-2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path
            fillRule="evenodd"
            d="M3.5 17.5a8.5 8.5 0 0 1 17 0zM9 12.6a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
          />
        </>
      ) : (
        <>
          <path d="M12 8.2c-1.2-1-2.6-1.3-3.9-1-2.3.6-3.6 2.9-3.3 5.8.3 3.3 2.4 7.2 4.6 7.2.9 0 1.5-.5 2.6-.5s1.7.5 2.6.5c2.2 0 4.3-3.9 4.6-7.2.3-2.9-1-5.2-3.3-5.8-1.3-.3-2.7 0-3.9 1z" />
          <path d="M12.2 6.6c.1-1.7 1.3-3.1 3-3.5-.1 1.7-1.3 3.1-3 3.5z" />
        </>
      )}
    </svg>
  );
}
