'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AddressFields } from '@/components/AddressFields';
import { Veg } from '@/components/Food';
import { Icon } from '@/components/Icon';
import { TopBar } from '@/components/TopBar';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { formatPhone, rupees, shortPlace } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { Address, CafeWithMenu, LocationDetail, Order } from '@/lib/types';
import { useRequireLogin } from '@/lib/useRequireLogin';
import { useLive } from '@/lib/live';

export default function CheckoutPage() {
  const { ready, cart, total, clear } = useCart();
  const profile = useRequireLogin(!!cart);
  const { refresh } = useSession();
  const router = useRouter();
  const [cafe, setCafe] = useState<CafeWithMenu | null>(null);
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [address, setAddress] = useState<Address>({ tower: '', floor: '', company: '', desk: '' });
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const cafeId = cart?.cafe.id;
  const locationSlug = cart?.cafe.locationSlug;
  useEffect(() => {
    if (!cafeId || !locationSlug) return;
    api<CafeWithMenu>(`/v1/cafes/${cafeId}`, { auth: false }).then(setCafe, (e) => setError(e.message));
    api<LocationDetail>(`/v1/locations/${locationSlug}`, { auth: false }).then(setLocation, (e) => setError(e.message));
  }, [cafeId, locationSlug]);
  // If the cafe closes or stops taking orders while the user is here, show it straight away.
  useLive(cafe ? `location:${cafe.locationId}` : null, 'cafes', () => {
    if (cafeId) api<CafeWithMenu>(`/v1/cafes/${cafeId}`, { auth: false }).then(setCafe, () => undefined);
  });

  useEffect(() => {
    if (!profile) return;
    setAddress({ tower: profile.tower, floor: profile.floor, company: profile.company, desk: profile.desk });
    setPhone(formatPhone(profile.phone));
  }, [profile]);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!cart || !profile) return;
    setPlacing(true);
    setError('');
    try {
      const order = await api<Order>('/v1/orders', {
        method: 'POST',
        body: {
          cafeId: cart.cafe.id,
          items: cart.items.map((i) => ({ menuItemId: i.menuItemId, qty: i.qty })),
          address: { ...address, desk: address.desk.trim(), company: address.company.trim() },
          name: profile.name,
          phone: phone.replace(/\s/g, ''),
        },
      });
      clear();
      refresh();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError((err as Error).message);
      setPlacing(false);
    }
  }

  if (!ready) return <TopBar title="Checkout" />;

  if (!cart)
    return (
      <>
        <TopBar title="Checkout" />
        <main className="checkout">
          <div className="card empty">
            <div className="h2" style={{ color: 'var(--text)' }}>Your cart is empty</div>
            <p style={{ marginTop: 8 }}>Pick a cafe and add something to your cart.</p>
            <Link href="/" className="btn" style={{ width: 220, margin: '24px auto 0' }}>Browse cafes</Link>
          </div>
        </main>
      </>
    );

  if (!profile) return <TopBar title="Checkout" />;

  // Show the cafe's current prices and stock (the server prices the order the same way).
  const lines = cart.items.map((i) => {
    const m = cafe?.items.find((x) => x.id === i.menuItemId);
    return { ...i, price: m?.price ?? i.price, gone: !!cafe && (!m || !m.isAvailable) };
  });
  const liveTotal = lines.reduce((s, l) => s + (l.gone ? 0 : l.price * l.qty), 0);
  const closed = !!cafe && !(cafe.isOpen && cafe.acceptingOrders);
  const goneNames = lines.filter((l) => l.gone).map((l) => l.name);

  return (
    <>
      <TopBar title="Checkout" />
      <form className="checkout" onSubmit={placeOrder}>
        <div style={{ flex: 1.4, minWidth: 0 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.8 }}>Checkout</h1>
          <section className="card" style={{ padding: 28, marginTop: 24 }}>
            <h2 className="h2">Delivery address</h2>
            <div className="grid2" style={{ marginTop: 20 }}>
              <label>
                <div className="cap">Location</div>
                <input className="field" style={{ marginTop: 8 }} value={location?.name ?? ''} disabled />
              </label>
              <AddressFields value={address} towers={location?.towers.map((t) => t.name) ?? []} onChange={setAddress} />
              <label>
                <div className="cap">Phone</div>
                <input className="field" style={{ marginTop: 8 }} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </label>
            </div>
          </section>
          <section className="card" style={{ padding: 28, marginTop: 20 }}>
            <h2 className="h2">Payment</h2>
            <div className="pay" style={{ marginTop: 18 }}>
              <label className="field" style={{ flex: 1, border: '2px solid var(--accent)', display: 'flex', gap: 14, alignItems: 'center' }}>
                <input type="radio" name="pay" checked readOnly hidden />
                <Icon name="cash" style={{ fontSize: 24, color: 'var(--green)' }} />
                <div>
                  <div className="h3">Cash on delivery</div>
                  <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 2 }}>Cash or UPI at your desk</div>
                </div>
              </label>
              <div className="field" aria-disabled style={{ flex: 1, display: 'flex', gap: 14, alignItems: 'center', opacity: 0.5, cursor: 'not-allowed' }}>
                <Icon name="card" style={{ fontSize: 24 }} />
                <div>
                  <div className="h3">Pay online</div>
                  <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 2 }}>Coming soon</div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="checkout-side">
          <section className="card" style={{ padding: 28 }}>
            <h2 className="h2">Order summary</h2>
            <div style={{ fontSize: 14, color: 'var(--sub)', marginTop: 4 }}>
              {cart.cafe.name}{cafe && ` · ${shortPlace(cafe.place)}`}
            </div>
            {lines.map((i, n) => (
              <div key={i.menuItemId} className="row" style={{ marginTop: n ? 14 : 24, fontSize: 15, gap: 12, opacity: i.gone ? 0.5 : 1 }}>
                <span><Veg veg={i.isVeg} />{i.name} × {i.qty}{i.gone && ' (out of stock)'}</span>
                <b>{rupees(i.price * i.qty)}</b>
              </div>
            ))}
            <div className="divider" style={{ margin: '22px 0' }} />
            <div className="row" style={{ fontSize: 15 }}>
              <span style={{ color: 'var(--sub)' }}>Delivery</span>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>Free</span>
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              <b style={{ fontSize: 20 }}>Total</b>
              <b style={{ fontSize: 20 }}>{rupees(cafe ? liveTotal : total)}</b>
            </div>
            {closed && <p className="err">{cafe!.name} is {cafe!.isOpen ? 'not taking orders' : 'closed'} right now.</p>}
            {!closed && goneNames.length > 0 && <p className="err">Remove {goneNames.join(', ')} from your cart to continue.</p>}
            {error && <p className="err">{error}</p>}
            <button className="btn" style={{ marginTop: 26 }} disabled={placing || closed || goneNames.length > 0}>{placing ? 'Placing order…' : 'Place order'}</button>
            {cafe && (
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--sub)', marginTop: 14 }}>
                Arrives in about {cafe.etaMin}–{cafe.etaMax} min
              </div>
            )}
          </section>
        </div>
      </form>
    </>
  );
}
