'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { TopBar } from '@/components/TopBar';
import { api } from '@/lib/api';
import { getSavedLocation, saveLocation } from '@/lib/savedLocation';
import { useSession } from '@/lib/session';
import type { Location } from '@/lib/types';

/** Goes to the saved location, otherwise asks "Where do you work?" (mockup screen 3). */
export default function Start() {
  const router = useRouter();
  const { ready, profile, setProfile } = useSession();
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState('');

  const target = getSavedLocation() ?? profile?.location?.slug ?? null;
  useEffect(() => {
    if (!ready) return;
    if (target) router.replace(`/${target}`);
    else api<Location[]>('/v1/locations', { auth: false }).then(setLocations, (e) => setError(e.message));
  }, [ready, target, router]);

  async function confirm() {
    const loc = locations?.find((l) => l.id === picked);
    if (!loc) return;
    saveLocation(loc.slug);
    if (profile) setProfile(await api('/v1/me', { method: 'PUT', body: { locationId: loc.id } }));
    router.push(`/${loc.slug}`);
  }

  const q = query.trim().toLowerCase();
  const shown = (locations ?? []).filter((l) => !q || `${l.name} ${l.area} ${l.city}`.toLowerCase().includes(q));
  const cities = [...new Set(shown.map((l) => l.city))];

  return (
    <>
      <TopBar />
      <main style={{ maxWidth: 520, margin: '0 auto', padding: '56px 16px' }}>
        {locations && (
          <>
            <h1 className="h1">Where do you work?</h1>
            <p className="sub" style={{ marginTop: 8 }}>Pick your office building or tech park.</p>
            <label className="field" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--faint)' }}>
              <Icon name="search" style={{ fontSize: 20 }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search buildings"
                style={{ border: 0, outline: 0, flex: 1, fontSize: 16, lineHeight: '19px', background: 'none' }}
              />
            </label>
            {cities.map((city) => (
              <section key={city}>
                <div className="cap" style={{ marginTop: 32 }}>{city}</div>
                <div className="card" style={{ marginTop: 12, padding: '6px 18px' }}>
                  {shown.filter((l) => l.city === city).map((l, i) => (
                    <div key={l.id}>
                      {i > 0 && <div className="divider" />}
                      <button className="row" style={{ padding: '16px 0', width: '100%', textAlign: 'left' }} onClick={() => setPicked(l.id)} aria-pressed={picked === l.id}>
                        <div>
                          <div className="h3">{l.name}</div>
                          <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 3 }}>{l.area} · {l.cafeCount} {l.cafeCount === 1 ? 'cafe' : 'cafes'}</div>
                        </div>
                        {picked === l.id ? (
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                            <Icon name="check" />
                          </div>
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--line)' }} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
            {!shown.length && <p className="sub" style={{ marginTop: 24 }}>No buildings match “{query}”.</p>}
            <button className="btn" style={{ marginTop: 28 }} disabled={!picked} onClick={confirm}>Confirm location</button>
          </>
        )}
        {error && <p className="err">{error}</p>}
      </main>
    </>
  );
}
