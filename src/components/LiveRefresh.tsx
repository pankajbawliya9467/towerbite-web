'use client';

import { useRouter } from 'next/navigation';
import { useLive } from '@/lib/live';

/** Re-renders the (server-rendered) page when a cafe in this location opens/closes or its menu changes. */
export function LiveRefresh({ locationId }: { locationId: string }) {
  const router = useRouter();
  useLive(`location:${locationId}`, 'cafes', () => router.refresh());
  return null;
}
