'use client';

import { useEffect, useRef } from 'react';
import { onBroadcast } from './supabase';

/**
 * Calls `onChange` straight away when the backend pings `topic` (private Supabase channel), and also
 * every `pollMs` while the tab is visible and when the user comes back to the tab, so updates still
 * arrive if the live connection drops or the visitor is not logged in.
 */
export function useLive(topic: string | null, event: string, onChange: () => void, pollMs = 20000) {
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    if (!topic) return;
    const run = () => cb.current();
    const off = onBroadcast(topic, event, run);
    const timer = setInterval(() => document.visibilityState === 'visible' && run(), pollMs);
    const onVisible = () => document.visibilityState === 'visible' && run();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      off();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [topic, event, pollMs]);
}
