import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Join a team order · TowerBites',
  description: 'Add your own item to your team order. One delivery, everyone pays their own share.',
  robots: { index: false },
};

/**
 * The link a host shares on WhatsApp/Slack. Team orders live in the TowerBites app,
 * so this page opens the app on the right team cart (towerbites://team/CODE) and shows the code.
 */
export default async function TeamInvite({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = raw.toUpperCase();
  if (!/^[A-Z0-9]{8}$/.test(code)) notFound();
  const appLink = `towerbites://team/${code}`;
  return (
    <main className="login-page">
      <div className="card login-card" style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: '#EEF2FF', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3730A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="9" cy="8" r="3.5" /><path d="M2 20c1-3.5 3.8-5 7-5s6 1.5 7 5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .7 3.3 2.3 4 5" />
          </svg>
        </div>
        <h1 className="h1">You&apos;re invited to a team order</h1>
        <p className="sub" style={{ marginTop: 8 }}>Add what you want. It all comes in one delivery and you pay only for your items.</p>
        <a href={appLink} className="btn" style={{ marginTop: 24, width: '100%' }}>Open in TowerBites app</a>
        <div style={{ marginTop: 20, padding: 14, borderRadius: 14, background: 'var(--chip, #F3F1EC)' }}>
          <div className="sub" style={{ fontSize: 13 }}>Or open the app → Orders → Join with code</div>
          <div style={{ marginTop: 6, fontSize: 26, fontWeight: 800, letterSpacing: 4 }}>{code}</div>
        </div>
      </div>
    </main>
  );
}
