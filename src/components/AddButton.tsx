'use client';

import { useCart, type CartCafe } from '@/lib/cart';
import type { MenuItem } from '@/lib/types';

/** "Add" button that turns into the − n + stepper once the item is in the cart. */
export function AddButton({ cafe, item, disabled }: { cafe: CartCafe; item: MenuItem; disabled?: boolean }) {
  const { qtyOf, add, setQty } = useCart();
  const qty = qtyOf(item.id);
  if (!item.isAvailable) return <button className="add" disabled>Sold out</button>;
  if (qty === 0)
    return (
      <button className="add" disabled={disabled} onClick={() => add(cafe, item)}>
        Add
      </button>
    );
  return (
    <div className="stepper">
      <button aria-label={`Remove one ${item.name}`} onClick={() => setQty(item.id, qty - 1)}>−</button>
      {qty}
      <button aria-label={`Add one ${item.name}`} onClick={() => add(cafe, item)}>+</button>
    </div>
  );
}
