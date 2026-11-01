'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { minutesUntil, rupees, time12 } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { CafeWithMenu, Team, TeamPerson } from '@/lib/types';
import { Icon } from './Icon';
import { TopBar } from './TopBar';

const ORDER_STATUS: Record<string, string> = {
  placed: 'Waiting for the cafe', preparing: 'Being prepared', out_for_delivery: 'On the way',
  delivered: 'Delivered', rejected: 'Declined by the cafe', cancelled: 'Cancelled',
};
const TONES = [['#FDEBDD', '#9A3412'], ['#DCF2E3', '#14532D'], ['#E0ECFF', '#1E3A8A'], ['#FEF3C7', '#713F12'], ['#F3E8FF', '#6B21A8']];

/** The shared team cart on the website: share, add my items, host places one order, then settle up. */
export function TeamView({ code }: { code: string }) {
  const { ready, profile } = useSession();
  const params = useSearchParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [toast, setToast] = useState('');
  const [, tick] = useState(0);
  const shared = useRef(false);

  const load = useCallback(() => {
    api<Team>(`/v1/team-orders/${code}`).then((t) => (setTeam(t), setError('')), (e) => setError(e.message));
  }, [code]);
  useEffect(() => {
    if (profile) load();
  }, [profile, load]);
  const live = team && (team.status === 'open' || team.status === 'closed' || team.status === 'placed');
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => document.visibilityState === 'visible' && (load(), tick((n) => n + 1)), team?.status === 'placed' ? 15000 : 5000);
    return () => clearInterval(t);
  }, [live, team?.status, load]);

  const link = typeof window !== 'undefined' ? `${window.location.origin}/team/${code}` : '';
  const flash = (m: string) => (setToast(m), setTimeout(() => setToast(''), 3000));
  const message = team ? `Join my team order "${team.name}" from ${team.cafe.name} on TowerBites. Add what you want here: ${link}` : '';
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);
      flash('Link copied. Paste it in your team chat.');
    } catch {
      flash(link);
    }
  }, [message, link]);
  useEffect(() => {
    if (params.get('share') && team?.isHost && team.status === 'open' && !shared.current) {
      shared.current = true;
      void copy();
    }
  }, [params, team, copy]);

  async function run(key: string, fn: () => Promise<Team | void>) {
    setBusy(key);
    try {
      const t = await fn();
      if (t) setTeam(t);
      else load();
    } catch (e) {
      flash((e as Error).message);
    } finally {
      setBusy('');
    }
  }

  if (!ready) return null;
  if (!profile) return <Invite code={code} />;
  if (!team)
    return (
      <>
        <TopBar location={profile.location ?? undefined} cart />
        <main className="page">{error ? <p className="err">{error}</p> : <div className="skel" style={{ height: 120 }} />}</main>
      </>
    );

  const t = team;
  const canAdd = t.status === 'open' || (t.status === 'closed' && t.isHost);
  const mins = minutesUntil(t.closesAt);
  const chip =
    t.status === 'open' ? { label: mins > 0 ? `Adding closes in ${mins} min` : 'Closing now', bg: '#FDE68A', fg: '#713F12' }
    : t.status === 'closed' ? { label: 'Adding closed', bg: '#FDE68A', fg: '#713F12' }
    : t.status === 'placed' ? { label: `Order #${t.order?.orderNo ?? ''} placed`, bg: '#BBF7D0', fg: '#14532D' }
    : { label: 'Cancelled', bg: '#E7E5E4', fg: '#44403C' };
  const people = t.people.filter((p) => p.items.length || p.isHost || p.isMe);
  const owing = t.people.filter((p) => p.owes > 0);
  const me = t.me;

  const place = () =>
    run('place', async () => {
      const waiting = t.people.filter((p) => !p.items.length && !p.isHost).length;
      if (!confirm(`Place team order?\n\n${t.itemCount} items for ${t.peopleWithItems} people, ${rupees(t.total)}.${waiting ? ` ${waiting} people haven't added anything.` : ''}`)) return t;
      return (await api<{ team: Team }>(`/v1/team-orders/${t.code}/place`, { method: 'POST' })).team;
    });
  const payUpi = () => {
    if (!t.upiId || !me) return;
    const q = new URLSearchParams({ pa: t.upiId, pn: t.hostName, am: String(me.owes), cu: 'INR', tn: `TowerBites ${t.name}`.slice(0, 40) });
    window.location.href = `upi://pay?${q}`;
  };

  return (
    <>
      <TopBar location={profile.location ?? undefined} cart />
      <main className="page">
        <section className="team-head">
          <div style={{ minWidth: 0 }}>
            <h1>{t.name}</h1>
            <p>{t.cafe.name} → {t.deliverTo} · {t.deliverAt ? time12(t.deliverAt) : 'As soon as ready'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <span className="team-chip" style={{ background: chip.bg, color: chip.fg }}><Icon name="clock" />{chip.label}</span>
              <span style={{ fontSize: 13, color: '#d6d3cd', fontWeight: 700 }}>{t.peopleWithItems} added · {t.isHost ? 'you started it' : `by ${t.hostName}`}</span>
            </div>
          </div>
          {(t.status === 'open' || t.status === 'closed') && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a className="btn" style={{ width: 'auto', height: 44, padding: '0 16px', background: '#16a34a', boxShadow: 'none', fontSize: 14 }}
                href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <button className="btn dark" style={{ width: 'auto', height: 44, padding: '0 16px', background: 'rgba(255,255,255,.12)', fontSize: 14 }} onClick={copy}>
                <Icon name="share" /> Copy link
              </button>
              <span style={{ height: 44, padding: '0 14px', borderRadius: 14, background: 'rgba(255,255,255,.12)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <small style={{ fontSize: 10, color: '#d6d3cd', fontWeight: 700 }}>CODE</small>
                <b style={{ letterSpacing: 2, fontSize: 14 }}>{t.code}</b>
              </span>
            </div>
          )}
        </section>

        <div className="team-cols">
          <section className="team-main">
            {t.status === 'placed' && t.order && (
              <Link href={t.isHost ? `/orders/${t.order.id}` : '#'} className="person" style={{ borderColor: '#bbf7d0' }}>
                <span className="ava" style={{ background: t.order.status === 'delivered' ? 'var(--greenSoft)' : 'var(--accentSoft)', color: t.order.status === 'delivered' ? 'var(--green)' : 'var(--accentDark)' }}>
                  <Icon name={t.order.status === 'delivered' ? 'check' : 'clock'} />
                </span>
                <span style={{ flex: 1 }}><b>{ORDER_STATUS[t.order.status]}</b><div className="meta">Order #{t.order.orderNo} · {rupees(t.order.total)} · to {t.deliverTo}</div></span>
                {t.isHost && <Icon name="next" />}
              </Link>
            )}

            {t.status === 'placed' && t.payMode === 'split' && me && !me.isHost && me.owes > 0 && (
              <div className="card" style={{ padding: 14 }}>
                <b>{me.paid ? `You paid ${t.hostName} ${rupees(me.owes)}` : me.claimed ? `Waiting for ${t.hostName} to confirm ${rupees(me.owes)}` : `You owe ${t.hostName} ${rupees(me.owes)}`}</b>
                {!me.paid && !me.claimed && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {t.upiId && <button className="btn dark" style={{ height: 44, fontSize: 14 }} onClick={payUpi}>Pay {rupees(me.owes)} via UPI</button>}
                    <button className="btn sec" style={{ height: 44, fontSize: 14 }} disabled={busy === 'paid'}
                      onClick={() => run('paid', () => api<Team>(`/v1/team-orders/${t.code}/paid`, { method: 'POST', body: {} }))}>
                      {t.upiId ? 'I paid' : 'I paid in cash/UPI'}
                    </button>
                  </div>
                )}
                {t.upiId && !me.paid && !me.claimed && <p className="meta" style={{ marginTop: 8 }}>UPI ID: {t.upiId}</p>}
              </div>
            )}

            {t.status === 'placed' && t.payMode === 'split' && t.isHost && owing.length > 0 && (
              <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="row"><b>Collected from team</b><b>{rupees(t.collected)} / {rupees(t.toCollect)}</b></div>
                <div className="bar" style={{ height: 8 }}><div style={{ width: `${t.toCollect ? (t.collected / t.toCollect) * 100 : 100}%`, background: 'var(--greenDot)' }} /></div>
                {owing.map((p, i) => (
                  <div key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Ava p={p} i={i + 1} />
                    <span style={{ flex: 1 }}>
                      <b style={{ fontSize: 14 }}>{p.name} · {rupees(p.owes)}</b>
                      <div style={{ fontSize: 12, fontWeight: 700, color: p.paid ? 'var(--green)' : 'var(--amber)' }}>{p.paid ? 'Paid' : p.claimed ? 'Says paid · confirm if you got it' : 'Pending'}</div>
                    </span>
                    {!p.paid && !p.claimed && (
                      <button className="small-btn" onClick={() => run(`r${p.userId}`, async () => void (await api(`/v1/team-orders/${t.code}/remind`, { method: 'POST', body: { userId: p.userId } }), flash(`Reminder sent to ${p.name}`)))}>Remind</button>
                    )}
                    {!p.paid && (
                      <button className="small-btn green" onClick={() => run(`p${p.userId}`, () => api<Team>(`/v1/team-orders/${t.code}/paid`, { method: 'POST', body: { userId: p.userId } }))}>Got it</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="row" style={{ marginTop: 4 }}><b style={{ fontSize: 16 }}>Team cart · {rupees(t.total)}</b><span className="meta">{t.itemCount} items</span></div>
            {people.map((p, i) => <PersonRow key={p.userId} p={p} i={i} />)}
            {t.status === 'closed' && !t.isHost && <div className="notice">Adding closed. Ask {t.hostName} if you still want something.</div>}
            {t.status === 'cancelled' && <div className="notice red">{t.isHost ? 'You' : t.hostName} cancelled this team order.</div>}
            {t.isHost && (t.status === 'open' || t.status === 'closed') && (
              <>
                <button className="btn" disabled={!t.total || busy === 'place'} onClick={place}>
                  {busy === 'place' ? 'Placing…' : t.total ? `Place team order · ${rupees(t.total)}` : 'Waiting for items'}
                </button>
                <p className="meta" style={{ textAlign: 'center' }}>{t.payMode === 'host' ? 'You pay for everyone' : 'Each pays their own share'}</p>
                <button className="link" style={{ color: 'var(--red)', alignSelf: 'center' }}
                  onClick={() => confirm('Cancel team order? Everyone who added will be told.') && run('cancel', () => api<Team>(`/v1/team-orders/${t.code}/cancel`, { method: 'POST' }))}>
                  Cancel team order
                </button>
              </>
            )}
          </section>
          {canAdd && <Picker team={t} onSaved={setTeam} />}
        </div>
      </main>
      {toast && <div className="cart-bar" style={{ background: 'var(--ink)', justifyContent: 'center', maxWidth: 520, margin: '0 auto', boxShadow: 'none' }}>{toast}</div>}
    </>
  );
}

function Ava({ p, i }: { p: TeamPerson; i: number }) {
  const [bg, fg] = TONES[i % TONES.length];
  return <span className="ava" style={{ background: bg, color: fg }}>{(p.name.trim()[0] ?? '?').toUpperCase()}</span>;
}

function PersonRow({ p, i }: { p: TeamPerson; i: number }) {
  const summary = p.items.length ? p.items.map((x) => (x.qty > 1 ? `${x.name} × ${x.qty}` : x.name)).join(', ') : p.isHost ? 'Nothing for themselves yet' : 'Still choosing…';
  return (
    <div className={`person ${p.items.length ? '' : 'empty-p'}`}>
      <Ava p={p} i={i} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <b style={{ fontSize: 14 }}>{p.name}{p.isMe ? ' (you)' : ''}{p.isHost ? ' · host' : ''}</b>
        <div className="meta">{summary}</div>
        {p.note && <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)' }}>Note: {p.note}</div>}
      </span>
      <b>{p.items.length ? rupees(p.amount) : '—'}</b>
    </div>
  );
}

/** "Your items": pick from the cafe's menu into the shared cart. */
function Picker({ team, onSaved }: { team: Team; onSaved: (t: Team) => void }) {
  const [menu, setMenu] = useState<CafeWithMenu | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const mineKey = JSON.stringify(team.me?.items ?? []);

  useEffect(() => {
    api<CafeWithMenu>(`/v1/cafes/${team.cafe.id}`, { auth: false }).then(setMenu, (e) => setError(e.message));
  }, [team.cafe.id]);
  useEffect(() => {
    setQty(Object.fromEntries((team.me?.items ?? []).map((i) => [i.menuItemId, i.qty])));
    setNote(team.me?.note ?? '');
    // reset only when my saved items change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mineKey]);

  const items = (menu?.items ?? []).filter((i) => i.isAvailable || qty[i.id]);
  const total = items.reduce((s, i) => s + i.price * (qty[i.id] ?? 0), 0);
  const count = Object.values(qty).reduce((s, n) => s + n, 0);
  const set = (id: string, n: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(10, n)) }));

  async function save() {
    setBusy(true);
    setError('');
    try {
      const lines = Object.entries(qty).filter(([, n]) => n > 0).map(([menuItemId, n]) => ({ menuItemId, qty: n }));
      onSaved(await api<Team>(`/v1/team-orders/${team.code}/items`, { method: 'PUT', body: { items: lines, note: note.trim() || undefined } }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="team-side card" style={{ padding: 16, gap: 0 }}>
      <b style={{ fontSize: 16 }}>Your items</b>
      <p className="meta" style={{ marginBottom: 6 }}>{team.payMode === 'host' ? `${team.hostName} is paying for everyone.` : `You pay ${team.hostName} only for what you add.`}</p>
      {!menu && !error && <div className="skel" style={{ height: 200 }} />}
      <div style={{ maxHeight: 420, overflow: 'auto' }}>
        {items.map((i) => (
          <div key={i.id} className="pick-row">
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className={`veg ${i.isVeg ? '' : 'nv'}`} /><b style={{ fontSize: 14 }}>{i.name}</b>
              <div className="meta">{rupees(i.price)}</div>
            </span>
            {qty[i.id] ? (
              <span className="stepper"><button onClick={() => set(i.id, qty[i.id] - 1)} aria-label={`One less ${i.name}`}>−</button>{qty[i.id]}<button onClick={() => set(i.id, qty[i.id] + 1)} aria-label={`One more ${i.name}`}>+</button></span>
            ) : (
              <button className="add" disabled={!i.isAvailable} onClick={() => set(i.id, 1)}>Add</button>
            )}
          </div>
        ))}
      </div>
      <input className="field" style={{ marginTop: 12, padding: 12, fontSize: 14 }} value={note} maxLength={80} onChange={(e) => setNote(e.target.value)} placeholder="Note: less sugar, no onion…" />
      {error && <p className="err">{error}</p>}
      <button className="btn" style={{ marginTop: 12, height: 50 }} disabled={busy || (!count && !team.me?.items.length)} onClick={save}>
        {busy ? 'Saving…' : count ? `Save my items · ${rupees(total)}` : team.me?.items.length ? 'Remove my items' : 'Pick something first'}
      </button>
    </aside>
  );
}

/** Not logged in: the invite, with log in (comes back here) or open in the app. */
function Invite({ code }: { code: string }) {
  return (
    <main className="login-page">
      <div className="card login-card" style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: '#EEF2FF', color: '#3730A3', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>
          <Icon name="team" />
        </div>
        <h1 className="h1">You&apos;re invited to a team order</h1>
        <p className="sub" style={{ marginTop: 8 }}>Add what you want. It all comes in one delivery and you pay only for your items.</p>
        <Link href={`/login?next=${encodeURIComponent(`/team/${code}`)}`} className="btn" style={{ marginTop: 24 }}>Log in to join</Link>
        <a href={`towerbites://team/${code}`} className="btn sec" style={{ marginTop: 10 }}>Open in TowerBites app</a>
        <div style={{ marginTop: 18, fontSize: 13, color: 'var(--sub)' }}>Code <b style={{ letterSpacing: 3, color: 'var(--text)' }}>{code}</b></div>
      </div>
    </main>
  );
}
