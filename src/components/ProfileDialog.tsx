'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';
import type { Address, LocationDetail, Profile } from '@/lib/types';
import { AddressFields } from './AddressFields';

export function ProfileDialog({ onClose }: { onClose: () => void }) {
  const { profile, setProfile } = useSession();
  const [name, setName] = useState(profile?.name ?? '');
  const [address, setAddress] = useState<Address>({
    tower: profile?.tower ?? '',
    floor: profile?.floor ?? '',
    company: profile?.company ?? '',
    desk: profile?.desk ?? '',
  });
  const [towers, setTowers] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const slug = profile?.location?.slug;

  useEffect(() => {
    if (slug) api<LocationDetail>(`/v1/locations/${slug}`, { auth: false }).then((l) => setTowers(l.towers.map((t) => t.name)), () => {});
  }, [slug]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      setProfile(await api<Profile>('/v1/me', { method: 'PUT', body: { name: name.trim(), ...address } }));
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form className="card dialog" style={{ maxWidth: 560 }} onSubmit={save} onClick={(e) => e.stopPropagation()}>
        <div className="h2">Your profile</div>
        <p className="sub" style={{ marginTop: 4 }}>
          Your desk address{profile?.location ? ` at ${profile.location.name}` : ''} is used for delivery.
        </p>
        <label style={{ display: 'block', marginTop: 20 }}>
          <div className="cap">Your name</div>
          <input className="field" style={{ marginTop: 8 }} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <div className="grid2" style={{ marginTop: 16 }}>
          <AddressFields value={address} towers={towers} onChange={setAddress} />
        </div>
        {error && <p className="err">{error}</p>}
        <div className="dialog-actions">
          <button type="button" className="btn sec" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
