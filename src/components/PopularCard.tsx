'use client';

import type { PopularItem } from '@/lib/types';
import { rupees } from '@/lib/format';
import { AddButton } from './AddButton';
import { Food } from './Food';

export function PopularCard({ item, color, locationSlug, canOrder }: { item: PopularItem; color: string; locationSlug: string; canOrder: boolean }) {
  return (
    <div className="card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
      <Food emoji={item.emoji} imageUrl={item.imageUrl} color={color} size={60} fontSize={30} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="h3">{item.name}</div>
        <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 2 }}>
          {item.cafe.name} · {rupees(item.price)}
        </div>
      </div>
      <AddButton cafe={{ ...item.cafe, locationSlug }} item={item} disabled={!canOrder} />
    </div>
  );
}
