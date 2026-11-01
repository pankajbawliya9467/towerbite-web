import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { NavProgress } from '@/components/NavProgress';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'TowerBites',
  description: "Order from your building's cafes, delivered to your desk.",
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Render per request, so every page gets the CSP nonce from proxy.ts.
  await connection();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
