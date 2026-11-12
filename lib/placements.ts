import { approved, availOf, byId, db, titleOf, type Listing } from "./db";
import { todayPH } from "./content";

// Placements (Em, 2026-11-12): admin arranges farms on the home page and the top of
// /farms: one Farm Spotlight plus numbered Featured slots. A slot can be marked
// Sponsored (paid, arranged outside the site) with an end date; it drops off after it.

// Market items use the same slots; a Sold or Removed item never stays on top.
type Farm = Listing<"farm">;
type Placeable = Listing<"farm"> | Listing<"good">;
const live = (f: Placeable, today: string) => (!f.data.promoUntil || f.data.promoUntil >= today) &&
  (f.kind !== "good" || ["Available", "Reserved"].includes(availOf((f as Listing<"good">).data)));
export const isPlaced = (f: Placeable, today = todayPH()) => !!f.data.featured && live(f, today);

export function featuredOf<T extends Placeable>(farms: T[], today = todayPH()): T[] {
  return farms.filter((f) => isPlaced(f, today))
    .sort((a, b) => (a.data.featuredRank ?? 999) - (b.data.featuredRank ?? 999) || a.data.name.localeCompare(b.data.name));
}

// Featured items first (in slot order), then everyone else as before.
export function withFeaturedFirst<T extends Placeable>(farms: T[], today = todayPH()): T[] {
  const top = featuredOf(farms, today);
  const ids = new Set(top.map((f) => f.id));
  return [...top, ...farms.filter((f) => !ids.has(f.id))];
}

export function spotlightOf(farms: Farm[], today = todayPH()): Farm | undefined {
  return farms.find((f) => f.data.spotlight && live(f, today)) ?? featuredOf(farms, today)[0] ?? farms.find((f) => f.data.verified) ?? farms[0];
}

export const placementLabel = (f: Placeable) => (f.data.sponsored ? "Sponsored" : "Featured");

export type Slot = { id: number; rank: number; sponsored: boolean; until: string };

// Saves the whole Placements page at once and logs it.
export async function savePlacements(slots: Slot[], spotlightId: number, admin: string) {
  const farms: Placeable[] = [...(await approved("farm")), ...(await approved("good"))];
  const want = new Map(slots.map((s) => [s.id, s]));
  const d = db();
  const stmts = [];
  for (const f of farms) {
    const s = want.get(f.id);
    const cur = f.data;
    const next = {
      ...cur,
      featured: !!s, featuredRank: s ? s.rank : undefined, sponsored: s ? s.sponsored : false,
      promoUntil: s && /^\d{4}-\d\d-\d\d$/.test(s.until) ? s.until : undefined,
      ...(f.kind === "farm" ? { spotlight: f.id === spotlightId } : {}),
    };
    const changed = ["featured", "featuredRank", "sponsored", "promoUntil", "spotlight"].some((k) => (cur as Record<string, unknown>)[k] !== (next as Record<string, unknown>)[k] && !(!(cur as Record<string, unknown>)[k] && !(next as Record<string, unknown>)[k]));
    if (changed) stmts.push(d.prepare(`update listings set data = ?, updated_at = datetime('now') where id = ?`).bind(JSON.stringify(next), f.id));
  }
  const sp = spotlightId ? await byId(spotlightId) : null;
  const summary = `Spotlight: ${sp ? titleOf(sp) : "automatic"}; featured: ${slots.sort((a, b) => a.rank - b.rank).map((s) => { const f = farms.find((x) => x.id === s.id); return f ? `${f.kind === "good" ? "market " : ""}${s.rank}. ${f.data.name}${s.sponsored ? " (sponsored)" : ""}` : ""; }).filter(Boolean).join(", ") || "none"}`;
  stmts.push(d.prepare(`insert into audit_log (admin, action, target, reason) values (?, 'placements updated', 'home page', ?)`).bind(admin, summary.slice(0, 500)));
  await d.batch(stmts);
}
