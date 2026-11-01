export const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/** "+919876541207" -> "+91 98765 41207" */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const m = phone.replace(/\s/g, '').match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : phone;
}

/** "Tower B, Ground floor" -> "Tower B" */
export const shortPlace = (place: string) => place.split(',')[0].trim();

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/** Floor values are stored as numbers ("0" = ground). */
export const FLOORS = Array.from({ length: 41 }, (_, i) => String(i));
export const floorLabel = (floor: string) =>
  floor === '0' ? 'Ground floor' : /^\d+$/.test(floor) ? `${ordinal(Number(floor))} floor` : floor;

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export const time = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();

/** "Today", "Yesterday", weekday within a week, else "12 Oct" */
export function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((start(now) - start(d)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** Active orders show quantities ("2 Masala Chai, 1 Samosa"), past orders just names, as in the mockups. */
export const itemsSummary = (items: { name: string; qty: number }[], withQty = false) =>
  items.map((i) => (withQty ? `${i.qty} ${i.name}` : i.name)).join(', ');

/** "13:30" → "1:30 PM" */
export function time12(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
/** "12:30-13:00" → "12:30–1:00 PM" */
export function slotLabel(slot: string) {
  const [a, b] = slot.split('-');
  return `${time12(a).replace(/ [AP]M$/, '')}–${time12(b)}`;
}
export const todayIST = () => new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
export const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86400_000).toISOString().slice(0, 10);
/** "Today", "Tomorrow" or "Mon, 3 Nov". */
export function dayName(d: string, long = false) {
  const t = todayIST();
  if (d === t) return 'Today';
  if (d === addDays(t, 1)) return 'Tomorrow';
  return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: long ? 'long' : 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}
export const minutesUntil = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 60000));
