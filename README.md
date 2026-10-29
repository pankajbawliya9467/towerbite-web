# TowerBites web

Employee ordering website (Next.js App Router, TypeScript). Browse the cafes of your tech park, order to your desk, pay cash on delivery, track the order live.

## Install

```bash
npm install
```

## Env

Copy `.env.example` to `.env.local`:

| Variable | |
|---|---|
| `NEXT_PUBLIC_API_URL` | TowerBites API, e.g. `http://localhost:4000` |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project (phone OTP login, realtime order updates) |
| `NEXT_PUBLIC_DEV_AUTH` | `true` = dev mode: no Supabase, OTP `123456`, API gets `dev:<phone>` tokens (the API must run with `DEV_AUTH=true`) |

All login code is in `src/lib/auth.ts`.

## Run

```bash
npm run dev     # http://localhost:3000
```

## Build

```bash
npm run build && npm start
```

## Pages

- `/` location picker (or redirect to the saved location)
- `/[location]` cafes, filters (`?tag=`), search (`?search=`), popular items
- `/[location]/[cafe]` menu + cart (one cafe at a time, saved in localStorage)
- `/checkout` desk address + cash on delivery (login required)
- `/login` phone + OTP (+ name for new users)
- `/orders`, `/orders/[id]` order history and live tracking (Supabase broadcast `order:<id>` + 15s polling)

`screenshots/` has renders used to compare against `../design/screen-09/10/11.png`.
