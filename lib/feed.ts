import { availOf, type Listing } from "./db";
import { featuredOf, spotlightOf } from "./placements";
import { todayPH } from "./content";

// Home feed (Em, 2026-11-12): one Facebook-style feed instead of category rows.
// Derbies, seminars, farms, market items, reels, articles and notices are mixed,
// in a new random order on each visit (shuffleMix). Admin placements ("Sponsored" first, then "Featured") lead the feed
// with at most two posts, then one appears after every PROMO_EVERY regular posts.
export const PROMO_EVERY = 6;
const PROMO_AT_TOP = 2;
const MAX_POSTS = 150;

export type Promo = "Sponsored" | "Featured";
export type FeedItem = { l: Listing; promo?: Promo };

type Sources = {
  farms: Listing<"farm">[]; events: Listing<"event">[]; goods: Listing<"good">[];
  reels: Listing<"reel">[]; articles: Listing<"article">[]; notices: Listing<"notice">[];
};

const kindKey = (l: Listing) => (l.kind === "event" ? ((l as Listing<"event">).data.derby ? "derby" : "class") : l.kind);

// Reels and the Home feed come in a different order on every visit (Em, 2026-11-13:
// "like Facebook"), so the same post isn't always first.
export function shuffled<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// The whole Home feed comes in a new order on every visit (Em, 2026-11-13), still
// mixed by kind: each next post is drawn from a kind picked at random, weighted by
// how many of that kind are left, and never the same kind twice in a row when
// another kind is left. Real listings come before samples.
function shuffleMix(list: Listing[]): Listing[] {
  const out: Listing[] = [];
  for (const group of [list.filter((l) => !l.isSample), list.filter((l) => l.isSample)]) {
    const byKind = new Map<string, Listing[]>();
    for (const l of shuffled(group)) byKind.set(kindKey(l), [...(byKind.get(kindKey(l)) ?? []), l]);
    let last = "";
    while (byKind.size) {
      const kinds = [...byKind.keys()].filter((k) => k !== last);
      const pool = kinds.length ? kinds : [...byKind.keys()];
      let r = Math.random() * pool.reduce((n, k) => n + byKind.get(k)!.length, 0);
      const k = pool.find((k) => (r -= byKind.get(k)!.length) < 0) ?? pool[pool.length - 1];
      const q = byKind.get(k)!;
      out.push(q.shift()!);
      if (!q.length) byKind.delete(k);
      last = k;
    }
  }
  return out;
}

export function buildFeed(s: Sources, today = todayPH()): FeedItem[] {
  const goods = s.goods.filter((g) => ["Available", "Reserved"].includes(availOf(g.data)));
  const placed = [...featuredOf(s.farms, today), ...featuredOf(goods, today)];
  // The admin's Farm Spotlight counts as a Featured farm too.
  const spot = s.farms.find((f) => f.data.spotlight) ? spotlightOf(s.farms, today) : undefined;
  if (spot && !placed.some((p) => p.id === spot.id)) placed.push(spot);
  const promos: FeedItem[] = placed
    .map((l) => ({ l: l as Listing, promo: (l.data.sponsored ? "Sponsored" : "Featured") as Promo }))
    .sort((a, b) => Number(b.promo === "Sponsored") - Number(a.promo === "Sponsored") ||
      Number((b.l as Listing<"farm">).data.spotlight ?? 0) - Number((a.l as Listing<"farm">).data.spotlight ?? 0) ||
      ((a.l.data as { featuredRank?: number }).featuredRank ?? 999) - ((b.l.data as { featuredRank?: number }).featuredRank ?? 999));
  const promoIds = new Set(promos.map((p) => p.l.id));

  const rest = shuffleMix([...s.events, ...s.farms, ...goods, ...s.reels, ...s.articles, ...s.notices].filter((l) => !promoIds.has(l.id)));

  const out: FeedItem[] = promos.splice(0, PROMO_AT_TOP);
  rest.forEach((l, i) => {
    out.push({ l });
    if ((i + 1) % PROMO_EVERY === 0 && promos.length) out.push(promos.shift()!);
  });
  out.push(...promos);
  return out.slice(0, MAX_POSTS);
}
