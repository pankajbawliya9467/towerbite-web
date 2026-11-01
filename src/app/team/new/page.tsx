'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { api } from '@/lib/api';
import { time12 } from '@/lib/format';
import { getSavedLocation } from '@/lib/savedLocation';
import type { Cafe, Team } from '@/lib/types';
import { useRequireLogin } from '@/lib/useRequireLogin';

/** The next few half-hours from now, as "HH:MM". */
function nextTimes(n: number) {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60);
  if (d.getTime() - Date.now() < 15 * 60000) d.setMinutes(d.getMinutes() + 30);
  return Array.from({ length: n }, (_, i) => {
    const t = new Date(d.getTime() + i * 30 * 60000);
    return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  }).filter((t) => t >= '07:00' && t <= '22:30');
}

export default function NewTeamPage() {
  return (
    <Suspense fallback={null}>
      <NewTeam />
    </Suspense>
  );
}

function NewTeam() {
  const profile = useRequireLogin();
  const params = useSearchParams();
  const router = useRouter();
  const slug = profile?.location?.slug ?? (typeof window !== 'undefined' ? getSavedLocation() : null);
  const [cafes, setCafes] = useState<Cafe[] | null>(null);
  const [cafeId, setCafeId] = useState<string | null>(params.get('cafe'));
  const [name, setName] = useState('');
  const [deliverTo, setDeliverTo] = useState('');
  const times = useMemo(() => nextTimes(4), []);
  const [deliverAt, setDeliverAt] = useState('asap');
  const [closesIn, setClosesIn] = useState(15);
  const [payMode, setPayMode] = useState<'split' | 'host'>('split');
  const [upi, setUpi] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) api<Cafe[]>(`/v1/locations/${slug}/cafes`, { auth: false }).then(setCafes, (e) => setError(e.message));
  }, [slug]);
  const open = (cafes ?? []).filter((c) => c.isOpen && c.acceptingOrders);
  const chosen = cafeId && open.some((c) => c.id === cafeId) ? cafeId : open[0]?.id ?? null;
  const places = ['Meeting room', profile?.desk ? `Desk ${profile.desk}` : null, profile?.floor ? `Floor ${profile.floor} bay` : null, 'Cafeteria'].filter((x): x is string => !!x);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!chosen) return setError('Pick a cafe');
    if (!deliverTo.trim()) return setError('Where should it come? (e.g. Meeting room B)');
    setBusy(true);
    setError('');
    try {
      const t = await api<Team>('/v1/team-orders', {
        method: 'POST',
        body: {
          cafeId: chosen, name: name.trim() || 'Team order', deliverTo: deliverTo.trim(),
          deliverAt: deliverAt === 'asap' ? null : deliverAt, closesInMin: closesIn, payMode,
          upiId: payMode === 'split' && upi.trim() ? upi.trim() : null,
        },
      });
      router.replace(`/team/${t.code}?share=1`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <TopBar location={profile?.location ?? undefined} cart />
      <main className="page" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Start a team order</h1>
        <p className="sub">One link for the team. Everyone adds their own item, it all comes in one delivery.</p>
        <form className="card form-stack" style={{ padding: 22, marginTop: 18 }} onSubmit={create}>
          <label>
            <div className="cap">Name it</div>
            <input className="field" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="4 PM chai · Platform team" />
          </label>
          <div>
            <div className="cap">From which cafe</div>
            {!cafes && <div className="skel" style={{ height: 52 }} />}
            <div className="choice-row">
              {open.map((c) => (
                <button key={c.id} type="button" className={`choice ${c.id === chosen ? 'on' : ''}`} onClick={() => setCafeId(c.id)} aria-pressed={c.id === chosen}>
                  {c.name}<small>{c.place}</small>
                </button>
              ))}
            </div>
            {cafes && !open.length && <p className="meta">No cafe is taking orders right now.</p>}
          </div>
          <label>
            <div className="cap">Deliver to</div>
            <input className="field" value={deliverTo} maxLength={60} onChange={(e) => setDeliverTo(e.target.value)} placeholder="Meeting room B, 7th floor" />
            <div className="choice-row" style={{ marginTop: 8 }}>
              {places.map((p) => <button key={p} type="button" className="chip" style={{ height: 30 }} onClick={() => setDeliverTo(p)}>{p}</button>)}
            </div>
          </label>
          <div>
            <div className="cap">When</div>
            <div className="choice-row">
              {[['asap', 'As soon as ready'], ...times.map((t) => [t, time12(t)])].map(([k, label]) => (
                <button key={k} type="button" className={`choice ${deliverAt === k ? 'on' : ''}`} onClick={() => setDeliverAt(k)} aria-pressed={deliverAt === k}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="cap">Teammates can add for</div>
            <div className="choice-row">
              {[10, 15, 20, 30].map((m) => (
                <button key={m} type="button" className={`choice ${closesIn === m ? 'on' : ''}`} onClick={() => setClosesIn(m)} aria-pressed={closesIn === m}>{m} min</button>
              ))}
            </div>
          </div>
          <div>
            <div className="cap">Who pays?</div>
            <div className="choice-row">
              <button type="button" className={`choice ${payMode === 'split' ? 'on' : ''}`} onClick={() => setPayMode('split')}>Everyone pays own<small>Split by what they add</small></button>
              <button type="button" className={`choice ${payMode === 'host' ? 'on' : ''}`} onClick={() => setPayMode('host')}>I pay for all<small>Treat the team</small></button>
            </div>
            {payMode === 'split' && (
              <>
                <input className="field" style={{ marginTop: 10 }} value={upi} maxLength={80} autoCapitalize="none" onChange={(e) => setUpi(e.target.value)} placeholder="Your UPI ID (optional) · name@okaxis" />
                <p className="meta" style={{ marginTop: 6 }}>You pay the cafe; teammates pay you back with one tap.</p>
              </>
            )}
          </div>
          {error && <p className="err" style={{ marginTop: 0 }}>{error}</p>}
          <button className="btn" disabled={busy || !chosen}>{busy ? 'Creating…' : 'Create & share link'}</button>
        </form>
      </main>
    </>
  );
}
