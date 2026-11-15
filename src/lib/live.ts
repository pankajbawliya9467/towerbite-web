'use client';

import { useEffect, useRef } from 'react';
import { getToken } from './auth';

/**
 * Live "something changed" pings from our own API (WebSocket /v1/live), never straight from Supabase or
 * any other service. One shared socket per tab; pages subscribe to topics and re-fetch from the API on a
 * ping. Visitors who are not logged in can still follow their building (`location:`); the API decides
 * who may listen to what. Polling in useLive keeps pages current if the socket is down.
 */
const URL = `${(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '').replace(/^http/, 'ws')}/v1/live`;
const DEV = process.env.NEXT_PUBLIC_DEV_AUTH === 'true';

type Handler = { event: string; cb: () => void };
const handlers = new Map<string, Set<Handler>>();
let ws: WebSocket | null = null;
let ready = false;
let retryMs = 1000;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

const sendSub = (type: 'sub' | 'unsub', topic: string) => ready && ws?.readyState === 1 && ws.send(JSON.stringify({ type, topic }));

async function connect() {
  if (DEV || ws || !handlers.size || typeof window === 'undefined') return;
  const token = await getToken();
  if (ws || !handlers.size) return;
  const sock = new WebSocket(URL);
  ws = sock;
  ready = false;
  sock.onopen = () => sock.send(JSON.stringify(token ? { type: 'auth', token } : { type: 'auth' }));
  sock.onmessage = (e) => {
    let msg: { type?: string; topic?: string; event?: string };
    try {
      msg = JSON.parse(String(e.data));
    } catch {
      return;
    }
    if (msg.type === 'ready') {
      ready = true;
      retryMs = 1000;
      for (const topic of handlers.keys()) sendSub('sub', topic);
      return;
    }
    if (msg.topic) for (const h of handlers.get(msg.topic) ?? []) if (h.event === msg.event) h.cb();
  };
  sock.onclose = () => {
    if (ws !== sock) return;
    ws = null;
    ready = false;
    if (handlers.size && document.visibilityState === 'visible') {
      retryTimer = setTimeout(() => void connect(), retryMs);
      retryMs = Math.min(retryMs * 2, 30_000);
    }
  };
  sock.onerror = () => sock.close();
}

/** Re-opens the socket with the current login (after login / logout). */
export function resetLive() {
  if (retryTimer) clearTimeout(retryTimer);
  const sock = ws;
  ws = null;
  ready = false;
  sock?.close();
  void connect();
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && void connect());
}

/** Calls `cb` on each `event` ping for `topic`. Returns the unsubscribe function. */
export function onLive(topic: string, event: string, cb: () => void): () => void {
  const h = { event, cb };
  let set = handlers.get(topic);
  if (!set) {
    set = new Set();
    handlers.set(topic, set);
    sendSub('sub', topic);
  }
  set.add(h);
  void connect();
  return () => {
    set.delete(h);
    if (!set.size) {
      handlers.delete(topic);
      sendSub('unsub', topic);
    }
    if (!handlers.size && ws) {
      const sock = ws;
      ws = null;
      ready = false;
      sock.close();
    }
  };
}

/**
 * Calls `onChange` straight away when the API pings `topic`, and also every `pollMs` while the tab is
 * visible and when the user comes back to the tab, so updates still arrive if the live connection drops.
 */
export function useLive(topic: string | null, event: string, onChange: () => void, pollMs = 20000) {
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    if (!topic) return;
    const run = () => cb.current();
    const off = onLive(topic, event, run);
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
