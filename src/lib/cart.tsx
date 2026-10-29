'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { MenuItem } from './types';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export type CartCafe = { id: string; slug: string; name: string; locationSlug: string };
export type CartItem = { menuItemId: string; name: string; price: number; qty: number; isVeg: boolean };
export type Cart = { cafe: CartCafe; items: CartItem[] };

type Apply = (items: CartItem[]) => CartItem[];
type Pending = { cafe: CartCafe; apply: Apply; after?: () => void };

type CartApi = {
  /** false until the saved cart was read from localStorage */
  ready: boolean;
  cart: Cart | null;
  count: number;
  total: number;
  qtyOf: (menuItemId: string) => number;
  add: (cafe: CartCafe, item: MenuItem) => void;
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
      qtyOf: (id) => items.find((i) => i.menuItemId === id)?.qty ?? 0,
      add: (cafe, item) =>
        change(cafe, (list) =>
          list.some((i) => i.menuItemId === item.id)
            ? list.map((i) => (i.menuItemId === item.id ? { ...i, qty: i.qty + 1 } : i))
            : [...list, { menuItemId: item.id, name: item.name, price: item.price, qty: 1, isVeg: item.isVeg }],
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
