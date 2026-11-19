import { AndroidMark, AppleMark } from '../components/BrandMarks';
import type { Phone } from './earlyAccessList';

/** The phone type's own mark: the Android robot head or the Apple logo. */
export function PhoneMark({ phone, className = '' }: { phone: Phone; className?: string }) {
  const Mark = phone === 'android' ? AndroidMark : AppleMark;
  return <Mark className={`size-4 shrink-0 ${className}`} />;
}
