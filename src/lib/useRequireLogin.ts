'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from './session';

/** Sends logged-out users to /login and back here afterwards. Returns the profile once logged in. */
export function useRequireLogin(required = true) {
  const { ready, profile } = useSession();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (required && ready && !profile) router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [required, ready, profile, router, path]);
  return ready ? profile : null;
}
