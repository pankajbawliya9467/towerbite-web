'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Icon } from '@/components/Icon';
import { TopBar } from '@/components/TopBar';
import { api } from '@/lib/api';
import { floorLabel, rupees, time } from '@/lib/format';
import { isActive } from '@/lib/orderStatus';
import { onBroadcast } from '@/lib/supabase';
import type { Order } from '@/lib/types';
import { useRequireLogin } from '@/lib/useRequireLogin';
import { TrackingSteps } from './TrackingSteps';

const POLL_MS = 15000;

function header(o: Order) {
  switch (o.status) {
    case 'delivered':
      return { title: 'Delivered', sub: `Delivered at ${time(o.deliveredAt ?? o.createdAt)}. Enjoy!`, icon: 'ok' };
    case 'cancelled':
      return { title: 'Order cancelled', sub: 'You cancelled this order.', icon: 'no' };
    case 'rejected':
      return { title: 'Order rejected', sub: o.rejectReason || `${o.cafe.name} could not take this order.`, icon: 'no' };
    case 'preparing':
      return { title: 'Being prepared', sub: 'Arriving at your desk in', icon: 'ok' };
    case 'out_for_delivery':
      return { title: 'On the way', sub: 'Arriving at your desk in', icon: 'ok' };
    default:
      return { title: 'Order placed', sub: 'Arriving at your desk in', icon: 'ok' };
  }
}

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const profile = useRequireLogin();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(() => {
    api<Order>(`/v1/orders/${id}`).then(setOrder, (e) => setError(e.message));
    setNow(Date.now());
  }, [id]);

  const live = !!order && isActive(order.status);
  const finished = !!order && !live;
  useEffect(() => {
    if (!profile) return;
    load();
  }, [profile, load]);
  useEffect(() => {
    if (!profile || finished) return;
    const off = onBroadcast(`order:${id}`, 'status', load);
    const t = setInterval(load, POLL_MS);
    return () => {
      off();
      clearInterval(t);
    };
  }, [profile, id, finished, load]);

  async function cancel() {
    setConfirmCancel(false);
    try {
      setOrder(await api<Order>(`/v1/orders/${id}/cancel`, { method: 'POST' }));
    } catch (e) {
      setError((e as Error).message);
      load();
    }
  }

  if (!order)
    return (
      <>
        <TopBar location={profile?.location ?? undefined} cart />
        <main className="track">{error ? <p className="err">{error}</p> : <p className="sub">Loading…</p>}</main>
      </>
    );

  const h = header(order);
  const minsLeft = Math.max(1, Math.ceil((new Date(order.createdAt).getTime() + order.cafe.etaMax * 60000 - now) / 60000));
  const a = order.address;

  return (
    <>
      <TopBar location={order.location} cart />
      <main className="track">
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 84, height: 84, borderRadius: '50%', margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
              background: h.icon === 'ok' ? 'var(--greenSoft)' : 'var(--redSoft)', color: h.icon === 'ok' ? 'var(--green)' : 'var(--red)',
            }}
          >
            <Icon name={h.icon === 'ok' ? 'check' : 'close'} />
          </div>
          <h1 className="h1" style={{ marginTop: 22 }}>{h.title}</h1>
          <p className="sub" style={{ marginTop: 6 }}>{h.sub}</p>
          {live && (
            <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1.5, color: 'var(--accent)', marginTop: 4 }}>{minsLeft} min</div>
          )}
        </div>
        <div style={{ marginTop: 28 }}>
          {order.status !== 'cancelled' && order.status !== 'rejected' && <TrackingSteps order={order} />}
          <div className="card" style={{ marginTop: 14, padding: '16px 18px' }}>
            <div className="row">
              <span style={{ fontSize: 15 }}>{order.status === 'delivered' ? 'Paid on delivery' : 'Pay on delivery'}</span>
              <b style={{ fontSize: 17 }}>{rupees(order.total)}</b>
            </div>
          </div>
          <div className="card" style={{ marginTop: 14, padding: 18 }}>
            <div className="row">
              <div className="h3">{order.cafe.name}</div>
              <span className="meta">Order #{order.orderNo}</span>
            </div>
            {order.items.map((i) => (
              <div key={i.id} className="row" style={{ marginTop: 10, fontSize: 15 }}>
                <span>{i.name} × {i.qty}</span>
                <span>{rupees(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="divider" style={{ margin: '14px 0' }} />
            <div className="meta" style={{ lineHeight: 1.5 }}>
              {[a.tower, floorLabel(a.floor), a.company].filter(Boolean).join(' · ')}<br />Desk {a.desk}
            </div>
          </div>
          {error && <p className="err">{error}</p>}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <a href={`tel:${order.cafe.phone.replace(/\s/g, '')}`} className="btn sec"><Icon name="phone" />Call cafe</a>
            {order.status === 'placed' && (
              <button className="btn sec" style={{ color: 'var(--red)' }} onClick={() => setConfirmCancel(true)}>Cancel order</button>
            )}
          </div>
          {!live && (
            <Link href="/orders" className="link" style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>All orders</Link>
          )}
        </div>
      </main>
      {confirmCancel && (
        <ConfirmDialog
          title="Cancel this order?"
          text={`${order.cafe.name} hasn't accepted it yet, so you can still cancel.`}
          confirm="Cancel order"
          onCancel={() => setConfirmCancel(false)}
          onConfirm={cancel}
        />
      )}
    </>
  );
}
