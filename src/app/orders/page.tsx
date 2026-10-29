'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { dayLabel, itemsSummary, rupees } from '@/lib/format';
import { STATUS } from '@/lib/orderStatus';
import type { CafeWithMenu, Order } from '@/lib/types';
import { useRequireLogin } from '@/lib/useRequireLogin';
import { useLive } from '@/lib/live';

export default function OrdersPage() {
  const profile = useRequireLogin();
  const [active, setActive] = useState<Order[] | null>(null);
  const [past, setPast] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const { fill } = useCart();
  const router = useRouter();

  const load = useCallback(() => {
    Promise.all([api<Order[]>('/v1/orders?status=active'), api<Order[]>('/v1/orders?status=past')]).then(
      ([a, p]) => {
        setActive(a);
        setPast(p);
        setError('');
      },
      (e) => setError(e.message),
    );
  }, []);
  useEffect(() => {
    if (profile) load();
  }, [profile, load]);
  // Status changes of any of my orders show up live.
  useLive(profile ? `user:${profile.id}` : null, 'order', load);

  async function reorder(order: Order) {
    setError('');
    try {
      const cafe = await api<CafeWithMenu>(`/v1/cafes/${order.cafe.id}`, { auth: false });
      const items = order.items.flatMap((oi) => {
        const m = cafe.items.find((i) => i.id === oi.menuItemId && i.isAvailable);
        return m ? [{ menuItemId: m.id, name: m.name, price: m.price, qty: oi.qty, isVeg: m.isVeg }] : [];
      });
      if (!items.length) throw new Error('These items are not available right now.');
      const ref = { id: cafe.id, slug: cafe.slug, name: cafe.name, locationSlug: order.location.slug };
      fill(ref, items, () => router.push(`/${ref.locationSlug}/${ref.slug}`));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <TopBar location={profile?.location ?? undefined} cart />
      <main className="narrow" style={{ maxWidth: 1000 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.8 }}>Your orders</h1>
        {error && <p className="err">{error}</p>}
        {active === null ? (
          !error && <p className="sub" style={{ marginTop: 24 }}>Loading…</p>
        ) : !active.length && !past.length ? (
          <div className="card empty" style={{ marginTop: 24 }}>
            <p>No orders yet.</p>
            <Link href="/" className="btn" style={{ width: 220, margin: '20px auto 0' }}>Browse cafes</Link>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div className="grid2" style={{ marginTop: 24 }}>
                {active.map((o) => (
                  <Link key={o.id} href={`/orders/${o.id}`} className="card" style={{ padding: 18, border: '1.5px solid #F8D4BE', display: 'block' }}>
                    <div className="row"><div className="h3">{o.cafe.name}</div><span className={`badge ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span></div>
                    <div style={{ fontSize: 14, color: 'var(--sub)', marginTop: 6 }}>{itemsSummary(o.items, true)}</div>
                    <div className="row" style={{ marginTop: 14 }}><b>{rupees(o.total)}</b><span className="link">Track order</span></div>
                  </Link>
                ))}
              </div>
            )}
            {past.length > 0 && (
              <>
                <div className="cap" style={{ marginTop: 28 }}>Past orders</div>
                <div className="grid2" style={{ marginTop: 12 }}>
                  {past.map((o) => (
                    <div key={o.id} className="card" style={{ padding: 18 }}>
                      <div className="row">
                        <Link href={`/orders/${o.id}`} className="h3">{o.cafe.name}</Link>
                        <span className={`badge ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span>
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--sub)', marginTop: 6 }}>
                        {itemsSummary(o.items)} · {dayLabel(o.createdAt)}
                      </div>
                      <div className="row" style={{ marginTop: 14 }}>
                        <b>{rupees(o.total)}</b>
                        <button className="add" style={{ height: 34 }} onClick={() => reorder(o)}>Reorder</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
