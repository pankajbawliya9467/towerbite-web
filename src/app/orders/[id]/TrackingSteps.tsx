import { time } from '@/lib/format';
import type { Order } from '@/lib/types';

type Step = { title: string; note?: string };

/** Accepted by cafe · Being prepared · On the way · Delivered (mockup screen 7). */
export function TrackingSteps({ order }: { order: Order }) {
  const steps: Step[] = [
    { title: 'Accepted by cafe', note: order.acceptedAt ? time(order.acceptedAt) : `Waiting for ${order.cafe.name}` },
    { title: 'Being prepared', note: order.status === 'preparing' ? 'Your order is being prepared' : undefined },
    { title: 'On the way', note: order.outAt ? `${time(order.outAt)}${order.riderName ? ` · with ${order.riderName}` : ''}` : undefined },
    { title: 'Delivered', note: order.deliveredAt ? time(order.deliveredAt) : undefined },
  ];
  // index of the step in progress; steps before it are done
  const current = order.status === 'delivered' ? 4 : order.status === 'out_for_delivery' ? 2 : order.status === 'preparing' ? 1 : 0;

  return (
    <div className="card" style={{ padding: 22 }}>
      {steps.map((s, i) => {
        const done = i < current;
        const now = i === current;
        const last = i === steps.length - 1;
        return (
          <div key={s.title} style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 14, height: 14, borderRadius: '50%', flex: 'none',
                  ...(done ? { background: 'var(--green)' } : now ? { background: 'var(--accent)', boxShadow: '0 0 0 6px var(--accentSoft)' } : { border: '2px solid var(--line)' }),
                }}
              />
              {!last && <div style={{ width: 2, height: 40, background: done ? 'var(--green)' : 'var(--line)' }} />}
            </div>
            <div style={{ marginTop: -4 }}>
              <div className="h3" style={{ color: done ? undefined : now ? 'var(--accent)' : 'var(--faint)' }}>{s.title}</div>
              {(done || now) && s.note && <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 2 }}>{s.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
