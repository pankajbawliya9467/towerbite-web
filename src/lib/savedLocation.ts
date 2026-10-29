const KEY = 'tb.location';

export function getSavedLocation(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveLocation(slug: string) {
  try {
    localStorage.setItem(KEY, slug);
  } catch {}
}
