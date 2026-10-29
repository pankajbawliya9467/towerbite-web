import { notFound } from 'next/navigation';
import { api, ApiError } from './api';

/** Public API read for server components; a 404 shows the not-found page. */
export async function load<T>(path: string): Promise<T> {
  try {
    return await api<T>(path, { auth: false });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}
