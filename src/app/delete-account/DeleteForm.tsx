'use client';

import { useState, type FormEvent } from 'react';
import { api } from '@/lib/api';

/** Sends a deletion request. The answer is the same whether or not the number has an account. */
export function DeleteForm() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [kind, setKind] = useState<'delete_account' | 'delete_data'>('delete_account');
  const [reason, setReason] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api<{ ok: boolean; message: string }>('/v1/account/requests', {
        method: 'POST',
        auth: false,
        body: { phone, name, kind, reason },
      });
      setDone(r.message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="card legal-box legal-done" role="status">
        <h2>Request received</h2>
        <p>{done}</p>
      </section>
    );
  }

  return (
    <form className="card legal-box legal-form" onSubmit={submit}>
      <h2>Send a request</h2>
      <div className="legal-kinds" role="radiogroup" aria-label="What do you want?">
        <label className={kind === 'delete_account' ? 'on' : undefined}>
          <input type="radio" name="kind" checked={kind === 'delete_account'} onChange={() => setKind('delete_account')} />
          Delete my account and data
        </label>
        <label className={kind === 'delete_data' ? 'on' : undefined}>
          <input type="radio" name="kind" checked={kind === 'delete_data'} onChange={() => setKind('delete_data')} />
          Delete some of my data
        </label>
      </div>
      <label>
        <div className="cap">Mobile number you log in with</div>
        <input className="field" required inputMode="tel" maxLength={14} value={phone} placeholder="98765 43210" onChange={(e) => setPhone(e.target.value)} />
      </label>
      <label>
        <div className="cap">Name (optional)</div>
        <input className="field" maxLength={80} value={name} placeholder="Your name" onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        <div className="cap">{kind === 'delete_data' ? 'Which data should we delete?' : 'Anything else? (optional)'}</div>
        <textarea className="field" rows={3} maxLength={500} value={reason} required={kind === 'delete_data'}
          placeholder={kind === 'delete_data' ? 'For example: my ratings and comments' : 'Tell us why, if you like'} onChange={(e) => setReason(e.target.value)} />
      </label>
      <label className="legal-agree">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        {kind === 'delete_account'
          ? 'I understand my account and personal data will be deleted and this can’t be undone.'
          : 'I understand the data I listed will be deleted and this can’t be undone.'}
      </label>
      {error && <p className="err">{error}</p>}
      <button className="btn" style={{ background: 'var(--red)' }} disabled={busy || !agree || !phone.trim()}>
        {busy ? 'Sending…' : 'Send deletion request'}
      </button>
    </form>
  );
}
