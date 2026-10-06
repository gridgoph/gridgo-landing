import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LegalLayout } from './LegalLayout';
import type { LegalSection } from './LegalLayout';
import { PRIVACY_CONTACT } from './legalPages';

/*
 * Every statement here was checked against the code of gridgo-api and the
 * three apps when it was written. When an app starts collecting something new,
 * or a retention rule changes, this page and its dates change with it.
 */

const mail = <a href={`mailto:${PRIVACY_CONTACT}`}>{PRIVACY_CONTACT}</a>;

/** A labelled block for lists of facts, readable on a phone where a table is not. */
function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4 sm:p-5">
      <p className="font-semibold text-black dark:text-white leading-snug">{label}</p>
      <div className="mt-2 text-[15px] leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Facts({ children }: { children: ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

/** [what, how long] — the retention schedule, mirrored on /delete-account. */
const RETENTION: [string, string][] = [
  ['Your account and profile', 'While your account is open. Deleted within 30 days of a confirmed deletion request.'],
  ['Artwork and design files, and mockups', '30 days after the order is completed. You can delete them sooner yourself once the order is completed and nothing about it is still open.'],
  ['Order, payment, payout and refund records, including payment proof screenshots, reference numbers, receipts, refund and payout QR codes, and shop invoices', '5 years after the order closes'],
  ['Production photos, delivery photos and handover signatures', '1 year after the order closes'],
  ['The location points recorded while a rider delivers your order', '1 year after the order closes'],
  ['ID and verification documents, and the details in a shop, rider, business or organization application', 'While the account is open, then 1 year after it is closed or the application is turned down'],
  ['Files uploaded but never attached to anything', '24 hours'],
  ['Support chat messages, support tickets and problem reports', '1 year after the conversation or report is closed'],
  ['Security and audit records of actions taken on an account', '1 year after the account is closed'],
  ['Notification tokens', 'Until you sign out or delete your account, or until the push service tells us the app was removed'],
  ['Server logs', 'A short rolling window. They are size-limited and overwritten automatically.'],
];

const sections: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are and what this covers',
    body: (
      <>
        <p>
          GRIDGO is a printing and delivery service based in Davao City, Philippines. Customers order prints,
          partner print shops produce them, and riders deliver them. In this policy, “GRIDGO”, “we” and “us”
          mean the GRIDGO team, which decides how your personal data is used and is responsible for it under
          the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>.
        </p>
        <p>This policy applies to:</p>
        <ul>
          <li><strong>GRIDGO</strong>, the app for customers (Android package ph.gridgo.client);</li>
          <li><strong>GRIDGO Supplier</strong>, the app for print shops (ph.gridgo.supplier);</li>
          <li><strong>GRIDGO Rider</strong>, the app for delivery riders (ph.gridgo.rider);</li>
          <li><strong>GRIDGO Admin</strong>, the app our own hub staff use (ph.gridgo.admin);</li>
          <li>the <strong>GRIDGO dashboard</strong> at gridgo-dash.talasora.com, used by print shops and GRIDGO operations staff;</li>
          <li>this <strong>website</strong>, gridgo.talasora.com, including its support and problem-report forms.</li>
        </ul>
        <p>
          Questions about your data, and requests to use your rights, go to our privacy contact: {mail}.
        </p>
      </>
    ),
  },
  {
    id: 'summary',
    title: 'The short version',
    body: (
      <ul>
        <li>We collect what we need to take an order, get it printed, deliver it and get everyone paid.</li>
        <li><strong>We do not sell your personal data</strong>, and we do not use it for advertising. Our apps have no ads, no advertising ID, and no analytics or tracking tools.</li>
        <li>We never take card numbers. You pay by transfer from your own e-wallet or bank.</li>
        <li>The GRIDGO and GRIDGO Rider apps use your location only while the app is open on your screen. None of our apps collects location in the background.</li>
        <li>Each kind of data has a set time we keep it, listed in <a href="#retention">How long we keep it</a>.</li>
        <li>You can ask us to delete your account at any time. See <Link to="/delete-account">Delete your GRIDGO account</Link>.</li>
      </ul>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: (
      <>
        <h3>Your account</h3>
        <p>
          You sign in with an email address and password, a one-time code sent to your email, or your Google
          account. Sign-in is handled by our authentication provider (see{' '}
          <a href="#sharing">Who we share it with</a>). We keep your <strong>name, email address, mobile number</strong>,
          the role you use GRIDGO in (customer, print shop, rider or staff) and your account type (personal,
          business or organization). If you add a <strong>profile photo</strong>, it is stored by the
          authentication provider with your sign-in account. If you turn on two-step sign-in, your phone number
          may be used to send you a code.
        </p>

        <h3>Business, organization, shop and rider applications</h3>
        <p>Some accounts need to be checked before they can be used. What we ask for depends on the account:</p>
        <Facts>
          <Fact label="Business accounts (sole proprietors, partnerships and corporations)">
            <p>
              Business name and what it does; the name, date of birth, address and mobile number of the person
              signing for it; the type and expiry date of their government ID; and copies of: a government ID,
              proof of the business bank account, BIR Form 2303, and a DTI certificate (sole proprietors) or
              SEC certificate, articles and by-laws, General Information Sheet and a board resolution or
              secretary’s certificate (partnerships and corporations). We may ask for a Mayor’s or Barangay
              business permit.
            </p>
          </Fact>
          <Fact label="Organization accounts (student organizations)">
            <p>
              Organization name and what it does, school, organization email address (we confirm it with a code
              sent by email), an optional faculty adviser contact, the officer’s name, date of birth, address,
              mobile number and ID details, and copies of a government ID, a student ID and proof of enrolment,
              and optionally the school’s recognition certificate.
            </p>
          </Fact>
          <Fact label="Print shops (GRIDGO Supplier)">
            <p>
              Shop name, contact person, mobile number, the shop’s location on the map, the services it offers,
              and copies of a business permit, the owner’s valid ID and samples of the shop’s work.
            </p>
          </Fact>
          <Fact label="Riders (GRIDGO Rider)">
            <p>
              Mobile number, vehicle type, plate number and driver’s licence number, and, when we ask for them,
              photos of the driver’s licence, the vehicle’s registration (OR/CR) and a selfie.
            </p>
          </Fact>
        </Facts>
        <p>
          Government ID numbers, dates of birth and tax documents are <strong>sensitive personal information</strong>{' '}
          under the Data Privacy Act. Only GRIDGO operations staff can open these documents; a business or
          organization’s documents cannot even be opened again by the person who uploaded them.
        </p>

        <h3>Orders and artwork</h3>
        <p>
          What you order, the options and quantities you choose, your notes, the <strong>artwork and design files</strong>{' '}
          you upload or the design links you paste (for example a link to a file you shared online, which our
          server opens to check that it works), mockups, the delivery or pickup choice, the order’s progress,
          and any issue, claim, refund or reprint request about it. If you rate a shop, we keep your scores and
          comment.
        </p>

        <h3>Location</h3>
        <Facts>
          <Fact label="Customers (GRIDGO app)">
            <p>
              Your <strong>delivery address and map pin</strong>: place name, street and building, landmark, and
              the pin’s coordinates. You can save addresses to use again. If you allow it, the app reads your
              phone’s location <strong>once</strong>, when you open the map or tap “Use my location”, to place
              the pin for you. It does not follow your location.
            </p>
          </Fact>
          <Fact label="Riders (GRIDGO Rider app)">
            <p>
              While you are carrying an order you accepted, and <strong>only while the app is open on your screen</strong>,
              the app shares your location (coordinates, accuracy and time) with GRIDGO about every 15 seconds.
              A “Location sharing on” banner shows while it does. It stops when the delivery ends or the app
              leaves the screen, and it is never collected in the background. The map tab also uses your
              location to centre the map; that is not sent to GRIDGO.
            </p>
          </Fact>
          <Fact label="Print shops (GRIDGO Supplier app)">
            <p>
              The shop’s location, which you place by hand on a map. The Supplier app does not read your
              phone’s location.
            </p>
          </Fact>
        </Facts>

        <h3>Photos, camera and files</h3>
        <p>The apps only open the camera or your files when you choose to add something:</p>
        <ul>
          <li><strong>Customers:</strong> artwork, the screenshot of your payment, and for a refund your receiving QR code and photos of the problem; documents for a business or organization account.</li>
          <li><strong>Print shops:</strong> verification documents, shop and product photos, photos of production progress and of the finished order, and your payout QR code.</li>
          <li><strong>Riders:</strong> pickup and delivery photos, taken with the camera. At pickup, the shop signs on the rider’s screen and types their name, and that signature is saved with the order.</li>
          <li><strong>Hub staff (GRIDGO Admin):</strong> the camera scans a customer’s pickup QR code; no photo is kept.</li>
          <li><strong>Website:</strong> screenshots you attach to a problem report.</li>
        </ul>
        <p>
          The GRIDGO app can read the reference number from your payment screenshot to save you typing it. That
          reading happens on your phone.
        </p>

        <h3>Payments, refunds and payouts</h3>
        <p>
          GRIDGO does not take card payments and does not store card numbers. Customers pay by transferring
          from their own e-wallet or bank using GRIDGO’s QR code, then upload a <strong>screenshot of the
          transfer and its reference number</strong>; our operations team checks it by hand. For a refund we
          keep the e-wallet or bank you choose, the <strong>account holder’s name and your receiving QR code</strong>.
          For print shop payouts we keep the <strong>payout method, account name, account or wallet number, bank or
          wallet name and QR code</strong>. We keep the reference numbers and receipts of the transfers we send.
        </p>

        <h3>Messages, support and problem reports</h3>
        <ul>
          <li><strong>Support chat</strong> in the apps is between you and GRIDGO operations only. We keep the messages and whether they have been read. There is no chat between customers, shops and riders.</li>
          <li><strong>“Report a problem”</strong> in the GRIDGO and Supplier apps sends your description to support chat, together with the app version, your phone’s make and model and its Android version, so we can find the fault.</li>
          <li>The <strong>support form</strong> on this website takes your name, email address, subject and message. We answer by email.</li>
          <li>The <strong>problem report form</strong> on this website takes your description, a category and up to six screenshots. It does not ask who you are. Our team publishes a short summary of each report on GRIDGO’s public reports page, so please leave personal details out of the text and screenshots.</li>
        </ul>

        <h3>Notifications</h3>
        <p>
          If you allow notifications, your phone gives the app a <strong>push token</strong>, which we store with
          the platform and which app it belongs to. The message that travels through the push service carries
          only an order reference and the kind of update; the details are fetched from GRIDGO when you open it.
        </p>

        <h3>Device and technical information</h3>
        <p>
          Our server logs record which page or feature was requested, the result and how long it took, with a
          shortened account reference. They do not record your IP address or browser. Your IP address is used
          for a moment to stop the website forms being flooded, and is not stored. To check for updates, the
          apps ask GitHub, where our app releases are published, for the latest version. Each app keeps some
          things on your phone, such as your sign-in session, unfinished drafts and your light or dark setting.
        </p>

        <h3>What we do not collect</h3>
        <p>
          We do not collect your contacts, call logs, text messages, browsing history, card details, advertising
          ID or background location, and we do not record audio. Android may show a microphone permission for
          some GRIDGO builds because it comes with the sound library we use for alert tones; the apps never
          turn the microphone on.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use it',
    body: (
      <>
        <ul>
          <li><strong>To run your orders:</strong> to take an order, check the artwork, match it to a print shop, arrange the rider, show you where it is, and prove what was made and delivered. (Needed to provide the service you asked for.)</li>
          <li><strong>To handle money:</strong> to confirm payments, send refunds and pay print shops and riders. (Needed for the service, and to meet tax and accounting rules.)</li>
          <li><strong>To check accounts:</strong> to confirm that businesses, organizations, shops and riders are who they say they are before they can take part. (Needed for the service, our legitimate interest in keeping customers safe, and, for sensitive information, your consent when you submit it.)</li>
          <li><strong>To keep you informed and help you:</strong> to send notifications about your orders, and answer support messages and problem reports.</li>
          <li><strong>To keep GRIDGO safe:</strong> to prevent fraud and misuse, settle complaints and claims, and keep records of what staff did on an account.</li>
          <li><strong>To meet the law:</strong> to keep records required by Philippine law and answer lawful requests from authorities.</li>
        </ul>
        <p>
          We do not use your data for advertising, we do not build marketing profiles, and we do not make
          decisions about you by automated means alone. Our staff check payments, applications and artwork.
        </p>
      </>
    ),
  },
  {
    id: 'who-sees',
    title: 'Who can see it inside GRIDGO',
    body: (
      <>
        <ul>
          <li><strong>The print shop on your order</strong> sees what was ordered, your artwork and, for a delivery, the delivery address and pin. It does not see your name, phone number, payment proof or refund details.</li>
          <li><strong>Riders</strong> see the shop’s name, contact person and location, and the delivery address and pin, when a delivery is offered to them and while they carry it. The assigned rider also gets the handover code needed to complete delivery.</li>
          <li><strong>Customers</strong> see the shop working on their order, its production and delivery photos, and the rider’s live position while the order is on its way.</li>
          <li><strong>GRIDGO operations staff</strong> see what they need to run orders, check payments and accounts and answer support. Super administrators can also see the audit record. Hub staff see the pickup orders they hand over.</li>
          <li><strong>Anyone</strong> can see a print shop’s public listing: shop name, location, photos, products and ratings.</li>
        </ul>
        <p>Files are stored privately. Each time someone with permission opens one, the app gets a link that stops working after five minutes.</p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Who we share it with',
    body: (
      <>
        <p>
          We share personal data only with the service providers we need to run GRIDGO, and only what each one
          needs. They handle it for us, not for their own marketing.
        </p>
        <Facts>
          <Fact label="Authentication provider: Clerk">
            <p>Your name, email address, password (which only Clerk holds), phone number if you add one, profile photo and sign-in sessions. If you sign in with Google, Google confirms your identity to Clerk.</p>
          </Fact>
          <Fact label="Push notification service: Google Firebase Cloud Messaging">
            <p>Your push token and the short notification described above.</p>
          </Fact>
          <Fact label="Email: Google (Gmail)">
            <p>Your email address and the message, when we answer a support ticket or send an organization’s confirmation code.</p>
          </Fact>
          <Fact label="Network and security: Cloudflare">
            <p>All traffic to our website and server passes through Cloudflare, which protects it and delivers it quickly.</p>
          </Fact>
          <Fact label="Maps: OpenStreetMap, CARTO, Nominatim and the public OSRM route server">
            <p>
              The map pictures come from OpenStreetMap (light) and CARTO (dark), which receive the area of the
              map being shown. When you search for an address or drop a pin, the text or point is looked up with
              Nominatim (run by the OpenStreetMap Foundation). To draw a route, the start and end points (for
              example the rider’s position and the delivery pin) are sent to the public OSRM route server. None
              of these receives your name or account.
            </p>
          </Fact>
          <Fact label="Hosting and file storage">
            <p>Our database and file storage run on a server that GRIDGO operates, not on a shared storage service.</p>
          </Fact>
          <Fact label="Your e-wallet or bank">
            <p>When you transfer money to GRIDGO, or we send you a refund or payout, the e-wallet or bank you chose processes it under its own privacy policy.</p>
          </Fact>
          <Fact label="Code and file libraries: GitHub, unpkg and jsDelivr">
            <p>The apps check GitHub for updates, and load map and text-reading code from unpkg and jsDelivr. These see your IP address, like any website you visit, but no account details.</p>
          </Fact>
          <Fact label="This website">
            <p>Loads fonts from Google Fonts and parts of its 3D scene from jsDelivr and raw.githack.com. The How it Works videos are on YouTube: their thumbnails load from YouTube’s servers, and the video itself only when you press play.</p>
          </Fact>
        </Facts>
        <p>
          We may also disclose information when the law requires it, to answer a lawful order from a court or
          government authority, or to protect the rights and safety of our users or GRIDGO. If GRIDGO’s business
          is ever transferred, your data would only move with it under the same protections, and we would tell you first.
        </p>
        <h3>Data stored outside the Philippines</h3>
        <p>
          Some of these providers, such as Clerk, Google, Cloudflare and GitHub, process data in other countries.
          We remain responsible for your data when they do, as the Data Privacy Act requires.
        </p>
      </>
    ),
  },
  {
    id: 'not-sold',
    title: 'We do not sell your data',
    body: (
      <p>
        GRIDGO does not sell, rent or trade personal data, does not share it with advertisers or data brokers,
        and shows no ads in its apps.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'How we protect it',
    body: (
      <ul>
        <li>Your phone and browser talk to GRIDGO over <strong>encrypted HTTPS</strong> connections.</li>
        <li>Anything tied to your account is only returned to a request carrying a valid sign-in token, and the server checks your role first, so each person only gets what their role allows.</li>
        <li>Uploaded files are kept in private storage that cannot be browsed from the internet, and are opened only through links that expire after five minutes.</li>
        <li>Our database and file storage are not reachable from the internet; only our own server can talk to them.</li>
        <li>Confirmation and invite codes are stored only in a scrambled (hashed) form.</li>
        <li>Only staff who need it can see sensitive documents, and sensitive actions, such as deleting a file early, are recorded with who did it and why.</li>
      </ul>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: (
      <>
        <p>
          We keep personal data only as long as we need it for the reasons above, or as long as the law requires.
          When a period ends, we delete the data. While a complaint, claim, refund or legal case about an order
          is open, we keep what concerns that order until it is resolved.
        </p>
        <div className="space-y-3">
          {RETENTION.map(([what, howLong]) => (
            <div
              key={what}
              className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4 sm:p-5"
            >
              <p className="font-semibold text-black dark:text-white leading-snug">{what}</p>
              <p className="mt-2 text-[15px] leading-relaxed">{howLong}</p>
            </div>
          ))}
        </div>
        <p>
          We keep money records for 5 years because Philippine tax and accounting rules require it, and delivery
          evidence for a year to settle complaints and claims about an order.
        </p>
      </>
    ),
  },
  {
    id: 'deletion',
    title: 'Deleting your account',
    body: (
      <>
        <p>
          You can ask us to delete your GRIDGO account and personal data at any time, from inside the app
          (through support chat) or from the web (by emailing {mail} from your account’s email address). We
          confirm it is you, finish anything still open on your orders, and delete your account within 30 days.
        </p>
        <p>
          Some records must be kept for a while after that, such as payment records for 5 years. The full
          details, including what we delete and what we keep, are on{' '}
          <Link to="/delete-account">Delete your GRIDGO account</Link>. A Delete account button is coming to the apps.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>Under the Data Privacy Act of 2012, you have the right:</p>
        <ul>
          <li><strong>to be informed</strong> that your personal data is being collected and used, and how (this policy);</li>
          <li><strong>to access</strong> your personal data and learn how it has been used and who received it;</li>
          <li><strong>to object</strong> to our use of your data, including to withdraw consent you gave;</li>
          <li><strong>to erasure or blocking</strong>: to have data removed or its use stopped when it is no longer needed, was collected unlawfully, or is wrong;</li>
          <li><strong>to rectification</strong>: to have wrong or incomplete data corrected;</li>
          <li><strong>to data portability</strong>: to get a copy of your data in a common electronic format;</li>
          <li><strong>to damages</strong> if you are harmed by inaccurate, incomplete, outdated, false, unlawfully obtained or unauthorized use of your data;</li>
          <li><strong>to file a complaint</strong> with the National Privacy Commission.</li>
        </ul>
        <h3>How to use them</h3>
        <p>
          Email {mail} from the email address on your account, or message support in the app, and say what you
          would like. You can correct your name, phone number and addresses yourself in the app. We may ask you to
          confirm it is you. We answer within 30 days, free of charge. If we cannot do something you ask, for
          example because the law requires us to keep a record, we will tell you why.
        </p>
        <p>
          If you are not satisfied, you can complain to the{' '}
          <strong>National Privacy Commission</strong> at{' '}
          <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer">privacy.gov.ph</a>.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: (
      <p>
        GRIDGO is for people <strong>18 years old and over</strong>, and is not meant for children. We do not
        knowingly collect personal data from anyone under 18. If you believe a child has given us personal data,
        write to {mail} and we will delete it.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        When GRIDGO starts collecting something new or changes how it uses data, we update this page and the
        “Last updated” date at the top. If a change matters to how your data is used, we will also tell you in
        the apps before it takes effect.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: (
      <>
        <p>
          <strong>GRIDGO</strong>, Davao City, Philippines
          <br />
          Privacy contact: {mail}
        </p>
        <p>
          You can also reach us through support chat in any GRIDGO app, or the{' '}
          <Link to="/support">support form</Link> on this website.
        </p>
      </>
    ),
  },
];

export function PrivacyPage() {
  return (
    <LegalLayout
      documentTitle="Privacy Policy | GRIDGO"
      kicker="GRIDGO apps and website"
      title="Privacy Policy"
      intro={
        <p>
          This Privacy Policy explains what personal data GRIDGO collects through the GRIDGO, GRIDGO Supplier
          and GRIDGO Rider apps, the GRIDGO dashboard and this website, why we collect it, who we share it with,
          how long we keep it, and the rights you have over it.
        </p>
      }
      sections={sections}
    />
  );
}
