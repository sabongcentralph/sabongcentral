import { approved, type Listing } from "./db";
import { derbyEnabled } from "./health";

// Today in the Philippines (UTC+8), as YYYY-MM-DD.
export function todayPH(): string {
  return new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10);
}

// Events visible to the public: derbies only while the switch is on, sorted by date.
export async function publicEvents(opts: { includePast?: boolean } = {}): Promise<Listing<"event">[]> {
  const all = await approved("event");
  const today = todayPH();
  return all
    .filter((e) => derbyEnabled() || !e.data.derby)
    .filter((e) => opts.includePast || e.data.date >= today || isOngoing(e))
    .sort((a, b) => a.data.date.localeCompare(b.data.date));
}

// Multi-day events ("Dec 12–13") stay listed until the last day.
function isOngoing(e: Listing<"event">) {
  const m = e.data.days.match(/[–-]\s*(\d{1,2})$/);
  if (!m) return false;
  const end = e.data.date.slice(0, 8) + m[1].padStart(2, "0");
  return end >= todayPH();
}

export const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || "";
export const many = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]).map((x) => x.trim()).filter(Boolean);
export type Search = Record<string, string | string[] | undefined>;

export const matches = (text: string, q: string) => !q || text.toLowerCase().includes(q.toLowerCase());
