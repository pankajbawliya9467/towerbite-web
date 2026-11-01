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
    <>
      <section className="hero-row">
        <div className="hero">
          <div className="hero-text">
            <span className="hero-tag"><span className="dot" />{delivering} {delivering === 1 ? 'cafe' : 'cafes'} delivering now</span>
            <h1 className="hero-title">
              {hello ? `${hello}${first ? `, ${first}` : ''}. ` : ''}
              <em>What&apos;s coming to your desk?</em>
            </h1>
            <p className="hide-sm">Order from cafes in {name}. At your desk in about 15 min.</p>
            <div className="hero-chips show-sm">
              <span>Free delivery</span><span>~15 min</span><span>Cash / UPI</span>
            </div>
          </div>
          <div className="hero-actions hide-sm">
            <a href="#cafes" className="primary">Browse cafes <Icon name="arrow" /></a>
            <Link href="/orders" className="ghost">Track order</Link>
          </div>
        </div>
        <div className="hero-stats hide-sm">
          <span className="stat" style={{ background: 'var(--greenSoft)', color: 'var(--greenText)' }}><b>Free</b><span>delivery to desk</span></span>
          <span className="stat" style={{ background: 'var(--accentSoft)', color: '#9a3412' }}><b>~15 min</b><span>average time</span></span>
          <span className="stat" style={{ background: 'var(--surface)', boxShadow: 'inset 0 0 0 1px var(--line)' }}><b>Cash/UPI</b><span style={{ color: 'var(--sub)' }}>pay on arrival</span></span>
        </div>
      </section>
      {again.length > 0 && (
        <div className="again-row">
          <Icon name="clock" style={{ color: 'var(--accentDark)', fontSize: 18 }} />
          <span className="again-text">
            <b>Order again: </b>
            {again[0].items.map((i) => (i.qty > 1 ? `${i.name} ×${i.qty}` : i.name)).join(', ')}
            <span className="hide-sm" style={{ color: 'var(--sub)' }}> · {again[0].cafe.name} · {rupees(again[0].total)}</span>
          </span>
          <button className="again-btn" onClick={() => reorder(again[0])}>Reorder</button>
        </div>
      )}
      {error && <p className="err">{error}</p>}
    </>
  );
}
