'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CafeWithMenu, LocationDetail } from '@/lib/types';
import { useCart } from '@/lib/cart';
import { rupees } from '@/lib/format';
import { AddButton } from './AddButton';
import { CartPanel } from './CartPanel';
import { Food, Veg } from './Food';
import { Icon } from './Icon';

const POPULAR = '__popular';

export function CafeMenu({ cafe, location }: { cafe: CafeWithMenu; location: LocationDetail }) {
  const withItems = cafe.categories.filter((c) => cafe.items.some((i) => i.categoryId === c.id));
  const hasPopular = cafe.items.some((i) => i.isPopular) && !withItems.some((c) => c.name.toLowerCase() === 'popular');
  const tabs = [...(hasPopular ? [{ id: POPULAR, name: 'Popular', sort: -1 }] : []), ...withItems];
  const countOf = (id: string, name: string) =>
    cafe.items.filter((i) => (id === POPULAR || name.toLowerCase() === 'popular' ? i.isPopular || i.categoryId === id : i.categoryId === id)).length;

  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((c) => c.id === active);
  const items = cafe.items.filter(
    (i) => !current || i.categoryId === current.id || ((current.id === POPULAR || current.name.toLowerCase() === 'popular') && i.isPopular),
  );
  const canOrder = cafe.isOpen && cafe.acceptingOrders;
  const ref = { id: cafe.id, slug: cafe.slug, name: cafe.name, locationSlug: location.slug };
  const { cart, count, total } = useCart();

  return (
    <main className="page">
      <nav aria-label="Breadcrumb" style={{ fontSize: 14, fontWeight: 600, color: 'var(--sub)', marginBottom: 14 }}>
        <Link href={`/${location.slug}`}>{location.name}</Link> / <span style={{ color: 'var(--text)', fontWeight: 700 }}>{cafe.name}</span>
      </nav>
      <section className="cafe-banner">
        <div className="cover" style={{ background: cafe.coverColor }}>
          {cafe.imageUrl ? <img src={cafe.imageUrl} alt="" /> : <span aria-hidden>{cafe.emoji}</span>}
        </div>
        <div className="info">
          {canOrder ? (
            <span className="chip ok" style={{ alignSelf: 'flex-start', height: 30, borderRadius: 15 }}><span className="dot" />Open now · Accepting orders</span>
          ) : (
            <span className="chip" style={{ alignSelf: 'flex-start', height: 30, borderRadius: 15, background: 'var(--redSoft)', color: 'var(--red)' }}>
              {cafe.isOpen ? 'Not taking orders right now' : 'Closed now'}
            </span>
          )}
          <h1>{cafe.name}</h1>
          <div style={{ fontSize: 16, color: 'var(--sub)', fontWeight: 600 }}>{[cafe.cuisines, cafe.place].filter(Boolean).join(' · ')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            <span className="rating" style={{ height: 36, padding: '0 12px', borderRadius: 11, fontSize: 14 }}>
              ★ {cafe.rating.toFixed(1)}{cafe.ratingCount ? ` · ${cafe.ratingCount}+ ratings` : ''}
            </span>
            <span className="chip"><Icon name="clock" /> {cafe.etaMin}–{cafe.etaMax} min</span>
            <span className="chip">Free delivery to desk</span>
            <span className="chip">Cash / UPI</span>
          </div>
        </div>
      </section>

      <div className="cafe-cols">
        {tabs.length > 1 && (
          <nav className="cats" aria-label="Menu sections">
            {tabs.map((c) => (
              <button key={c.id} className={c.id === active ? 'on' : undefined} onClick={() => setActive(c.id)}>
                {c.name}
                <small>{countOf(c.id, c.name)}</small>
              </button>
            ))}
          </nav>
        )}

        <section className="menu-col">
          <h2 className="h2" style={{ fontSize: 22, marginBottom: 14 }}>{current?.name ?? 'Menu'}</h2>
          <div className="menu-grid">
            {items.map((item) => (
              <div key={item.id} className="dish" style={{ opacity: item.isAvailable ? 1 : 0.6 }}>
                <Food emoji={item.emoji} imageUrl={item.imageUrl} color={cafe.coverColor} size={96} fontSize={44} radius={16} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Veg veg={item.isVeg} />
                    {item.isPopular && <span className="best">BESTSELLER</span>}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>{item.name}</div>
                  {item.description && <div style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 500, marginTop: 2 }}>{item.description}</div>}
                  <div className="row" style={{ marginTop: 'auto', paddingTop: 10 }}>
                    <b style={{ fontSize: 16 }}>{rupees(item.price)}</b>
                    <AddButton cafe={ref} item={item} disabled={!canOrder} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {items.length === 0 && <div className="card empty">Nothing here yet.</div>}
        </section>

        <CartPanel />
      </div>

      {cart && (
        <Link href="/checkout" className="cart-bar show-sm">
          <span>{count} {count === 1 ? 'item' : 'items'} · {rupees(total)}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>View cart <Icon name="arrow" /></span>
        </Link>
      )}
    </main>
  );
}
