import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }] : []),
  // The Content-Security-Policy (with a per-request nonce) is set in proxy.ts.
];

const nextConfig: NextConfig = {
  devIndicators: false,
  agentRules: false,
  poweredByHeader: false,
  // Cafe pages are prefetched from the cafe cards so they open instantly; keep that copy short-lived so
  // open/closed and stock are fresh (live updates also refresh the page).
  experimental: { staleTimes: { dynamic: 0, static: 30 } },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
