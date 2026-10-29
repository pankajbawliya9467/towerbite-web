import { supabase } from './supabase';

/** Dev mode: no Supabase, OTP 123456, the API accepts `dev:<phone>` tokens. */
const DEV = process.env.NEXT_PUBLIC_DEV_AUTH === 'true';
const DEV_OTP = '123456';
const DEV_KEY = 'tb.devToken';

function client() {
  const sb = supabase();
  if (!sb) throw new Error('Login is not configured (Supabase URL/key missing)');
  return sb;
}

export async function sendOtp(phone: string): Promise<void> {
  if (DEV) return;
  const { error } = await client().auth.signInWithOtp({ phone });
  if (error) throw new Error(error.message);
}

export async function verifyOtp(phone: string, code: string): Promise<void> {
  if (DEV) {
    if (code !== DEV_OTP) throw new Error('Wrong code, please try again');
    localStorage.setItem(DEV_KEY, `dev:${phone}`);
    return;
  }
  const { error } = await client().auth.verifyOtp({ phone, token: code, type: 'sms' });
  if (error) throw new Error(error.message);
}

export async function getToken(): Promise<string | null> {
  if (DEV) {
    try {
      return localStorage.getItem(DEV_KEY);
    } catch {
      return null;
    }
  }
  const sb = supabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function logout(): Promise<void> {
  if (DEV) {
    localStorage.removeItem(DEV_KEY);
    return;
  }
  await supabase()?.auth.signOut();
}
