'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { rupees } from '@/lib/format';
import { Veg } from './Food';

/** Sticky "Your cart" panel on the cafe page. */
export function CartPanel() {
  const { cart, total } = useCart();
  return (
    <aside className="cart-panel">
      <div className="h2">Your cart</div>
      {cart ? (
        <>
          <div style={{ fontSize: 14, color: 'var(--sub)', marginTop: 4 }}>
            From <Link href={`/${cart.cafe.locationSlug}/${cart.cafe.slug}`}>{cart.cafe.name}</Link>
          </div>
          {cart.items.map((i, n) => (
            <div key={i.menuItemId} className="row" style={{ marginTop: n ? 16 : 28, fontSize: 15, gap: 12 }}>
              <span><Veg veg={i.isVeg} />{i.name} × {i.qty}</span>
              <b>{rupees(i.price * i.qty)}</b>
            </div>
          ))}
          <div className="divider" style={{ margin: '24px 0' }} />
          <div className="row" style={{ fontSize: 15 }}>
            <span style={{ color: 'var(--sub)' }}>Delivery</span>
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>Free</span>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <b style={{ fontSize: 18 }}>Total</b>
            <b style={{ fontSize: 18 }}>{rupees(total)}</b>
          </div>
          <Link href="/checkout" className="btn" style={{ marginTop: 28 }}>Checkout</Link>
        </>
      ) : (
        <p className="sub" style={{ marginTop: 8 }}>Your cart is empty. Add something tasty from the menu.</p>
      )}
    </aside>
  );
}
