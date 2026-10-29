'use client';

import { useEffect, useState } from 'react';
import { greeting } from '@/lib/format';
import { saveLocation } from '@/lib/savedLocation';
import { useSession } from '@/lib/session';

/** "Good morning, Rahul" (local time of day) and remembers this location for next visit. */
export function HomeHeader({ slug, name, delivering }: { slug: string; name: string; delivering: number }) {
  const { profile } = useSession();
  const [hello, setHello] = useState('');
  useEffect(() => {
    saveLocation(slug);
    setHello(greeting());
  }, [slug]);
  const first = profile?.name.split(' ')[0];
  return (
    <>
      <h1 className="hello">
        {hello && `${hello}${first ? `, ${first}` : ''}`}
      </h1>
      <div className="sub" style={{ fontSize: 17, marginTop: 8 }}>
        {delivering} {delivering === 1 ? 'cafe' : 'cafes'} in {name} {delivering === 1 ? 'is' : 'are'} delivering to your desk.
      </div>
    </>
  );
}
