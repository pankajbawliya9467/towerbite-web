'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { LogoMark, Wordmark } from '@/components/Logo';
import { OtpInput } from '@/components/OtpInput';
import { api } from '@/lib/api';
import { sendOtp, verifyOtp } from '@/lib/auth';
import { formatPhone } from '@/lib/format';
import { getSavedLocation } from '@/lib/savedLocation';
import { useSession } from '@/lib/session';
import type { Profile } from '@/lib/types';

const RESEND_AFTER = 30;

export function LoginCard() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const { ready, profile, refresh, setProfile } = useSession();
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [digits, setDigits] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const phone = `+91${digits}`;

  // Only same-site paths: "/orders" yes, "//evil.com" or "/\\evil.com" no (open redirect).
  const safeNext = next && /^\/(?![\/\\])/.test(next) ? next : null;
  const done = () => router.replace(safeNext ?? `/${getSavedLocation() ?? ''}`);

  // Already logged in: nothing to do here.
  useEffect(() => {
    if (ready && profile?.name && step === 'phone') done();
  });

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  }

  const requestOtp = () =>
    run(async () => {
      await sendOtp(phone);
      setCode('');
      setStep('otp');
      setWait(RESEND_AFTER);
    });

  const verify = () =>
    run(async () => {
      await verifyOtp(phone, code);
      const p = await refresh();
      if (p?.name) done();
      else setStep('name');
    });

  const saveName = () =>
    run(async () => {
      setProfile(await api<Profile>('/v1/me', { method: 'PUT', body: { name: name.trim() } }));
      done();
    });

  if (step === 'phone')
    return (
      <form className="card login-card" onSubmit={(e) => { e.preventDefault(); requestOtp(); }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogoMark size={48} color="#fff" cup="var(--accent)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.6 }}><Wordmark /></div>
        </div>
        <h1 className="h1" style={{ marginTop: 28 }}>Your building&apos;s cafes,<br />at your desk.</h1>
        <p className="sub" style={{ marginTop: 12 }}>Order coffee, snacks and meals from cafes in your office building.</p>
        <label className="cap" htmlFor="phone" style={{ display: 'block', marginTop: 44 }}>Mobile number</label>
        <div className="field" style={{ marginTop: 10, display: 'flex', gap: 12 }}>
          <span style={{ color: 'var(--sub)' }}>+91</span>
          <span style={{ width: 1, background: 'var(--line)' }} />
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoFocus
            value={digits.replace(/^(\d{5})(\d)/, '$1 $2')}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="98765 43210"
            style={{ border: 0, outline: 0, flex: 1, minWidth: 0, fontSize: 16, lineHeight: '19px', background: 'none' }}
          />
        </div>
        {error && <p className="err">{error}</p>}
        <button className="btn" style={{ marginTop: 20 }} disabled={busy || digits.length !== 10}>Get OTP</button>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--faint)', marginTop: 20, lineHeight: 1.5 }}>
          By continuing, you agree to our<br /><u>Terms</u> and <u>Privacy Policy</u>
        </p>
      </form>
    );

  return (
    <form
      className="card login-card"
      onSubmit={(e) => {
        e.preventDefault();
        if (step === 'otp') verify();
        else saveName();
      }}
    >
      <button type="button" aria-label="Back" style={{ fontSize: 24, display: 'flex' }} onClick={() => { setStep('phone'); setError(''); }}>
        <Icon name="back" />
      </button>
      <h1 className="h1" style={{ marginTop: 28 }}>Enter the code</h1>
      <p className="sub" style={{ marginTop: 10 }}>
        We sent a 6-digit code to<br /><b style={{ color: 'var(--text)' }}>{formatPhone(phone)}</b>
      </p>
      <div style={{ marginTop: 36 }}>
        <OtpInput value={code} onChange={setCode} />
      </div>
      {step === 'otp' && (
        <p style={{ fontSize: 14, color: 'var(--sub)', marginTop: 20 }}>
          {wait > 0 ? (
            <>Resend code in <b style={{ color: 'var(--text)' }}>0:{String(wait).padStart(2, '0')}</b></>
          ) : (
            <button type="button" className="link" onClick={requestOtp} disabled={busy}>Resend code</button>
          )}
        </p>
      )}
      {step === 'name' && (
        <>
          <label className="cap" htmlFor="name" style={{ display: 'block', marginTop: 36 }}>Your name</label>
          <input id="name" className="field" style={{ marginTop: 10 }} value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
        </>
      )}
      {error && <p className="err">{error}</p>}
      <button
        className="btn"
        style={{ marginTop: 28 }}
        disabled={busy || (step === 'otp' ? code.length !== 6 : !name.trim())}
      >
        Continue
      </button>
    </form>
  );
}
