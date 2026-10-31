import Link from 'next/link';
import { shortPlace } from '@/lib/format';
import type { Cafe } from '@/lib/types';

export function cafeStatus(c: Pick<Cafe, 'isOpen' | 'acceptingOrders'>) {
  if (!c.isOpen) return { label: 'Closed', cls: 'no' };
  if (!c.acceptingOrders) return { label: 'Busy', cls: 'warn' };
  return { label: 'Open', cls: 'ok' };
}

export function CafeCard({ cafe, locationSlug }: { cafe: Cafe; locationSlug: string }) {
  const open = cafe.isOpen && cafe.acceptingOrders;
  const status = open ? `Open · ${cafe.etaMin}–${cafe.etaMax} min` : cafe.isOpen ? 'Not taking orders' : 'Closed now';
  return (
    <Link href={`/${locationSlug}/${cafe.slug}`} className={`cafe-card${open ? '' : ' closed'}`}>
      <div className="cover" style={{ background: cafe.coverColor }}>
        {cafe.imageUrl ? <img src={cafe.imageUrl} alt="" /> : <span aria-hidden>{cafe.emoji}</span>}
        <span className="cover-tag"><span className={open ? 'dot' : 'dot off'} />{status}</span>
        <span className="cover-place">{shortPlace(cafe.place)}</span>
      </div>
      <div style={{ padding: 16 }}>
        <div className="row" style={{ gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>{cafe.name}</span>
          <span className="rating">★ {cafe.rating.toFixed(1)}</span>
        </div>
        <div style={{ color: 'var(--sub)', fontSize: 14, fontWeight: 600, marginTop: 4 }}>{cafe.cuisines}</div>
      </div>
    </Link>
  );
}
