'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { Order } from '@/lib/types';

const GOOD: [string, string][] = [['hot', 'Arrived hot'], ['on_time', 'On time'], ['tasty', 'Tasty'], ['packing', 'Good packing'], ['value', 'Value for money']];
const BAD: [string, string][] = [['cold', 'Was cold'], ['late', 'Came late'], ['missing', 'Item missing'], ['taste', 'Taste was off'], ['quantity', 'Less quantity']];
const WORDS = ['', 'Bad', 'Not good', 'Okay', 'Good', 'Loved it'];

/** Rate a delivered order: stars, quick tags, thumbs per item, comment. Once per order, within 7 days. */
export function RateCard({ order, onRated }: { order: Order; onRated: (r: { stars: number; tags: string[] }) => void }) {
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const options = stars === 0 ? [] : stars >= 4 ? GOOD : BAD;
  const items = order.items.filter((i) => i.menuItemId);

  async function submit() {
    setBusy(true);
    setErr('');
    try {
      const allowed = new Set(options.map(([k]) => k));
      onRated(await api<{ stars: number; tags: string[] }>(`/v1/orders/${order.id}/rating`, {
        method: 'POST',
        body: { stars, tags: tags.filter((t) => allowed.has(t)), comment: comment.trim(), items: likes },
      }));
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <section className="card" style={{ marginTop: 14, padding: 20 }} aria-label="Rate this order">
      <div className="h3">How was your order from {order.cafe.name}?</div>
      <div className="rate-stars" role="radiogroup" aria-label="Stars" style={{ marginTop: 10 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className={n <= stars ? 'on' : undefined} onClick={() => setStars(n)}>★</button>
        ))}
        <span style={{ alignSelf: 'center', marginLeft: 8, fontWeight: 800, color: '#B45309' }}>{WORDS[stars]}</span>
      </div>
      {stars > 0 && (
        <>
          <div className="cap" style={{ marginTop: 14 }}>{stars >= 4 ? 'What did you like?' : 'What went wrong?'}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {options.map(([k, label]) => (
              <button key={k} type="button" className={`pill${tags.includes(k) ? ' on' : ''}`} aria-pressed={tags.includes(k)}
                onClick={() => setTags((t) => (t.includes(k) ? t.filter((x) => x !== k) : [...t, k]))}>{label}</button>
            ))}
          </div>
          {items.length > 0 && (
            <div style={{ marginTop: 14, border: '1.5px solid var(--line)', borderRadius: 14 }}>
              {items.map((i, n) => {
                const v = likes[i.menuItemId!];
                const set = (liked: boolean) => setLikes((l) => {
                  const next = { ...l };
                  if (next[i.menuItemId!] === liked) delete next[i.menuItemId!];
                  else next[i.menuItemId!] = liked;
                  return next;
                });
                return (
                  <div key={i.id} className="row" style={{ padding: '8px 12px', borderTop: n ? '1px solid var(--line)' : 0, gap: 8 }}>
                    <span style={{ flex: 1, fontWeight: 600 }}>{i.name}</span>
                    <button type="button" className={`pill${v === true ? ' on' : ''}`} aria-pressed={v === true} onClick={() => set(true)} aria-label={`Liked ${i.name}`}>👍</button>
                    <button type="button" className={`pill${v === false ? ' on' : ''}`} aria-pressed={v === false} onClick={() => set(false)} aria-label={`Did not like ${i.name}`}>👎</button>
                  </div>
                );
              })}
            </div>
          )}
          <input className="field" style={{ marginTop: 14 }} value={comment} maxLength={300} placeholder="Anything else? (optional)" onChange={(e) => setComment(e.target.value)} aria-label="Comment" />
          {err && <p className="err">{err}</p>}
          <button type="button" className="btn" style={{ marginTop: 14 }} disabled={busy} onClick={submit}>{busy ? 'Sending…' : 'Submit rating'}</button>
        </>
      )}
    </section>
  );
}
