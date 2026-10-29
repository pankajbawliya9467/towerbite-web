'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, ApiError } from './api';
import { getToken, logout as authLogout } from './auth';
import type { Profile } from './types';

type Session = {
  /** false until we know whether the user is logged in */
  ready: boolean;
  profile: Profile | null;
  refresh: () => Promise<Profile | null>;
  setProfile: (p: Profile) => void;
  logout: () => Promise<void>;
};

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refresh = useCallback(async () => {
    let p: Profile | null = null;
    if (await getToken()) {
      try {
        p = await api<Profile>('/v1/me');
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) await authLogout();
      }
    }
    setProfile(p);
    setReady(true);
    return p;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await authLogout();
    setProfile(null);
  }, []);

  return <Ctx.Provider value={{ ready, profile, refresh, setProfile, logout }}>{children}</Ctx.Provider>;
}

export function useSession(): Session {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSession outside SessionProvider');
  return ctx;
}
