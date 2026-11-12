import { approved, byId, db, titleOf, type Listing } from "./db";
import { todayPH } from "./content";

// Placements (Em, 2026-11-12): admin arranges farms on the home page and the top of
// /farms: one Farm Spotlight plus numbered Featured slots. A slot can be marked
// Sponsored (paid, arranged outside the site) with an end date; it drops off after it.

type Farm = Listing<"farm">;
const live = (f: Farm, today: string) => !f.data.promoUntil || f.data.promoUntil >= today;

export function featuredOf(farms: Farm[], today = todayPH()): Farm[] {
  return farms.filter((f) => f.data.featured && live(f, today))
    .sort((a, b) => (a.data.featuredRank ?? 999) - (b.data.featuredRank ?? 999) || a.data.name.localeCompare(b.data.name));
}

// Featured farms first (in slot order), then everyone else as before.
export function withFeaturedFirst(farms: Farm[], today = todayPH()): Farm[] {
  const top = featuredOf(farms, today);
  const ids = new Set(top.map((f) => f.id));
  return [...top, ...farms.filter((f) => !ids.has(f.id))];
}

export function spotlightOf(farms: Farm[], today = todayPH()): Farm | undefined {
  return farms.find((f) => f.data.spotlight && live(f, today)) ?? featuredOf(farms, today)[0] ?? farms.find((f) => f.data.verified) ?? farms[0];
}

export const placementLabel = (f: Farm) => (f.data.sponsored ? "Sponsored" : "Featured");

export type Slot = { id: number; rank: number; sponsored: boolean; until: string };

// Saves the whole Placements page at once and logs it.
export async function savePlacements(slots: Slot[], spotlightId: number, admin: string) {
  const farms = await approved("farm");
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
      spotlight: f.id === spotlightId,
    };
    const changed = ["featured", "featuredRank", "sponsored", "promoUntil", "spotlight"].some((k) => (cur as Record<string, unknown>)[k] !== (next as Record<string, unknown>)[k] && !(!(cur as Record<string, unknown>)[k] && !(next as Record<string, unknown>)[k]));
    if (changed) stmts.push(d.prepare(`update listings set data = ?, updated_at = datetime('now') where id = ?`).bind(JSON.stringify(next), f.id));
  }
  const sp = spotlightId ? await byId(spotlightId) : null;
  const summary = `Spotlight: ${sp ? titleOf(sp) : "automatic"}; featured: ${slots.sort((a, b) => a.rank - b.rank).map((s) => { const f = farms.find((x) => x.id === s.id); return f ? `${s.rank}. ${f.data.name}${s.sponsored ? " (sponsored)" : ""}` : ""; }).filter(Boolean).join(", ") || "none"}`;
  stmts.push(d.prepare(`insert into audit_log (admin, action, target, reason) values (?, 'placements updated', 'home page', ?)`).bind(admin, summary.slice(0, 500)));
  await d.batch(stmts);
}
