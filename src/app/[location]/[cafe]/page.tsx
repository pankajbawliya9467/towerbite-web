import { TopBar } from '@/components/TopBar';
import { CafeMenu } from '@/components/CafeMenu';
import { LiveRefresh } from '@/components/LiveRefresh';
import { load } from '@/lib/server';
import type { CafeWithMenu, LocationDetail } from '@/lib/types';

type Props = { params: Promise<{ location: string; cafe: string }> };

export default async function CafePage({ params }: Props) {
  const { location: slug, cafe: cafeSlug } = await params;
  const [location, cafe] = await Promise.all([
    load<LocationDetail>(`/v1/locations/${slug}`),
    load<CafeWithMenu>(`/v1/locations/${slug}/cafes/${cafeSlug}`),
  ]);
  return (
    <>
      <LiveRefresh locationId={location.id} />
      <TopBar location={location} />
      <CafeMenu cafe={cafe} location={location} />
    </>
  );
}
