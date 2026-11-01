'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { Icon } from '@/components/Icon';
import { ProfileDialog } from '@/components/ProfileDialog';
import { api } from '@/lib/api';
import { dayName, floorLabel, rupees, slotLabel, time12, todayIST } from '@/lib/format';
import { getSavedLocation } from '@/lib/savedLocation';
import { useSession } from '@/lib/session';
import type { LocationDetail, Lunch, LunchBooking } from '@/lib/types';

/** Lunch: cafes post a lunch for a day; employees book plates in advance. */
export default function LunchPage() {
  const { ready, profile } = useSession();
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [lunches, setLunches] = useState<Lunch[] | null>(null);
  const [mine, setMine] = useState<LunchBooking[]>([]);
  const [day, setDay] = useState<string | null>(null);
  const [booking, setBooking] = useState<Lunch | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    const s = profile?.location?.slug ?? getSavedLocation();
    if (!s) router.replace('/');
    else setSlug(s);
  }, [ready, profile, router]);

  const load = useCallback(() => {
    if (!slug) return;
    api<Lunch[]>(`/v1/locations/${slug}/lunch`, { auth: false }).then(setLunches, (e) => setError(e.message));
    if (profile) api<LunchBooking[]>('/v1/lunch/bookings').then(setMine, () => undefined);
  }, [slug, profile]);
  useEffect(load, [load]);
  useEffect(() => {
    if (slug) api<LocationDetail>(`/v1/locations/${slug}`, { auth: false }).then(setLocation, () => undefined);
  }, [slug]);
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === 'visible' && load(), 30000);
    return () => clearInterval(t);
  }, [load]);

  const days = useMemo(() => [...new Set((lunches ?? []).map((l) => l.day))].sort(), [lunches]);
  useEffect(() => {
    if (days.length && (!day || !days.includes(day))) setDay(days[0]);
  }, [days, day]);
  const list = (lunches ?? []).filter((l) => l.day === day);
  const upcoming = mine.filter((b) => b.day >= todayIST() && (b.status === 'booked' || b.status === 'out'));
  const booked = new Set(upcoming.map((b) => b.lunchId));
  const closes = list.find((l) => l.bookable)?.closesAt;

  async function cancel(b: LunchBooking) {
    if (!confirm(`Cancel ${b.lunch.name} for ${dayName(b.day).toLowerCase()}?`)) return;
    try {
      await api(`/v1/lunch/bookings/${b.id}/cancel`, { method: 'POST' });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <TopBar location={location ?? undefined} cart />
      <main className="page" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>Lunch</h1>
          <p className="sub">Book ahead, get it hot at your desk. Cash or UPI on delivery.</p>
        </div>

        {upcoming.length > 0 && (
          <div className="my-lunches">
            {upcoming.map((b) => (
              <div key={b.id} className="my-lunch">
                <span className="ok-dot"><Icon name={b.status === 'out' ? 'arrow' : 'check'} /></span>
                <span style={{ minWidth: 0 }}>
                  <b>{dayName(b.day)}: {b.lunch.name} × {b.qty}</b>
                  <small>{b.status === 'out' ? 'On the way to your desk' : `${slotLabel(b.slot)} · ${b.cafe.name}`}</small>
                </span>
                {b.canCancel && <button onClick={() => cancel(b)}>Cancel</button>}
              </div>
            ))}
          </div>
        )}

        {days.length > 0 && (
          <div className="day-tabs" role="tablist">
            {days.map((d) => (
              <button key={d} role="tab" aria-selected={d === day} className={`day-tab ${d === day ? 'on' : ''}`} onClick={() => setDay(d)}>
                <b>{d === todayIST() || dayName(d) === 'Tomorrow' ? dayName(d) : new Date(`${d}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' })}</b>
                <span>{new Date(`${d}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })}</span>
              </button>
            ))}
          </div>
        )}
        {closes && day && <div className="notice"><Icon name="clock" /> Book by {time12(closes)}{day === todayIST() ? ' today' : ` on ${dayName(day, true)}`}. Delivered between 12:30 and 2 PM.</div>}
        {error && <p className="err">{error}</p>}

        {!lunches && !error && (
          <div className="lunch-grid">{[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 170 }} />)}</div>
        )}
        {lunches && !lunches.length && (
          <div className="card empty">
            <div style={{ fontSize: 40, color: 'var(--accentDark)' }}><Icon name="plate" /></div>
            <p style={{ fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>No lunch posted yet</p>
            <p>Cafes in your building post lunch here. Check back in the morning.</p>
          </div>
        )}
        <div className="lunch-grid">
          {list.map((l) => {
            const sold = l.left === 0;
            const few = l.left > 0 && l.left <= 5;
            const color = sold ? '#78716c' : few ? 'var(--amber)' : 'var(--green)';
            return (
              <div key={l.id} className={`lunch-card ${sold || !l.bookable ? 'off' : ''}`}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span className="tile" style={{ background: l.cafe.coverColor }}><Icon name="plate" /></span>
                  <div style={{ minWidth: 0 }}>
                    <div className="meta" style={{ fontWeight: 700 }}><span className={`veg ${l.isVeg ? '' : 'nv'}`} />{l.cafe.name}</div>
                    <div className="h3" style={{ marginTop: 2 }}>{l.name}</div>
                    {l.items && <div className="meta" style={{ marginTop: 3 }}>{l.items.split(',').map((s) => s.trim()).filter(Boolean).join(' · ')}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <b style={{ fontSize: 16 }}>{rupees(l.price)}</b>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 4 }}>
                      {sold ? 'Sold out' : few ? `Only ${l.left} plates left` : `${l.left} of ${l.plates} plates left`}
                    </div>
                    <div className="bar"><div style={{ width: `${(l.left / l.plates) * 100}%`, background: color }} /></div>
                  </div>
                  {booked.has(l.id) ? (
                    <span className="book-btn done" style={{ display: 'inline-flex', alignItems: 'center' }}>Booked</span>
                  ) : (
                    <button className="book-btn" disabled={sold || !l.bookable}
                      onClick={() => (profile ? setBooking(l) : router.push('/login?next=/lunch'))}>
                      {!l.bookable ? 'Closed' : sold ? 'Sold out' : 'Book'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {upcoming.length === 0 && profile && lunches && lunches.length > 0 && (
          <p className="meta">Your bookings show at the top of this page. <Link className="link" href="/orders">Your orders →</Link></p>
        )}
      </main>
      {booking && <BookDialog lunch={booking} onClose={() => setBooking(null)} onBooked={() => (setBooking(null), load())} />}
    </>
  );
}

function BookDialog({ lunch, onClose, onBooked }: { lunch: Lunch; onClose: () => void; onBooked: () => void }) {
  const { profile } = useSession();
  const [slot, setSlot] = useState(lunch.slots[Math.min(1, lunch.slots.length - 1)]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editAddress, setEditAddress] = useState(false);
  const [done, setDone] = useState<LunchBooking | null>(null);
  const hasDesk = !!(profile?.tower && profile.floor && profile.desk);
  const max = Math.min(3, lunch.left);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function book() {
    if (!profile) return;
    if (!hasDesk) return setEditAddress(true);
    setBusy(true);
    setError('');
    try {
      const b = await api<LunchBooking>('/v1/lunch/bookings', {
        method: 'POST',
        body: { lunchId: lunch.id, slot, qty, note: note.trim() || undefined, address: { tower: profile.tower, floor: profile.floor, company: profile.company, desk: profile.desk } },
      });
      setDone(b);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && (done ? onBooked() : onClose())}>
      <div className="card dialog" role="dialog" aria-label={`Book ${lunch.name}`}>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: 30, background: 'var(--greenSoft)', color: 'var(--green)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}><Icon name="check" /></div>
            <h2 className="h2" style={{ marginTop: 14 }}>Lunch booked</h2>
            <p className="sub" style={{ marginTop: 6 }}>{done.lunch.name} × {done.qty} · {dayName(done.day, true)} · {slotLabel(done.slot)}</p>
            <p className="meta" style={{ marginTop: 6 }}>Pay {rupees(done.total)} cash or UPI at your desk. Free cancel till {time12(done.cancelUntil)}.</p>
            <button className="btn" style={{ marginTop: 22 }} onClick={onBooked}>Done</button>
          </div>
        ) : (
          <>
            <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div className="meta" style={{ fontWeight: 700 }}>{lunch.cafe.name} · {dayName(lunch.day, true)}</div>
                <h2 className="h2" style={{ marginTop: 2 }}><span className={`veg ${lunch.isVeg ? '' : 'nv'}`} />{lunch.name}</h2>
              </div>
              <b style={{ fontSize: 18 }}>{rupees(lunch.price)}</b>
            </div>
            <div className="form-stack" style={{ marginTop: 20 }}>
              <div>
                <div className="cap">Delivery time</div>
                <div className="choice-row">
                  {lunch.slots.map((s) => (
                    <button key={s} type="button" className={`choice ${s === slot ? 'on' : ''}`} onClick={() => setSlot(s)} aria-pressed={s === slot}>{slotLabel(s)}</button>
                  ))}
                </div>
              </div>
              <div className="row">
                <div><b>Plates</b><div className="meta">{lunch.left} left</div></div>
                <span className="stepper">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="One less">−</button>{qty}
                  <button onClick={() => setQty(Math.min(max, qty + 1))} aria-label="One more">+</button>
                </span>
              </div>
              <div className="row" style={{ padding: 12, borderRadius: 12, background: 'var(--bg)' }}>
                <div style={{ minWidth: 0 }}>
                  <b>{hasDesk ? `Desk ${profile!.desk}` : 'Add your desk address'}</b>
                  <div className="meta">{hasDesk ? [profile!.tower, floorLabel(profile!.floor), profile!.company].filter(Boolean).join(' · ') : 'Tower, floor and desk number'}</div>
                </div>
                <button className="link" onClick={() => setEditAddress(true)}>{hasDesk ? 'Change' : 'Add'}</button>
              </div>
              <input className="field" value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} placeholder="Note for the cafe (less spicy, no onion…)" />
            </div>
            {error && <p className="err">{error}</p>}
            <div className="dialog-actions">
              <button className="btn sec" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
              <button className="btn" style={{ flex: 2 }} onClick={book} disabled={busy}>{busy ? 'Booking…' : `${rupees(lunch.price * qty)} · Book lunch`}</button>
            </div>
            <p className="meta" style={{ textAlign: 'center', marginTop: 10 }}>Free cancel till {time12(lunch.cancelUntil)} on {dayName(lunch.day).toLowerCase()}</p>
          </>
        )}
      </div>
      {editAddress && <ProfileDialog onClose={() => setEditAddress(false)} />}
    </div>
  );
}
