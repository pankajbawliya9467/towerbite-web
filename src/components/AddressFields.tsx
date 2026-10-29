'use client';

import { FLOORS, floorLabel } from '@/lib/format';
import type { Address } from '@/lib/types';

/** Tower / Floor / Company / Desk fields, shared by checkout and the profile dialog. */
export function AddressFields({ value, towers, onChange }: { value: Address; towers: string[]; onChange: (a: Address) => void }) {
  const set = (k: keyof Address) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value });
  const towerOptions = value.tower && !towers.includes(value.tower) ? [value.tower, ...towers] : towers;
  const floorOptions = value.floor && !FLOORS.includes(value.floor) ? [value.floor, ...FLOORS] : FLOORS;
  return (
    <>
      <label>
        <div className="cap">Tower</div>
        <select className="field" style={{ marginTop: 8 }} value={value.tower} onChange={set('tower')} required>
          <option value="" disabled>Select tower</option>
          {towerOptions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label>
        <div className="cap">Floor</div>
        <select className="field" style={{ marginTop: 8 }} value={value.floor} onChange={set('floor')} required>
          <option value="" disabled>Select floor</option>
          {floorOptions.map((f) => <option key={f} value={f}>{floorLabel(f)}</option>)}
        </select>
      </label>
      <label>
        <div className="cap">Company</div>
        <input className="field" style={{ marginTop: 8 }} value={value.company} onChange={set('company')} placeholder="Company name" />
      </label>
      <label>
        <div className="cap">Desk / cabin</div>
        <input className="field" style={{ marginTop: 8 }} value={value.desk} onChange={set('desk')} placeholder="e.g. 7B-14" required />
      </label>
    </>
  );
}
