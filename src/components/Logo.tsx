/** The pin + cup mark from design/towerbites-icon.svg. `cup` is the colour of the cup inside the pin. */
export function LogoMark({ size, color = 'var(--accent)', cup = '#fff' }: { size: number; color?: string; cup?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ color, flex: 'none' }} aria-hidden>
      <path d="M40 5C24 5 12 17 12 32c0 19 28 43 28 43s28-24 28-43C68 17 56 5 40 5z" fill="currentColor" />
      <path d="M27 27h22v8a11 11 0 0 1-22 0z" fill={cup} />
      <path d="M49 29.5h2.5a4.5 4.5 0 0 1 0 9H49" fill="none" stroke={cup} strokeWidth="3" strokeLinecap="round" />
      <path d="M33 15c-2 2.5 2 4.5 0 7M40 13c-2 2.5 2 4.5 0 7" fill="none" stroke={cup} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span>
      Tower<span style={{ color: 'var(--accent)' }}>Bites</span>
    </span>
  );
}
