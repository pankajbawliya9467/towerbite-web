// Employee login on the website. It only talks to the TowerBites API: the API sends and checks the SMS code
// (whatever SMS service it uses) and gives back our own session token. Nothing here knows about Supabase.
// Dev mode (NEXT_PUBLIC_DEV_AUTH=true): OTP 123456, token `dev:<phone>`, no API call.
const DEV = process.env.NEXT_PUBLIC_DEV_AUTH === 'true';
const DEV_OTP = '123456';
const DEV_KEY = 'tb.devToken';
const SESSION_KEY = 'tb.session';
const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

type Session = { token: string; expiresAt: string };

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' });
  } catch {
    throw new Error(`Can't reach TowerBites right now. Please try again.`);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? 'Something went wrong, please try again');
  return data as T;
}

export async function sendOtp(phone: string): Promise<void> {
  if (DEV) return;
  await post('/v1/auth/otp/send', { phone });
}

export async function verifyOtp(phone: string, code: string): Promise<void> {
  if (DEV) {
    if (code !== DEV_OTP) throw new Error('Wrong code, please try again');
    localStorage.setItem(DEV_KEY, `dev:${phone}`);
    return;
  }
  const s = await post<Session>('/v1/auth/otp/verify', { phone, code });
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token: s.token, expiresAt: s.expiresAt }));
}

export async function getToken(): Promise<string | null> {
  if (DEV) return read(DEV_KEY);
  const raw = read(SESSION_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Session;
    if (new Date(s.expiresAt).getTime() > Date.now()) return s.token;
  } catch {
    /* corrupted: treat as logged out */
  }
  localStorage.removeItem(SESSION_KEY);
  return null;
}

export async function logout(): Promise<void> {
  if (DEV) return void localStorage.removeItem(DEV_KEY);
  const token = await getToken();
  localStorage.removeItem(SESSION_KEY);
  if (token) {
    await fetch(`${API}/v1/auth/session`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).catch(() => undefined);
  }
}
