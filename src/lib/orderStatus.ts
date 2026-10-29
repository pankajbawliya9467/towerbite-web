import type { OrderStatus } from './types';

export const STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  placed: { label: 'Waiting for cafe', cls: 'warn' },
  preparing: { label: 'Being prepared', cls: 'acc' },
  out_for_delivery: { label: 'On the way', cls: 'acc' },
  delivered: { label: 'Delivered', cls: 'ok' },
  cancelled: { label: 'Cancelled', cls: 'no' },
  rejected: { label: 'Rejected', cls: 'no' },
};

export const isActive = (s: OrderStatus) => s === 'placed' || s === 'preparing' || s === 'out_for_delivery';
