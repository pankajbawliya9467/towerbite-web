import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { TeamView } from '@/components/TeamView';

export const metadata: Metadata = {
  title: 'Team order · TowerBites',
  description: 'Add your own item to your team order. One delivery, everyone pays their own share.',
  robots: { index: false },
};

/** The link a host shares: the team cart (or the invite, when not logged in). */
export default async function TeamPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = raw.toUpperCase();
  if (!/^[A-Z0-9]{8}$/.test(code)) notFound();
  return (
    <Suspense fallback={null}>
      <TeamView code={code} />
    </Suspense>
  );
}
