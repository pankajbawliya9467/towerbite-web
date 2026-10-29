'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Icon } from './Icon';

/** Searches cafes and dishes at this location (updates ?search=). */
export function SearchBox({ slug }: { slug: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = params.get('search') ?? '';
  const [value, setValue] = useState(current);

  useEffect(() => {
    if (value.trim() === current) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(pathname === `/${slug}` ? params : undefined);
      if (value.trim()) next.set('search', value.trim());
      else next.delete('search');
      const qs = next.toString();
      router.replace(`/${slug}${qs ? `?${qs}` : ''}`);
    }, 300);
    return () => clearTimeout(t);
  }, [value, current, params, pathname, router, slug]);

  return (
    <label className="search">
      <Icon name="search" style={{ fontSize: 18 }} />
      <input type="search" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search cafes or dishes" />
    </label>
  );
}
