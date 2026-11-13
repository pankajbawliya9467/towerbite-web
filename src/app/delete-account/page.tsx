import type { Metadata } from 'next';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { CONTACT_EMAIL } from '@/lib/legal';
import { DeleteForm } from './DeleteForm';

export const metadata: Metadata = {
  title: 'Delete your account · TowerBites',
  description: 'Ask TowerBites to delete your account and personal data.',
};

export default function DeleteAccountPage() {
  return (
    <>
      <TopBar title="Delete account" />
      <main className="legal">
        <h1>Delete your TowerBites account</h1>
        <p>
          Use this form to ask us to delete your TowerBites account and the personal information linked to it. Enter the
          mobile number you log in with. We process every request within <b>30 days</b>.
        </p>

        <div className="legal-cols">
          <section className="card legal-box">
            <h2>What gets deleted</h2>
            <ul>
              <li>Your profile: name, mobile number and desk address</li>
              <li>Your saved notification token (no more notifications)</li>
              <li>Your ratings and comments</li>
              <li>Your lunch bookings and team-order memberships</li>
            </ul>
          </section>
          <section className="card legal-box">
            <h2>What may be kept</h2>
            <ul>
              <li>Past orders, without your name, phone or desk, where cafes need them for their accounts</li>
              <li>Records the law requires us to keep, only for as long as required</li>
            </ul>
          </section>
        </div>

        <DeleteForm />

        <p className="legal-meta" style={{ marginTop: 24 }}>
          You can also just want some data removed without closing your account. Pick “Delete some of my data” above and tell
          us what.{CONTACT_EMAIL ? <> Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</> : null}{' '}
          See our <Link href="/privacy">privacy policy</Link>.
        </p>
      </main>
    </>
  );
}
