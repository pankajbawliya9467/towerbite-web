'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { saveLocation } from '@/lib/savedLocation';
import { useSession } from '@/lib/session';
import type { Location } from '@/lib/types';
import { Icon } from './Icon';
import { usePopover } from './usePopover';

/** Top bar location button: switch tech park. */
export function LocationMenu({ name, slug }: { name: string; slug: string }) {
  const { open, setOpen, ref } = usePopover();
  const [locations, setLocations] = useState<Location[] | null>(null);
  const { profile, setProfile } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (open && !locations) api<Location[]>('/v1/locations', { auth: false }).then(setLocations, () => setLocations([]));
  }, [open, locations]);

  async function pick(l: Location) {
    setOpen(false);
    saveLocation(l.slug);
    router.push(`/${l.slug}`);
    if (profile && profile.locationId !== l.id) setProfile(await api('/v1/me', { method: 'PUT', body: { locationId: l.id } }));
  }

  return (
    <div className="pop" ref={ref} style={{ minWidth: 0 }}>
      <button className="loc-btn" onClick={() => setOpen(!open)} aria-expanded={open} style={{ maxWidth: '100%' }}>
        <Icon name="pin" style={{ color: 'var(--accent)', fontSize: 18 }} />
        <span>{name}</span>
        <Icon name="down" style={{ color: 'var(--sub)' }} />
      </button>
      {open && (
        <div className="menu" style={{ left: 0 }}>
          {!locations && <div className="menu-item meta">Loading…</div>}
          {locations?.map((l) => (
            <button key={l.id} className="menu-item" onClick={() => pick(l)}>
              <span>
                <div>{l.name}</div>
                <div className="meta" style={{ marginTop: 2 }}>
                  {l.area} · {l.cafeCount} {l.cafeCount === 1 ? 'cafe' : 'cafes'}
                </div>
              </span>
              {l.slug === slug && <Icon name="check" style={{ color: 'var(--accent)' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
