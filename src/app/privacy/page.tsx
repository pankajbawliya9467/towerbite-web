import type { Metadata } from 'next';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { COMPANY_NAME, CONTACT_EMAIL, POLICY_DATE } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy policy · TowerBites',
  description: 'What TowerBites collects, why, who sees it, and how to delete your account.',
};

export default function PrivacyPage() {
  // Same name as the app → just "TowerBites"; a different company → "TowerBites (operated by …)".
  const operator = COMPANY_NAME && COMPANY_NAME !== 'TowerBites' ? `TowerBites (operated by ${COMPANY_NAME})` : 'TowerBites';
  return (
    <>
      <TopBar title="Privacy policy" />
      <main className="legal">
        <h1>Privacy policy</h1>
        <p className="legal-meta">Last updated: {POLICY_DATE}</p>

        <p>
          {operator} (“TowerBites”, “we”) lets people working in an office building order food and drinks from the
          cafes in that building and get them delivered to their desk. This policy explains what information we collect
          in the TowerBites app and website, why, who can see it, and the choices you have.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li><b>Mobile number</b>: to log you in with a one-time code (OTP) and so the cafe can reach you about an order.</li>
          <li><b>Name</b>: shown to the cafe on your order, and to teammates in a team order.</li>
          <li><b>Desk address</b>: building, tower, floor, company and desk number, so your order reaches you.</li>
          <li><b>Orders</b>: what you ordered, from which cafe, notes for the cafe, the amount and the order status.</li>
          <li><b>Lunch bookings and team orders</b>: the lunch you booked and its time slot; for team orders, the items you added and whether you have paid the host. If you host a team order you may add your UPI ID so teammates can pay you.</li>
          <li><b>Ratings</b>: the stars, tags, thumbs up/down on items and any comment you leave after a delivery.</li>
          <li><b>Notification token</b>: so we can send order updates (accepted, on the way, delivered) to your phone.</li>
          <li><b>Technical data</b>: basic server logs (time of request, type of device, errors) to keep the service working and secure.</li>
        </ul>
        <p>
          <b>Location:</b> if you tap “Use my location” to find your building, the app uses your phone’s location only
          on your phone to match it to a building. We do not send or store your location.
        </p>
        <p>
          <b>Payments:</b> you pay the cafe by cash or UPI when the order arrives. We do not collect or store card or bank
          details.
        </p>

        <h2>How we use it</h2>
        <ul>
          <li>To log you in and keep your account secure.</li>
          <li>To pass your order to the cafe and deliver it to your desk.</li>
          <li>To send you updates about your orders, lunch bookings and team orders.</li>
          <li>To show cafes their orders, ratings and reports, so they can improve.</li>
          <li>To prevent misuse (for example, limits on how many orders can be placed at once).</li>
        </ul>
        <p>We do not sell your information and we do not show ads.</p>

        <h2>Who can see it</h2>
        <ul>
          <li><b>The cafe you order from</b>, and its delivery staff: your name, mobile number, desk address, the items and your note.</li>
          <li><b>Cafes, for ratings</b>: only your first name and floor, never your phone number.</li>
          <li><b>Teammates in a team order</b>: your name, the items you added and your payment status (and the host’s UPI ID, if the host added it).</li>
          <li>
            <b>Service providers who run TowerBites for us</b>: Supabase (login and database), Render (our server),
            Vercel (this website), and Expo and Google Firebase Cloud Messaging (notifications). They process data only to
            provide their service to us.
          </li>
          <li><b>Authorities</b>, if the law requires it.</li>
        </ul>

        <h2>How long we keep it</h2>
        <p>
          We keep your account information while your account is active. Order records may be kept longer where cafes need
          them for their accounts or where the law requires. When you delete your account, we delete or anonymise your
          personal information, as described below.
        </p>

        <h2>Security</h2>
        <p>
          Information is sent over encrypted connections (HTTPS), stored with access controls, and only people who need it
          to run the service can reach it. No system is perfectly secure, but we work to protect your information.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>You can change your name and desk address in the app (Profile).</li>
          <li>You can turn notifications off in your phone’s settings.</li>
          <li>
            You can ask us to <b>delete your account and data</b> at <Link href="/delete-account">towerbite-web.vercel.app/delete-account</Link>
            {CONTACT_EMAIL ? <> or by emailing <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></> : null}. We process requests within 30 days.
          </li>
        </ul>

        <h2>Children</h2>
        <p>TowerBites is for people working in office buildings and is not meant for anyone under 18.</p>

        <h2>Changes to this policy</h2>
        <p>If we change this policy, we will update the date at the top and, for important changes, tell you in the app.</p>

        <h2>Contact</h2>
        <p>
          {CONTACT_EMAIL
            ? <>Questions about privacy? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</>
            : <>Questions about privacy? Send us a request from the <Link href="/delete-account">account &amp; data request page</Link>.</>}
        </p>
      </main>
    </>
  );
}
