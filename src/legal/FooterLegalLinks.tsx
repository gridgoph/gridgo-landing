import { Link } from 'react-router-dom';
import { LAUNCH_SLOTS, useLegalLibrary } from './legalLibrary';

const linkClass =
  'text-white text-[12px] font-bold tracking-widest uppercase hover:text-[var(--color-primary)] transition-colors';

/**
 * The landing footer's legal column: every published document that applies to
 * everyone, then the whole library. Agreements for shops, riders and hub staff
 * are one click further, on /legal. Until the API answers, or if it cannot be
 * reached, the launch slots stand in so the links are never missing; each
 * document page has its own fallback.
 */
export function FooterLegalLinks() {
  const { state } = useLegalLibrary();
  const documents =
    state.status === 'ready' && state.documents.length > 0
      ? state.documents
      : LAUNCH_SLOTS;

  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-[#666] text-[13px] lowercase font-mono">legal</h4>
      <div className="flex flex-col gap-5">
        {documents
          .filter((doc) => doc.audience === 'all')
          .map((doc) => (
            <Link key={doc.documentId} to={`/legal/${doc.documentId}`} className={linkClass}>
              {doc.title}
            </Link>
          ))}
        <Link to="/legal" className={linkClass}>
          All legal documents
        </Link>
      </div>
    </div>
  );
}
