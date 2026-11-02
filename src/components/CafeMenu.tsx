'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CafeWithMenu, LocationDetail } from '@/lib/types';
import { comboCartItem, useCart } from '@/lib/cart';
import { rupees } from '@/lib/format';
import { AddButton } from './AddButton';
import { CartPanel } from './CartPanel';
import { Food, Veg } from './Food';
import { Icon } from './Icon';

const POPULAR = '__popular';
const COMBOS = '__combos';

export function CafeMenu({ cafe, location }: { cafe: CafeWithMenu; location: LocationDetail }) {
  // Main categories are the tabs; sub-categories (Snacks › Burgers) are titled sections inside one.
  const ids = new Set(cafe.categories.map((c) => c.id));
  const mains = cafe.categories
    .filter((c) => !c.parentId || !ids.has(c.parentId))
    .map((m) => {
      const subs = cafe.categories.filter((c) => c.parentId === m.id);
      const inIt = new Set([m.id, ...subs.map((s) => s.id)]);
      return { ...m, subs, count: cafe.items.filter((i) => inIt.has(i.categoryId)).length };
    })
    .filter((m) => m.count);
  const hasPopular = cafe.items.some((i) => i.isPopular) && !mains.some((c) => c.name.toLowerCase() === 'popular');
  const popular = { id: POPULAR, name: 'Popular', sort: -1, subs: [], count: cafe.items.filter((i) => i.isPopular).length };
  const comboTab = cafe.combos?.length ? [{ id: COMBOS, name: 'Combos', sort: -2, subs: [], count: cafe.combos.length }] : [];
  const tabs = [...comboTab, ...(hasPopular ? [popular] : []), ...mains];

  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((c) => c.id === active);
  const isPopular = !!current && (current.id === POPULAR || current.name.toLowerCase() === 'popular');
  const sections = current?.id === COMBOS
    ? []
    : !current
    ? [{ id: 'all', name: null as string | null, items: cafe.items }]
    : isPopular
      ? [{ id: current.id, name: null, items: cafe.items.filter((i) => i.isPopular || i.categoryId === current.id) }]
      : [
          { id: current.id, name: null as string | null, items: cafe.items.filter((i) => i.categoryId === current.id) },
          ...current.subs.map((s) => ({ id: s.id, name: s.name as string | null, items: cafe.items.filter((i) => i.categoryId === s.id) })),
        ].filter((x) => x.items.length);
  const subs = sections.filter((x) => x.name);
  const jump = (id: string) => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {cafe.logoUrl && <img src={cafe.logoUrl} alt="" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', border: '1px solid var(--line)', flex: 'none' }} />}
            <h1>{cafe.name}</h1>
          </div>
          <div style={{ fontSize: 16, color: 'var(--sub)', fontWeight: 600 }}>{[cafe.cuisines, cafe.place].filter(Boolean).join(' · ')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            <span className="rating" style={{ height: 36, padding: '0 12px', borderRadius: 11, fontSize: 14 }}>
              ★ {cafe.rating.toFixed(1)}{cafe.ratingCount ? ` · ${cafe.ratingCount}+ ratings` : ''}
            </span>
            <span className="chip"><Icon name="clock" /> {cafe.etaMin}–{cafe.etaMax} min</span>
            <span className="chip">Free delivery to desk</span>
            <span className="chip">Cash / UPI</span>
            {canOrder && (
              <Link href={`/team/new?cafe=${cafe.id}`} className="chip" style={{ background: '#EEF2FF', color: '#3730A3' }}>
                <Icon name="team" /> Order with your team
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="cafe-cols">
        {tabs.length > 1 && (
          <nav className="cats" aria-label="Menu sections">
            {tabs.map((c) => (
              <div key={c.id} style={{ display: 'contents' }}>
                <button className={c.id === active ? 'on' : undefined} onClick={() => setActive(c.id)}>
                  {c.name}
                  <small>{c.count}</small>
                </button>
                {c.id === active && subs.map((s) => (
                  <button key={s.id} className="sub" onClick={() => jump(s.id)}>
                    ↳ {s.name}
                    <small>{s.items.length}</small>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        )}

        <section className="menu-col">
          <h2 className="h2" style={{ fontSize: 22, marginBottom: 14 }}>{current?.name ?? 'Menu'}</h2>
          {sections.map((sec) => (
          <div key={sec.id} id={`sec-${sec.id}`} className="menu-sec">
          {sec.name && <h3 className="menu-sub">{sec.name} <small>{sec.items.length}</small></h3>}
          <div className="menu-grid">
            {sec.items.map((item) => (
              <div key={item.id} className="dish" style={{ opacity: item.isAvailable ? 1 : 0.6 }}>
                <Food emoji={item.emoji} imageUrl={item.imageUrl} color={cafe.coverColor} size={96} fontSize={44} radius={16} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Veg veg={item.isVeg} />
                    {item.isPopular && <span className="best">BESTSELLER</span>}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>{item.name}</div>
                  {item.description && <div style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 500, marginTop: 2 }}>{item.description}</div>}
                  {item.likePct !== undefined && (
                    <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: item.likePct >= 70 ? 'var(--green)' : 'var(--sub)' }}>👍 {item.likePct}% liked ({item.likeCount})</div>
                  )}
                  <div className="row" style={{ marginTop: 'auto', paddingTop: 10 }}>
                    <b style={{ fontSize: 16 }}>{rupees(item.price)}</b>
                    <AddButton cafe={ref} item={item} disabled={!canOrder} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
          ))}
          {current?.id === COMBOS && (
            <div className="menu-grid">
              {(cafe.combos ?? []).map((x) => (
                <div key={x.id} className="dish combo" style={{ opacity: x.availableNow ? 1 : 0.6 }}>
                  <div className="combo-art" style={{ background: cafe.coverColor }}>
                    {x.imageUrl ? <img src={x.imageUrl} alt="" /> : <span aria-hidden>{x.items.slice(0, 3).map((i) => i.emoji).join(' ')}</span>}
                    {x.mrp > x.price && <span className="combo-save">SAVE {rupees(x.mrp - x.price)}</span>}
                    {x.startTime && x.endTime && <span className="combo-when">{comboTime(x.startTime)}–{comboTime(x.endTime)}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Veg veg={x.isVeg} /><b style={{ fontSize: 16 }}>{x.name}</b></div>
                  <div style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 600 }}>{x.items.map((i) => `${i.qty > 1 ? `${i.qty}× ` : ''}${i.name}`).join(' + ')}</div>
                  {x.description && <div style={{ fontSize: 13, color: 'var(--sub)' }}>{x.description}</div>}
                  <div className="row" style={{ marginTop: 'auto', paddingTop: 8 }}>
                    <span><b style={{ fontSize: 16 }}>{rupees(x.price)}</b>{x.mrp > x.price && <s style={{ color: 'var(--sub)', marginLeft: 6, fontSize: 13 }}>{rupees(x.mrp)}</s>}</span>
                    {x.availableNow
                      ? <AddButton cafe={ref} item={{ ...comboCartItem(x), isAvailable: true }} disabled={!canOrder} />
                      : <span className="chip" style={{ height: 30 }}>{x.items.some((i) => !i.isAvailable) ? 'Sold out' : 'Not now'}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {current?.id !== COMBOS && sections.every((x) => !x.items.length) && <div className="card empty">Nothing here yet.</div>}
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

function comboTime(v: string) {
  const [h, m] = v.split(':').map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
}
