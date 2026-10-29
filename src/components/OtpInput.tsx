'use client';

import { useRef } from 'react';

/** Six single-digit boxes (mockup screen 2 style). Supports typing, backspace and paste. */
export function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  function put(i: number, digits: string) {
    const at = Math.min(i, value.length);
    onChange((value.slice(0, at) + digits + value.slice(at + digits.length)).slice(0, length));
    focus(at + digits.length);
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className="field otp"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          value={value[i] ?? ''}
          autoFocus={i === 0}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, '');
            if (d) put(i, d.slice(-length));
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Backspace') return;
            e.preventDefault();
            const idx = value[i] ? i : i - 1;
            if (idx < 0) return;
            onChange(value.slice(0, idx) + value.slice(idx + 1));
            focus(idx);
          }}
        />
      ))}
    </div>
  );
}
