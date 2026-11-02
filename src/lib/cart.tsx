'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CafeWithMenu, Combo, Order } from './types';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export type CartCafe = { id: string; slug: string; name: string; locationSlug: string };
/** `menuItemId` is `combo:<id>` for a combo (with what's inside and what it costs separately). */
export type CartItem = { menuItemId: string; name: string; price: number; qty: number; isVeg: boolean; detail?: string; mrp?: number };
/** Anything that can go in the cart: a menu item or a combo (see comboCartItem). */
export type Addable = { id: string; name: string; price: number; isVeg: boolean; detail?: string; mrp?: number };

export const COMBO_PREFIX = 'combo:';
export const isComboId = (id: string) => id.startsWith(COMBO_PREFIX);
export const comboCartItem = (x: Combo): Addable => ({
  id: `${COMBO_PREFIX}${x.id}`, name: x.name, price: x.price, isVeg: x.isVeg, mrp: x.mrp,
  detail: x.items.map((i) => `${i.qty}× ${i.name}`).join(', '),
});

/** Cart items to order the same again: in-stock items and combos that are on right now. */
export function reorderItems(o: Order, cafe: CafeWithMenu): CartItem[] {
  return o.items.flatMap((oi) => {
    if (oi.comboId) {
      const x = cafe.combos?.find((c) => c.id === oi.comboId && c.availableNow);
      if (!x) return [];
      const a = comboCartItem(x);
      return [{ menuItemId: a.id, name: a.name, price: a.price, isVeg: a.isVeg, detail: a.detail, mrp: a.mrp, qty: oi.qty }];
    }
    const m = cafe.items.find((i) => i.id === oi.menuItemId && i.isAvailable);
    return m ? [{ menuItemId: m.id, name: m.name, price: m.price, qty: oi.qty, isVeg: m.isVeg }] : [];
  });
}
export type Cart = { cafe: CartCafe; items: CartItem[] };

type Apply = (items: CartItem[]) => CartItem[];
type Pending = { cafe: CartCafe; apply: Apply; after?: () => void };

type CartApi = {
  /** false until the saved cart was read from localStorage */
  ready: boolean;
  cart: Cart | null;
  count: number;
  total: number;
  /** saved with combos */
  savings: number;
  qtyOf: (menuItemId: string) => number;
  add: (cafe: CartCafe, item: Addable) => void;
  setQty: (menuItemId: string, qty: number) => void;
  /** Replaces the cart with these items (asks first when the cart has another cafe). */
  fill: (cafe: CartCafe, items: CartItem[], after?: () => void) => void;
  clear: () => void;
};

const KEY = 'tb.cart';
const Ctx = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      if (cart?.items.length) localStorage.setItem(KEY, JSON.stringify(cart));
      else localStorage.removeItem(KEY);
    } catch {}
  }, [cart, loaded]);

  const change = useCallback(
    (cafe: CartCafe, apply: Apply, after?: () => void) => {
      if (cart && cart.items.length && cart.cafe.id !== cafe.id) {
        setPending({ cafe, apply, after });
        return;
      }
      setCart((c) => ({ cafe, items: apply(c?.cafe.id === cafe.id ? c.items : []) }));
      after?.();
    },
    [cart],
  );

  const api = useMemo<CartApi>(() => {
    const items = cart?.items ?? [];
    return {
      ready: loaded,
      cart: items.length ? cart : null,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.price, 0),
      savings: items.reduce((s, i) => s + (i.mrp ? Math.max(0, i.mrp - i.price) * i.qty : 0), 0),
      qtyOf: (id) => items.find((i) => i.menuItemId === id)?.qty ?? 0,
      add: (cafe, item) =>
        change(cafe, (list) =>
          list.some((i) => i.menuItemId === item.id)
            ? list.map((i) => (i.menuItemId === item.id ? { ...i, qty: i.qty + 1 } : i))
            : [...list, { menuItemId: item.id, name: item.name, price: item.price, qty: 1, isVeg: item.isVeg, ...(item.detail ? { detail: item.detail, mrp: item.mrp } : {}) }],
        ),
      setQty: (id, qty) =>
        setCart((c) =>
          c && { ...c, items: qty > 0 ? c.items.map((i) => (i.menuItemId === id ? { ...i, qty } : i)) : c.items.filter((i) => i.menuItemId !== id) },
        ),
      fill: (cafe, list, after) => change(cafe, () => list, after),
      clear: () => setCart(null),
    };
  }, [cart, change, loaded]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {pending && cart && (
        <ConfirmDialog
          title="Replace your cart?"
          text={`Your cart has items from ${cart.cafe.name}. Start a new cart from ${pending.cafe.name}?`}
          confirm="Replace cart"
          onCancel={() => setPending(null)}
          onConfirm={() => {
            setCart({ cafe: pending.cafe, items: pending.apply([]) });
            setPending(null);
            pending.after?.();
          }}
        />
      )}
    </Ctx.Provider>
  );
}

export function useCart(): CartApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart outside CartProvider');
  return ctx;
}
