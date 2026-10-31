'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { rupees } from '@/lib/format';
import { useSession } from '@/lib/session';
import { Icon } from './Icon';
import { Veg } from './Food';

/** "Your cart" card beside the menu. */
export function CartPanel() {
  const { cart, count, total, qtyOf, setQty } = useCart();
  const { profile } = useSession();
  return (
    <aside className="cart-panel" aria-label="Your cart">
      <div className="row" style={{ alignItems: 'baseline' }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>Your cart</span>
        {cart && <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sub)' }}>{count} {count === 1 ? 'item' : 'items'}</span>}
      </div>
      {cart ? (
        <>
          <div style={{ fontSize: 14, color: 'var(--sub)', fontWeight: 600, marginTop: 4 }}>
            From <Link href={`/${cart.cafe.locationSlug}/${cart.cafe.slug}`} style={{ color: 'var(--text)', fontWeight: 700 }}>{cart.cafe.name}</Link>
          </div>
          {cart.items.map((i, n) => (
            <div key={i.menuItemId} className="row" style={{ marginTop: n ? 12 : 18, fontSize: 15, gap: 10 }}>
              <span style={{ fontWeight: 600, flex: 1, minWidth: 0 }}><Veg veg={i.isVeg} />{i.name}</span>
              <span className="stepper" style={{ minWidth: 76, height: 32 }}>
                <button aria-label={`Remove one ${i.name}`} onClick={() => setQty(i.menuItemId, qtyOf(i.menuItemId) - 1)} style={{ height: 32 }}>−</button>
                {i.qty}
                <button aria-label={`Add one ${i.name}`} onClick={() => setQty(i.menuItemId, qtyOf(i.menuItemId) + 1)} style={{ height: 32 }}>+</button>
              </span>
              <b style={{ width: 54, textAlign: 'right' }}>{rupees(i.price * i.qty)}</b>
            </div>
          ))}
          <div className="divider" style={{ margin: '18px 0' }} />
          <div className="row" style={{ fontSize: 14, fontWeight: 600, color: '#4a4a4a' }}>
            <span>Delivery to desk</span>
            <span style={{ color: 'var(--green)', fontWeight: 800 }}>FREE</span>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <b style={{ fontSize: 20 }}>Total</b>
            <b style={{ fontSize: 20 }}>{rupees(total)}</b>
          </div>
          <Link href="/checkout" className="btn" style={{ marginTop: 18, height: 54 }}>Checkout <Icon name="arrow" /></Link>
          {profile?.desk && (
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sub)', textAlign: 'center', marginTop: 10 }}>
              Delivered to Desk {profile.desk}{profile.tower ? ` · ${profile.tower}` : ''}
            </div>
          )}
        </>
      ) : (
        <p className="sub" style={{ marginTop: 8 }}>Your cart is empty. Add something tasty from the menu.</p>
      )}
    </aside>
  );
}
