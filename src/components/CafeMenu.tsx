'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CafeWithMenu, LocationDetail } from '@/lib/types';
import { useCart } from '@/lib/cart';
import { rupees } from '@/lib/format';
import { AddButton } from './AddButton';
import { cafeStatus } from './CafeCard';
import { CartPanel } from './CartPanel';
import { Food, Veg } from './Food';
import { Icon } from './Icon';

export function CafeMenu({ cafe, location }: { cafe: CafeWithMenu; location: LocationDetail }) {
  const categories = cafe.categories.filter((c) =>
    cafe.items.some((i) => i.categoryId === c.id || (c.name.toLowerCase() === 'popular' && i.isPopular)),
  );
  const [active, setActive] = useState(categories[0]?.id);
  const current = categories.find((c) => c.id === active);
  const items = cafe.items.filter(
    (i) => !current || i.categoryId === current.id || (current.name.toLowerCase() === 'popular' && i.isPopular),
  );
  const canOrder = cafe.isOpen && cafe.acceptingOrders;
  const ref = { id: cafe.id, slug: cafe.slug, name: cafe.name, locationSlug: location.slug };
  const { cart, count, total } = useCart();

  return (
    <div className="cafe-layout">
      <main className="cafe-main">
        <nav style={{ fontSize: 14, color: 'var(--sub)', }}>
          <Link href={`/${location.slug}`}>{location.name}</Link> / {cafe.name}
        </nav>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, marginTop: 10 }}>{cafe.name}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', marginTop: 10, fontSize: 15, color: 'var(--sub)' }}>
          <span>
            <b style={{ color: 'var(--text)' }}>★ {cafe.rating.toFixed(1)}</b> ({cafe.ratingCount})
          </span>
          <span>{cafe.etaMin}–{cafe.etaMax} min</span>
          <span>{cafe.place}</span>
          <span>Cash on delivery</span>
          {!canOrder && <span className={`badge ${cafeStatus(cafe).cls}`}>{cafe.isOpen ? 'Not taking orders right now' : 'Closed now'}</span>}
        </div>
        <div className="pills" style={{ marginTop: 28 }}>
          {categories.map((c) => (
            <button key={c.id} className={`pill ${c.id === active ? 'on' : ''}`} onClick={() => setActive(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="menu-grid" style={{ marginTop: 24 }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ padding: 20, display: 'flex', gap: 18, alignItems: 'center', opacity: item.isAvailable ? 1 : 0.6 }}>
              <Food emoji={item.emoji} imageUrl={item.imageUrl} color={cafe.coverColor} size={88} fontSize={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="h3"><Veg veg={item.isVeg} />{item.name}</div>
                <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>{item.description}</div>
                <div className="row" style={{ marginTop: 12 }}>
                  <b>{rupees(item.price)}</b>
                  <AddButton cafe={ref} item={item} disabled={!canOrder} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <CartPanel />
      {cart && (
        <Link href="/checkout" className="cart-bar show-sm">
          <span>{count} {count === 1 ? 'item' : 'items'} · {rupees(total)}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Checkout <Icon name="arrow" /></span>
        </Link>
      )}
    </div>
  );
}
