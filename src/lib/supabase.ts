import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/** The Supabase client, or null when the project URL/key are not set. */
export function supabase(): SupabaseClient | null {
  if (!url || !key) return null;
  client ??= createClient(url, key);
  return client;
}

/**
 * Listens to a private broadcast channel (e.g. `order:<id>`) with the logged-in user's token;
 * the database only lets the order's owner join. Returns the unsubscribe function.
 */
export function onBroadcast(topic: string, event: string, cb: () => void): () => void {
  const sb = supabase();
  if (!sb) return () => {};
  let channel: ReturnType<SupabaseClient['channel']> | null = null;
  let closed = false;
  (async () => {
    const { data } = await sb.auth.getSession();
    if (closed || !data.session) return; // not logged in: polling still works
    await sb.realtime.setAuth();
    channel = sb.channel(topic, { config: { private: true } }).on('broadcast', { event }, cb).subscribe();
  })();
  return () => {
    closed = true;
    if (channel) sb.removeChannel(channel);
  };
}
