import Link from 'next/link';
import { dayName, rupees, time12, todayIST } from '@/lib/format';
import type { Lunch } from '@/lib/types';
import { Icon } from './Icon';

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

/** Under the hero: "Today's lunch is here" (when a cafe posted lunch) and the Team order entry. */
export function HomeExtras({ lunches }: { lunches: Lunch[] }) {
  const today = todayIST();
  const open = lunches.filter((l) => l.bookable && l.left > 0);
  const day = open.find((l) => l.day === today)?.day ?? open[0]?.day;
  const list = open.filter((l) => l.day === day);
  return (
    <div className="extras">
      {day ? (
        <Link href="/lunch" className="lunch-promo">
          <div className="row">
            <span className="tag"><Icon name="clock" /> Booking closes {time12(list[0].closesAt)}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#bbf7d0' }}>See all →</span>
          </div>
          <div>
            <h3>{day === today ? "Today's lunch is here" : `Book ${dayName(day).toLowerCase()}'s lunch`}</h3>
            <p>{plural(new Set(list.map((l) => l.cafeId)).size, 'cafe')} · from {rupees(Math.min(...list.map((l) => l.price)))} · delivered 12:30–2:00</p>
          </div>
          <div className="mini-row">
            {list.slice(0, 3).map((l) => (
              <div key={l.id} className="mini">
                <div className="tile" style={{ background: l.cafe.coverColor }}><Icon name="plate" /></div>
                <b>{l.name}</b>
                <small>{rupees(l.price)} · {l.left} left</small>
              </div>
            ))}
          </div>
        </Link>
      ) : (
        <Link href="/lunch" className="team-promo" style={{ background: '#ecfdf3', color: '#14532d' }}>
          <span className="ico" style={{ color: '#15803d' }}><Icon name="plate" /></span>
          <span style={{ flex: 1 }}><b>Lunch</b><span style={{ color: '#15803d' }}>Book lunch in advance, hot at your desk</span></span>
          <Icon name="next" />
        </Link>
      )}
      <Link href="/team/new" className="team-promo">
        <span className="ico"><Icon name="team" /></span>
        <span style={{ flex: 1 }}><b>Team order</b><span>One link for the team · one delivery · split the bill</span></span>
        <Icon name="next" />
      </Link>
    </div>
  );
}
