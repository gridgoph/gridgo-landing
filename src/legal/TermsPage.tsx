import { Link } from 'react-router-dom';
import { LegalLayout } from './LegalLayout';
import type { LegalSection } from './LegalLayout';
import { PRIVACY_CONTACT, TERMS_EFFECTIVE_DATE, TERMS_LAST_UPDATED } from './legalPages';

/*
 * The Terms of Service as approved on 11 November 2026. The same wording is
 * published as "Terms of Service" in the in-app legal library; change both
 * together, and both dates in legalPages.ts, when the text changes.
 */

const mail = <a href={`mailto:${PRIVACY_CONTACT}`}>{PRIVACY_CONTACT}</a>;

const sections: LegalSection[] = [
  {
    id: 'who-we-are',
    title: "Who we are",
    body: (
      <>
        <p>GRIDGO is a printing and delivery service based in Davao City, Philippines. Customers order prints, partner print shops make them, and riders deliver them.</p>
        <p>In these terms, "GRIDGO", "we" and "us" mean the GRIDGO team, Davao City, Philippines.</p>
      </>
    ),
  },
  {
    id: 'the-people-on-gridgo',
    title: "The people on GRIDGO",
    body: (
      <>
        <ul>
          <li><strong>Customers</strong> use the GRIDGO app to order prints. A customer account can be personal, business or organization.</li>
          <li><strong>Print shops</strong> are independent partner shops. They use the GRIDGO Supplier app and the dashboard to make orders.</li>
          <li><strong>Riders</strong> are independent partner riders. They use the GRIDGO Rider app to carry orders.</li>
          <li><strong>GRIDGO Operations</strong> is our own team. It checks artwork, confirms payments, approves accounts, assigns work, settles problems and sends refunds and payouts.</li>
        </ul>
        <p><strong>Your order is with GRIDGO.</strong> GRIDGO has your order made by a partner print shop and delivered by a partner rider. The shop does not see your name, phone number or payment details. You get GRIDGO's receipt, not the shop's.</p>
      </>
    ),
  },
  {
    id: 'your-account',
    title: "Your account",
    body: (
      <>
        <h3>3.1 Signing in</h3>
        <p>You sign in with an email address and password, your Google account or, on iPhone, your Apple account. When you sign up, we send a code to your email to confirm it. Keep your password and sign-in codes to yourself. You are responsible for what is done with your account. Tell us at once if you think someone else is using it.</p>
        <h3>3.2 Correct information</h3>
        <p>Give us true, current information, and keep it up to date. You can correct your name, phone number and addresses in the app.</p>
        <h3>3.3 Minors</h3>
        <p>If you are under 18, you may use GRIDGO only with your parent's or guardian's consent. When you sign up, we ask whether you are 18 or older. If you are not, your parent or guardian must agree to these terms for you. They are responsible for your use of GRIDGO.</p>
        <h3>3.4 Business and organization accounts</h3>
        <p>A customer can apply to make their account a business account (sole proprietor, partnership or corporation) or an organization account (for example a school organization). The app lists the documents each one needs. GRIDGO checks them before approving the account. You can keep ordering while we check. An approved organization account gets the extras shown in the app, such as account statements and organization pricing. An organization account has one sign-in and one officer named on its record. The organization must keep that officer up to date.</p>
        <h3>3.5 Print shop and rider accounts</h3>
        <p>Print shops and riders apply in their own apps. GRIDGO checks each application, and nobody gets work until it is approved. See sections 16 and 17.</p>
        <h3>3.6 Shop Owners and Staff</h3>
        <p>A print shop has at least one <strong>Owner</strong>, who has full access. An Owner can invite <strong>Staff</strong>, who receive and process orders. An invite works once and expires after 48 hours. The Owner must then approve the new member. Staff cannot handle the shop's money, prices, settings or team, and cannot sign the shop's agreements. Staff work under the agreements the Owner accepted. The shop is responsible for what its Staff do.</p>
        <h3>3.7 Agreeing to these terms</h3>
        <p>You agree to these terms and the Privacy Notice when you create your account. Print shops also agree to the Supplier Agreement, and riders to the Rider Agreement. We keep a record of which version you agreed to and when.</p>
      </>
    ),
  },
  {
    id: 'where-gridgo-works',
    title: "Where GRIDGO works",
    body: (
      <>
        <p>GRIDGO delivers only inside <strong>Davao City</strong>. The app does not accept a delivery pin outside the city.</p>
      </>
    ),
  },
  {
    id: 'ordering',
    title: "Ordering",
    body: (
      <>
        <h3>5.1 What you order</h3>
        <p>You choose a product and its options, upload your artwork or paste a link to it, and choose delivery or pickup. You can add special instructions. GRIDGO reads them before the order goes to a shop, and the shop must confirm it read them. Instructions cannot change the price. If following them would cost more, you are asked first.</p>
        <h3>5.2 Artwork checks</h3>
        <p>GRIDGO Operations checks every order's artwork before it is printed. If something will not print cleanly, we send it back with the reason. You can then replace the file on the same order.</p>
        <h3>5.3 File warnings</h3>
        <p>The app may warn you about your file, for example if it is low in resolution or in the wrong colour mode. You can fix the file or go ahead anyway. <strong>If you go ahead and the print is blurry or off-colour because of that problem, GRIDGO will not reprint or refund it.</strong></p>
        <h3>5.4 Approving your order</h3>
        <p>Before you pay, you confirm the items, options, artwork and any warnings you accepted. Some products may also need your signature or your approval of a sample. GRIDGO keeps your approval with the order. <strong>If there is a disagreement about a print, what you approved is what a correct print is.</strong> You can download a copy of your approval.</p>
        <h3>5.5 Changes after you order</h3>
        <p>If a shop needs to change something, such as the price after it measures your file's colour, it must ask you first. If you decline, the shop prints the order as you placed it, and you are not charged more. Chat messages do not change an order. Only a change you approve in the app does.</p>
        <h3>5.6 Deadlines</h3>
        <p>The date you choose when you order is the date the shop commits to. If the shop cannot make your order, GRIDGO offers you another approved shop or a full refund.</p>
      </>
    ),
  },
  {
    id: 'your-artwork-and-what-you-may-print',
    title: "Your artwork and what you may print",
    body: (
      <>
        <h3>6.1 Your promise</h3>
        <p>For every order, you confirm that <strong>you have the right to print the artwork</strong>. That means it is yours, or its owner said you may print it, including any logos, photos and text in it. You are responsible if it is not.</p>
        <h3>6.2 Permission you give GRIDGO</h3>
        <p>You keep the rights to your artwork. You allow GRIDGO, the print shop and the rider to store, copy, check, print, pack and deliver it, only to fulfil your order and settle any problem with it. We do not use your artwork for anything else, and we do not use it in GRIDGO's marketing without your separate written permission.</p>
        <h3>6.3 What GRIDGO will not print</h3>
        <p>GRIDGO does not print:</p>
        <ul>
          <li>IDs and official documents;</li>
          <li>counterfeit goods, or someone else's brand without their permission;</li>
          <li>hate or adult content;</li>
          <li>products for adults only, such as alcohol or vapes;</li>
          <li>anything else that is against the law.</li>
        </ul>
        <p>If we find that an order breaks this rule, we may cancel it. We then refund everything you paid.</p>
        <h3>6.4 How long we keep files</h3>
        <p>How long we keep your files is set out in our Privacy Policy. You can keep a file for later with "Save to My files".</p>
      </>
    ),
  },
  {
    id: 'prices',
    title: "Prices",
    body: (
      <>
        <ul>
          <li>Before a shop prices a job, the app may show an <strong>estimate</strong>. Nothing is owed on an estimate.</li>
          <li><strong>The total you pay is shown at checkout, before you pay.</strong> It includes the delivery charge. The delivery charge depends on the distance from the shop to your delivery pin.</li>
          <li>If you collect your order at the GRIDGO Office, any charge for that is shown at checkout.</li>
          <li>Vouchers are applied at checkout under the terms shown with them.</li>
          <li>The price of an order changes only through a change you approve in the app (section 5.5).</li>
        </ul>
      </>
    ),
  },
  {
    id: 'paying',
    title: "Paying",
    body: (
      <>
        <h3>8.1 How you pay</h3>
        <p>You pay by <strong>QR transfer</strong> from your own GCash, Maya or bank e-wallet to GRIDGO's QR code. GRIDGO does not take cards or cash. <strong>There is no cash on delivery.</strong></p>
        <h3>8.2 Showing us your payment</h3>
        <p>After you pay, add the <strong>screenshot of the transfer and its reference number</strong> in the app. Uploading a screenshot does not confirm your payment. GRIDGO Operations checks each payment against our wallet by hand, during working hours.</p>
        <h3>8.3 When work starts</h3>
        <p>Your order goes ahead only after we confirm your payment.</p>
        <h3>8.4 Paying in parts</h3>
        <p>Where the app offers it, you can pay part now and the rest later. We must confirm the rest before the order is delivered or handed over.</p>
        <h3>8.5 Problems with a payment</h3>
        <p>If we cannot match your payment, we tell you why and you can send it again. Check your first transfer before you pay a second time. If an order stays unpaid, GRIDGO may cancel it and will tell you when it does.</p>
      </>
    ),
  },
  {
    id: 'making-your-order',
    title: "Making your order",
    body: (
      <>
        <p>A shop that takes your order must make it in its own shop with its own equipment. It may not pass your order to another shop. The shop photographs the work while making it. You can see those photos. GRIDGO checks photos of the finished work before a rider collects it.</p>
      </>
    ),
  },
  {
    id: 'delivery-and-pickup',
    title: "Delivery and pickup",
    body: (
      <>
        <h3>10.1 Delivery</h3>
        <p>A GRIDGO rider brings your order to the pin you set. You can move your pin once, before a rider is assigned. You can follow the rider on the map while the order is on its way.</p>
        <h3>10.2 Before the rider leaves the shop</h3>
        <p>The rider checks your order against a six-point list before leaving the shop: the quantity, the specification, visible defects, the packaging, the paperwork and the shop's sign-off. If any check fails, the order stays at the shop and GRIDGO Operations is told.</p>
        <h3>10.3 Handover</h3>
        <p>If the app shows you a delivery code, read it out to your rider. Do not accept the order until the delivery is recorded. The rider records each delivery with a photo, or with your signature if the camera cannot be used.</p>
        <h3>10.4 Collecting from the GRIDGO Office</h3>
        <p>If you choose pickup, a rider brings your finished order to the GRIDGO Office, and we tell you when it is ready. Bring the QR and code shown in the app. <strong>Keep both private: anyone who has them can collect your order.</strong> If you miss collection days, your order stays safe at the office and is not forfeited. You can collect it on the next open day, or ask us to deliver it at your own cost.</p>
      </>
    ),
  },
  {
    id: 'if-something-is-wrong',
    title: "If something is wrong",
    body: (
      <>
        <h3>11.1 The report window</h3>
        <p>When your order is delivered, a <strong>report window</strong> opens. The app shows how long it lasts and counts it down. During the window, you can confirm that everything is fine or report a problem. If you do nothing, the window closes on its own.</p>
        <h3>11.2 Confirming early</h3>
        <p>If you confirm that everything is fine, the window closes at once and the shop is paid. You can no longer report a problem or ask for a refund on that order from the app.</p>
        <h3>11.3 Reporting a problem</h3>
        <p>Say what is wrong and add at least one photo. Only one report can be open on an order at a time, and you cannot withdraw it from the app. While it is open, the shop's payment is held. We aim to tell you the outcome within 2 business days.</p>
        <h3>11.4 What happens next</h3>
        <p>GRIDGO Operations decides who caused the problem and what remedy you get: a <strong>reprint</strong>, a <strong>replacement</strong>, a <strong>partial refund</strong> or a <strong>full refund</strong>. If the problem was caused by something you approved or a warning you accepted (section 5), there is no remedy.</p>
        <h3>11.5 After the window closes</h3>
        <p>Only GRIDGO Operations can look at a problem raised after the window closes. Contact support.</p>
      </>
    ),
  },
  {
    id: 'cancelling-an-order-and-refunds',
    title: "Cancelling an order and refunds",
    body: (
      <>
        <h3>12.1 If you want to cancel</h3>
        <p>Use <strong>Request a refund</strong> on the order and choose to cancel. The order stops while we check the request. You can withdraw the request until we approve it. We show you the amount before we send anything.</p>
        <ul>
          <li><strong>Before printing starts,</strong> we refund everything you paid.</li>
          <li><strong>After printing starts,</strong> we refund what has not already been spent on work done for your order.</li>
          <li><strong>Once a rider has your order,</strong> GRIDGO Operations works out the amount with you first.</li>
          <li><strong>After delivery,</strong> an order cannot be cancelled. Report a problem instead (section 11).</li>
        </ul>
        <p>There is no separate cancellation fee.</p>
        <h3>12.2 If GRIDGO or the shop cancels</h3>
        <p>GRIDGO may cancel an order before it goes into production, for example when the artwork cannot be printed or breaks section 6. We tell you why. If a shop cannot make your order, you choose another approved shop or a full refund. If we cancel an order because of what it asks us to print, we refund everything you paid.</p>
        <h3>12.3 How refunds are paid</h3>
        <p>GRIDGO Operations sends refunds by hand, from GRIDGO's wallet to <strong>your own receiving QR</strong>. You choose GCash, Maya, a bank or another e-wallet, give the name on the account, and confirm the account is yours. We record the transfer's reference number. If you used a voucher on an order refunded through no fault of yours, the voucher may be returned to your account.</p>
      </>
    ),
  },
  {
    id: 'chat-calls-and-support',
    title: "Chat, calls and support",
    body: (
      <>
        <ul>
          <li><strong>Order chat</strong> lets you talk with the shop about your order, and with your rider about the delivery. Phone numbers, email addresses, links and social media handles are hidden. Keep talking and paying through GRIDGO. GRIDGO can read chat between customers and shops, and may join it.</li>
          <li><strong>In-app calls</strong> let a rider talk to the customer or the shop on the same job without sharing phone numbers. Calls are not recorded.</li>
          <li><strong>Support chat</strong> in the apps connects you with GRIDGO Operations.</li>
          <li>Use chat and calls only for the order. You can report a message in shop chat to GRIDGO.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'notifications',
    title: "Notifications",
    body: (
      <>
        <p>If you allow notifications, we send you updates about your orders and your account, such as artwork checks, payment confirmations and deliveries. A notification only says there is an update. The details stay in the app. We send news and offers only if you agreed to receive them, and you can change that.</p>
      </>
    ),
  },
  {
    id: 'ratings',
    title: "Ratings",
    body: (
      <>
        <p>After an order is delivered and its report window has closed, you can rate the shop on quality, speed and value, and leave a comment. The shop does not see who left a rating. Ratings help GRIDGO choose shops for future orders. Rate honestly, and do not post personal details or abuse.</p>
      </>
    ),
  },
  {
    id: 'for-print-shops',
    title: "For print shops",
    body: (
      <>
        <p>These points sum up what the Supplier Agreement and the apps require. The Supplier Agreement governs the details.</p>
        <ul>
          <li><strong>Approval.</strong> A shop gets no orders until GRIDGO approves it, and each product or service it offers must also be approved.</li>
          <li><strong>Accepting work.</strong> A shop has one hour of its opening time to accept or decline an order. No answer counts as a decline and goes on the shop's record. A decline needs a reason.</li>
          <li><strong>Making the order.</strong> The shop makes every order it accepts in its own shop, with its own equipment, and never passes it to another shop. It must follow the client's approval record and special instructions.</li>
          <li><strong>Evidence.</strong> The shop must add at least one photo of production and photos of the finished work. GRIDGO checks them before a rider is called.</li>
          <li><strong>Handover.</strong> The rider checks the order with the shop at the counter. The shop signs on the rider's phone to hand it over. Until then, the order is the shop's responsibility. The shop does not put its own invoice or receipt in the package.</li>
          <li><strong>Payment.</strong> GRIDGO pays the shop in stages. Each stage is released by GRIDGO Operations on evidence. An open report or refund review holds the payment. The shop keeps payments already released. Payment goes to the shop's receiving QR.</li>
          <li><strong>Lateness.</strong> Late production may lead to a notice. Any money deducted for lateness is set out in the Supplier Agreement the shop accepted.</li>
          <li><strong>Contact.</strong> The shop talks with customers only through GRIDGO.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'for-riders',
    title: "For riders",
    body: (
      <>
        <p>These points sum up what the Rider Agreement and the app require. The Rider Agreement governs the details.</p>
        <ul>
          <li><strong>Approval.</strong> A rider gets no jobs until GRIDGO approves their vehicle and licence details. Riders must be 18 or older and hold a valid driver's licence for their vehicle.</li>
          <li><strong>Jobs.</strong> A rider carries one job at a time.</li>
          <li><strong>Pickup check.</strong> All six pickup checks must pass before the rider moves the order. If any check fails, the rider leaves the order at the shop, photographs the problem and waits for GRIDGO Operations.</li>
          <li><strong>Delivery.</strong> A delivery is complete only once GRIDGO has the rider's photo, or the customer's signature if the camera cannot be used, and, where the app asks for it, the customer's delivery code.</li>
          <li><strong>Location.</strong> During a job, the app shares the rider's location with GRIDGO and the people on that job. Sharing stops when the job ends.</li>
          <li><strong>No cash.</strong> Riders never collect money from customers.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: "Acceptable use",
    body: (
      <>
        <p>Do not:</p>
        <ul>
          <li>break the law, or help anyone else do so, through GRIDGO;</li>
          <li>order, make or deliver anything listed in section 6.3;</li>
          <li>give false information, use someone else's account, or pay with money that is not yours to use;</li>
          <li>harass, threaten or abuse anyone, including GRIDGO staff, shops and riders;</li>
          <li>share contact details to deal outside GRIDGO or to avoid its payments;</li>
          <li>interfere with GRIDGO's apps or systems, or try to reach data that is not yours;</li>
          <li>copy or reuse GRIDGO's apps, name or brand without our permission.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'suspending-or-removing-an-account',
    title: "Suspending or removing an account",
    body: (
      <>
        <p>GRIDGO may suspend or remove an account, and always records the reason. A suspended account shows the reason in the app. Orders already in progress are still finished or settled. We may do this if you break these terms, give false information, commit fraud, put people or orders at risk, or if the law requires it. Where we can, we tell you first and give you a chance to explain.</p>
      </>
    ),
  },
  {
    id: 'deleting-your-account',
    title: "Deleting your account",
    body: (
      <>
        <p>You can ask us to delete your account at any time: in the app (Account → Delete account), with the form at gridgo.talasora.com/delete-account, or by email. We confirm it is you and finish anything still open on your orders. We then delete your account within 30 days. Some records must be kept for longer, as the <Link to="/privacy">Privacy Policy</Link> explains. Uninstalling an app does not delete your account.</p>
      </>
    ),
  },
  {
    id: 'our-responsibility-to-you',
    title: "Our responsibility to you",
    body: (
      <>
        <p>We take care to make and deliver every order correctly, and we put right what goes wrong as set out in section 11.</p>
        <p>GRIDGO's total liability to you for an order is limited to what you paid for that order. GRIDGO is not liable for indirect losses, such as a missed event, lost profit or lost business, or for delays caused by events beyond our reasonable control, such as severe weather, power or network failures, or government action. Nothing in these terms limits a right you have under Philippine law, including the Consumer Act of the Philippines (Republic Act No. 7394), that cannot be limited by agreement.</p>
      </>
    ),
  },
  {
    id: 'disputes-and-the-law-that-applies',
    title: "Disputes and the law that applies",
    body: (
      <>
        <p>These terms are governed by the laws of the Republic of the Philippines.</p>
        <p>If you have a complaint, contact us first. We will try to settle it with you within 30 days. If we cannot, the dispute will be decided by the proper courts of Davao City, unless the law gives you the right to bring it elsewhere.</p>
      </>
    ),
  },
  {
    id: 'changes-to-these-terms',
    title: "Changes to these terms",
    body: (
      <>
        <p>When we change these terms, we update this page and the "Last updated" date. If a change matters to you, the apps tell you what changed and ask you to agree before you keep using GRIDGO. Your orders are kept safe while you read. We keep every published version.</p>
      </>
    ),
  },
  {
    id: 'contact-us',
    title: "Contact us",
    body: (
      <>
        <p><strong>The GRIDGO team</strong>, Davao City, Philippines</p>
        <p>Email: {mail}</p>
        <p>You can also reach us through support chat in any GRIDGO app, or the support form at gridgo.talasora.com/support.</p>
      </>
    ),
  },
];

export function TermsPage() {
  return (
    <LegalLayout
      documentTitle="Terms of Service | GRIDGO"
      kicker="Legal"
      title="Terms of Service"
      effectiveDate={TERMS_EFFECTIVE_DATE}
      lastUpdated={TERMS_LAST_UPDATED}
      intro={
        <>
        <p>These terms are the agreement between you and GRIDGO when you use the GRIDGO, GRIDGO Supplier or GRIDGO Rider apps, the GRIDGO dashboard or this website. Please read them with our <Link to="/privacy">Privacy Policy</Link>, which explains what data we collect and why.</p>
        </>
      }
      sections={sections}
    />
  );
}
