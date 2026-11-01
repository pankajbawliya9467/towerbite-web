const paths = {
  back: <path d="M15 18l-6-6 6-6" />,
  search: (<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  down: <path d="M6 9l6 6 6-6" />,
  receipt: (<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  pin: (<><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>),
  cash: (<><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></>),
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  bag: (<><path d="M5 8h14l-1 13H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>),
  card: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></>),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  plate: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></>),
  team: (<><circle cx="9" cy="8" r="3.5" /><path d="M2 20c1-3.5 3.8-5 7-5s6 1.5 7 5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .7 3.3 2.3 4 5" /></>),
  share: (<><path d="M12 15V3M7 8l5-5 5 5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></>),
  next: <path d="M9 6l6 6-6 6" />,
  history: (<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></>),
};

export type IconName = keyof typeof paths;

/** Line icons from design/screens.html (`const I`). Size follows font-size. */
export function Icon({ name, style, className }: { name: IconName; style?: React.CSSProperties; className?: string }) {
  return (
    <i className={`ic ${className ?? ''}`} style={style} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    </i>
  );
}
