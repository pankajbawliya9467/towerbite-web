import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="login-page">
      <div className="card login-card" style={{ textAlign: 'center' }}>
        <h1 className="h1">Page not found</h1>
        <p className="sub" style={{ marginTop: 8 }}>This cafe or location doesn&apos;t exist.</p>
        <Link href="/" className="btn" style={{ marginTop: 24 }}>Go home</Link>
      </div>
    </main>
  );
}
