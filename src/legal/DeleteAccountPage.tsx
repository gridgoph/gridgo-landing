import { DeletionRequestForm } from "./DeletionRequestForm";
import { Link } from 'react-router-dom';
import { LegalLayout } from './LegalLayout';
import type { LegalSection } from './LegalLayout';
import { PRIVACY_CONTACT } from './legalPages';

const mail = (
  <a href={`mailto:${PRIVACY_CONTACT}?subject=Delete%20my%20GRIDGO%20account`}>{PRIVACY_CONTACT}</a>
);

/** What GRIDGO must keep after deleting an account, and for how long. */
const KEPT: [string, string, string][] = [
  [
    'Order, payment, payout and refund records, including payment proof screenshots, reference numbers and receipts',
    '5 years after the order closes',
    'Philippine tax and accounting rules require us to keep records of transactions, and we need them to answer refund or payment disputes.',
  ],
  [
    'Production photos, delivery photos, handover signatures and the delivery route recorded during a trip',
    '1 year after the order closes',
    'They are the evidence of what was made and delivered, used to settle complaints, claims and reprint requests.',
  ],
  [
    'ID and verification documents, and the details in a shop, rider, business or organization application',
    '1 year after the account is closed',
    'To prevent fraud (for example, a removed account signing up again) and to answer legal claims.',
  ],
  [
    'Security and audit records of actions taken on your account',
    '1 year after the account is closed',
    'To protect the platform and show what was done and by whom.',
  ],
];

const sections: LegalSection[] = [
  {
    id: 'how-to-ask',
    title: 'How to ask for deletion',
    body: (
      <>
        <p>You can ask in any of these ways. Each one works for all GRIDGO apps.</p>
        <h3>Through this website</h3>
        <p>Enter your account email below. Operations verifies ownership before deleting anything.</p>
        <DeletionRequestForm />
        <h3>By email (from anywhere, including the web)</h3>
        <ol>
          <li>
            Send an email to {mail} <strong>from the email address you use to sign in to GRIDGO</strong>.
          </li>
          <li>Use the subject “Delete my GRIDGO account”.</li>
          <li>
            Say which app you use: <strong>GRIDGO</strong> (for customers), <strong>GRIDGO Supplier</strong>{' '}
            (for print shops) or <strong>GRIDGO Rider</strong>. If you use more than one, tell us whether to
            delete all of them.
          </li>
        </ol>
        <h3>Inside the app</h3>
        <p>
          Open <strong>Account → Delete account</strong> in the latest app, read the warning,
          then confirm your request. Operations will process it manually within 30 days.
          If your app does not have this entry yet, use this web form or email us.
        </p>
      </>
    ),
  },
  {
    id: 'what-happens',
    title: 'What happens next',
    body: (
      <ol>
        <li>
          <strong>We check it is you.</strong> We only delete an account when the request comes from the
          account’s own email address or from inside the signed-in app. If we cannot tell, we reply and ask.
          We never ask for your password.
        </li>
        <li>
          <strong>We finish anything still open.</strong> If you have an order in progress, an open issue or
          claim, or a payment, refund or payout that is still being processed, we tell you, and we complete
          or close it first so that nobody loses money.
        </li>
        <li>
          <strong>We delete your account within 30 days</strong> of receiving your request, and email you
          when it is done. You can no longer sign in after that, and the account cannot be restored. You are
          welcome to create a new one later.
        </li>
      </ol>
    ),
  },
  {
    id: 'what-we-delete',
    title: 'What we delete',
    body: (
      <>
        <ul>
          <li>Your sign-in account with our authentication provider, and your GRIDGO profile: name, phone number and account type details.</li>
          <li>Your saved delivery addresses and map pins.</li>
          <li>Your shop or rider profile, your listings and photos, and your shop’s location, so they no longer appear in GRIDGO.</li>
          <li>Your payout or refund account details (account name, number and QR code).</li>
          <li>Artwork and design files you uploaded, unless they belong to an order that is still open.</li>
          <li>Your support chat messages and support tickets.</li>
          <li>The notification tokens that let us send push notifications to your phone.</li>
          <li>Ratings and comments you wrote about a shop.</li>
        </ul>
        <p>
          Uninstalling the app does not delete your account. To delete it, ask us in one of the ways above.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-keep',
    title: 'What we keep, for how long, and why',
    body: (
      <>
        <p>
          The law requires us to keep some records for a while after your account is gone, and some are
          needed to settle disputes with the other people on an order. These records are kept apart from
          everyday use, are seen only by the few GRIDGO staff who need them for those purposes, and are
          deleted when their period ends.
        </p>
        <div className="space-y-3">
          {KEPT.map(([what, howLong, why]) => (
            <div
              key={what}
              className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4 sm:p-5"
            >
              <p className="font-semibold text-black dark:text-white leading-snug">{what}</p>
              <p className="mt-2 text-[13px] font-mono uppercase tracking-[0.12em] text-[var(--color-primary)]">
                {howLong}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed">{why}</p>
            </div>
          ))}
        </div>
        <p>
          If a complaint, claim, refund or legal case about an order is still open when a period ends, we keep
          the records about that order until it is resolved.
        </p>
      </>
    ),
  },
  {
    id: 'partial',
    title: 'Deleting some data without closing your account',
    body: (
      <>
        <p>You do not have to close your account to have data removed.</p>
        <ul>
          <li>
            <strong>Artwork:</strong> once an order is completed and nothing about it is still open, you can
            delete its artwork yourself in the GRIDGO app. Otherwise we delete artwork 30 days after the order
            is completed.
          </li>
          <li>
            <strong>Anything else:</strong> email {mail} or message support in the app, say what you want
            removed, and we will reply within 30 days, telling you what we deleted and anything we must keep and why.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'questions',
    title: 'Questions and complaints',
    body: (
      <>
        <p>
          Write to {mail} with any question about your data. Our{' '}
          <Link to="/privacy">Privacy Policy</Link> explains everything GRIDGO collects and why, and your
          rights under the Data Privacy Act of 2012 (Republic Act No. 10173).
        </p>
        <p>
          If you are not satisfied with our answer, you may complain to the National Privacy Commission of the
          Philippines at{' '}
          <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer">
            privacy.gov.ph
          </a>
          .
        </p>
      </>
    ),
  },
];

export function DeleteAccountPage() {
  return (
    <LegalLayout
      documentTitle="Delete your GRIDGO account"
      kicker="Your data"
      title="Delete your GRIDGO account"
      intro={
        <p>
          You can ask GRIDGO to delete your account and your personal data at any time. This page covers the
          GRIDGO app, GRIDGO Supplier and GRIDGO Rider, and accounts on the GRIDGO web dashboard. It explains
          how to ask, what we delete, and what the law makes us keep for a while.
        </p>
      }
      sections={sections}
    />
  );
}
