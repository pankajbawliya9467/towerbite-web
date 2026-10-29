'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPhone } from '@/lib/format';
import { useSession } from '@/lib/session';
import { ProfileDialog } from './ProfileDialog';
import { usePopover } from './usePopover';

/** Avatar with the profile menu (edit name and desk address, log out), or a Log in link. */
export function AccountMenu() {
  const { ready, profile, logout } = useSession();
  const { open, setOpen, ref } = usePopover();
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  if (!ready) return <div className="avatar" />;
  if (!profile) return <Link href="/login" style={{ fontWeight: 600, color: 'var(--accent)' }}>Log in</Link>;

  return (
    <div className="pop" ref={ref}>
      <button className="avatar" onClick={() => setOpen(!open)} aria-label="Account" aria-expanded={open}>
        {(profile.name || '?').charAt(0).toUpperCase()}
      </button>
      {open && (
        <div className="menu" style={{ right: 0 }}>
          <div style={{ padding: '12px 14px' }}>
            <div className="h3">{profile.name}</div>
            <div className="meta" style={{ marginTop: 2 }}>{formatPhone(profile.phone)}</div>
          </div>
          <div className="divider" style={{ margin: '4px 0' }} />
          <button className="menu-item" onClick={() => { setOpen(false); setEditing(true); }}>Edit profile &amp; desk</button>
          <Link className="menu-item" href="/orders" onClick={() => setOpen(false)}>Your orders</Link>
          <button
            className="menu-item"
            style={{ color: 'var(--red)' }}
            onClick={async () => {
              setOpen(false);
              await logout();
              router.refresh();
            }}
          >
            Log out
          </button>
        </div>
      )}
      {editing && <ProfileDialog onClose={() => setEditing(false)} />}
    </div>
  );
}
