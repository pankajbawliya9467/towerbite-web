import Link from 'next/link';
import { shortPlace } from '@/lib/format';
import type { Cafe } from '@/lib/types';

export function cafeStatus(c: Pick<Cafe, 'isOpen' | 'acceptingOrders'>) {
  if (!c.isOpen) return { label: 'Closed', cls: 'no' };
  if (!c.acceptingOrders) return { label: 'Busy', cls: 'warn' };
  return { label: 'Open', cls: 'ok' };
}

export function CafeCard({ cafe, locationSlug }: { cafe: Cafe; locationSlug: string }) {
  const status = cafeStatus(cafe);
  const line = [...cafe.cuisines.split('·').map((s) => s.trim()).slice(0, 2), shortPlace(cafe.place)].join(' · ');
  return (
    <Link href={`/${locationSlug}/${cafe.slug}`} className="card" style={{ overflow: 'hidden', display: 'block' }}>
      <div style={{ height: 150, background: cafe.coverColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
        {cafe.imageUrl ? <img src={cafe.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : cafe.emoji}
      </div>
      <div style={{ padding: 20 }}>
        <div className="row" style={{ gap: 12 }}>
          <div className="h2">{cafe.name}</div>
          <span className={`badge ${status.cls}`}>{status.label}</span>
        </div>
        <div style={{ color: 'var(--sub)', fontSize: 14, marginTop: 6 }}>{line}</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 14, color: 'var(--sub)' }}>
          <b style={{ color: 'var(--text)' }}>★ {cafe.rating.toFixed(1)}</b>
          <span>{cafe.etaMin}–{cafe.etaMax} min</span>
        </div>
      </div>
    </Link>
  );
}
