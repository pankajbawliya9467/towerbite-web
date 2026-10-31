'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { greeting, rupees } from '@/lib/format';
import { saveLocation } from '@/lib/savedLocation';
import { useSession } from '@/lib/session';
import type { CafeWithMenu, Order } from '@/lib/types';
import { Icon } from './Icon';

/** Dark hero with the greeting, plus "Order again" (logged in) or how it works (visitors). */
export function HomeHero({ slug, name, delivering }: { slug: string; name: string; delivering: number }) {
  const { profile } = useSession();
  const [hello, setHello] = useState('');
  const [past, setPast] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const { fill } = useCart();
  const router = useRouter();

  useEffect(() => {
    saveLocation(slug);
    setHello(greeting());
  }, [slug]);

  useEffect(() => {
    if (!profile) return;
    api<Order[]>('/v1/orders?status=past').then(setPast, () => setPast([]));
  }, [profile]);

  const again = (past ?? []).filter((o) => o.status === 'delivered').slice(0, 2);
  const first = profile?.name.split(' ')[0];

  async function reorder(order: Order) {
    setError('');
    try {
      const cafe = await api<CafeWithMenu>(`/v1/cafes/${order.cafe.id}`, { auth: false });
      const items = order.items.flatMap((oi) => {
        const m = cafe.items.find((i) => i.id === oi.menuItemId && i.isAvailable);
        return m ? [{ menuItemId: m.id, name: m.name, price: m.price, qty: oi.qty, isVeg: m.isVeg }] : [];
      });
      if (!items.length) throw new Error('These items are not available right now.');
      fill({ id: cafe.id, slug: cafe.slug, name: cafe.name, locationSlug: order.location.slug }, items, () => router.push('/checkout'));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section className="hero-row">
      <div className="hero">
        <span className="hero-tag"><span className="dot" />{delivering} {delivering === 1 ? 'cafe' : 'cafes'} delivering now</span>
        <h1 className="hello" style={{ fontSize: 'clamp(30px, 4vw, 46px)', lineHeight: 1.1 }}>
          {hello ? `${hello}${first ? `, ${first}` : ''}.` : '\u00a0'}
          <em>What's coming to your desk?</em>
        </h1>
        <p>Order from the cafes in {name}. Delivered to your desk in about 15 minutes. Pay cash or UPI when it arrives.</p>
        <div className="hero-actions">
          <a href="#cafes" className="primary">Browse cafes <Icon name="arrow" /></a>
          <Link href="/orders" className="ghost">Track my order</Link>
        </div>
      </div>
      <div className="hero-side">
        {again.length ? (
          <>
            <div className="cap">Order again</div>
            {again.map((o) => (
              <div key={o.id} className="again">
                <span className="food" style={{ width: 52, height: 52, background: o.cafe.coverColor, fontSize: 26, borderRadius: 14 }}>{o.cafe.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {o.items.map((i) => (i.qty > 1 ? `${i.name} ×${i.qty}` : i.name)).join(', ')}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 600 }}>{o.cafe.name} · {rupees(o.total)}</div>
                </div>
                <button className="add" style={{ textTransform: 'none' }} onClick={() => reorder(o)}>Reorder</button>
              </div>
            ))}
            {error && <p className="err" style={{ marginTop: 0 }}>{error}</p>}
          </>
        ) : (
          <>
            <div className="cap">How it works</div>
            {[
              ['1', 'Pick a cafe in your building'],
              ['2', 'Order, and tell us your desk'],
              ['3', 'Pay cash or UPI when it arrives'],
            ].map(([n, t]) => (
              <div key={n} className="again">
                <span style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--accentSoft)', color: '#9a3412', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{t}</span>
              </div>
            ))}
          </>
        )}
        <div className="stat-row">
          <span className="stat" style={{ background: 'var(--greenSoft)', color: 'var(--greenText)' }}><b>FREE</b><span>delivery to desk</span></span>
          <span className="stat" style={{ background: 'var(--accentSoft)', color: '#9a3412' }}><b>~15 min</b><span>average delivery</span></span>
        </div>
      </div>
    </section>
  );
}
