import Link from 'next/link';
import { CafeCard } from '@/components/CafeCard';
import { HomeHero } from '@/components/HomeHero';
import { LiveRefresh } from '@/components/LiveRefresh';
import { PopularCard } from '@/components/PopularCard';
import { TopBar } from '@/components/TopBar';
import { load } from '@/lib/server';
import type { Cafe, LocationDetail, PopularItem } from '@/lib/types';

const TAGS = [
  { label: 'All', tag: '' },
  { label: 'Coffee', tag: 'coffee' },
  { label: 'Snacks', tag: 'snacks' },
  { label: 'Meals', tag: 'meals' },
  { label: 'Healthy', tag: 'healthy' },
];

/** Up to 4 popular items, spread across cafes, in the API's order. */
function pickPopular(items: PopularItem[]): PopularItem[] {
  const byCafe = new Map<string, PopularItem[]>();
  for (const i of items) byCafe.set(i.cafe.id, [...(byCafe.get(i.cafe.id) ?? []), i]);
  const picked: PopularItem[] = [];
  for (let round = 0; picked.length < 4 && picked.length < items.length; round++)
    for (const list of byCafe.values()) if (list[round] && picked.length < 4) picked.push(list[round]);
  return picked.sort((a, b) => items.indexOf(a) - items.indexOf(b));
}

type Props = { params: Promise<{ location: string }>; searchParams: Promise<{ tag?: string; search?: string }> };

export default async function LocationHome({ params, searchParams }: Props) {
  const { location: slug } = await params;
  const { tag = '', search = '' } = await searchParams;
  const qs = new URLSearchParams({ ...(tag && { tag }), ...(search && { search }) }).toString();

  const [location, all, filtered, popular] = await Promise.all([
    load<LocationDetail>(`/v1/locations/${slug}`),
    load<Cafe[]>(`/v1/locations/${slug}/cafes`),
    qs ? load<Cafe[]>(`/v1/locations/${slug}/cafes?${qs}`) : null,
    load<PopularItem[]>(`/v1/locations/${slug}/popular`),
  ]);
  const cafes = filtered ?? all;
  const cafeById = new Map(all.map((c) => [c.id, c]));
  const delivering = all.filter((c) => c.isOpen && c.acceptingOrders).length;
  const tagHref = (t: string) => {
    const p = new URLSearchParams({ ...(t && { tag: t }), ...(search && { search }) }).toString();
    return `/${slug}${p ? `?${p}` : ''}`;
  };

  return (
    <>
      <LiveRefresh locationId={location.id} />
      <TopBar location={location} search cart />
      <main className="page">
        <HomeHero slug={slug} name={location.name} delivering={delivering} />
        <div id="cafes" className="section-head" style={{ marginTop: 40, scrollMarginTop: 96 }}>
          <h2>{search ? `Results for “${search}”` : 'Cafes in your building'}</h2>
          <div className="pills">
            {TAGS.map((t) => (
              <Link key={t.label} href={tagHref(t.tag)} className={`pill ${tag === t.tag ? 'on' : ''}`} scroll={false}>
                {t.label}
              </Link>
            ))}
          </div>
        </div>
        {cafes.length ? (
          <div className="cafes" style={{ marginTop: 18 }}>
            {cafes.map((c) => <CafeCard key={c.id} cafe={c} locationSlug={slug} />)}
          </div>
        ) : (
          <div className="card empty" style={{ marginTop: 18 }}>
            {search ? `No cafes or dishes match “${search}”.` : 'No cafes here yet.'}
          </div>
        )}
        {!search && popular.length > 0 && (
          <>
            <div className="section-head" style={{ marginTop: 40 }}><h2>Popular in your building</h2></div>
            <div className="popular" style={{ marginTop: 18 }}>
              {pickPopular(popular).map((item) => {
                const cafe = cafeById.get(item.cafe.id);
                return (
                  <PopularCard
                    key={item.id}
                    item={item}
                    color={cafe?.coverColor ?? 'var(--accentSoft)'}
                    locationSlug={slug}
                    canOrder={!!cafe?.isOpen && !!cafe.acceptingOrders}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>
    </>
  );
}
