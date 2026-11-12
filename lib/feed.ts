import { availOf, type Listing } from "./db";
import { featuredOf, spotlightOf } from "./placements";
import { todayPH } from "./content";

// Home feed (Em, 2026-11-12): one Facebook-style feed instead of category rows.
// Derbies, seminars, farms, market items, reels, articles and notices are mixed,
// newest first. Admin placements ("Sponsored" first, then "Featured") lead the feed
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
const time = (l: Listing) => Date.parse(l.createdAt.includes("T") ? l.createdAt : l.createdAt.replace(" ", "T") + "Z") || 0;

// Newest day first (real listings before samples). Within one day, kinds take turns
// (derby, farm, market item, article...), so a batch added at once doesn't fill the top.
function mix(list: Listing[]): Listing[] {
  const sorted = [...list].sort((a, b) => Number(a.isSample) - Number(b.isSample) || time(b) - time(a) || b.id - a.id);
  const days = new Map<string, Listing[]>();
  for (const l of sorted) {
    const day = `${l.isSample ? 1 : 0}:${new Date(time(l) + 8 * 3600_000).toISOString().slice(0, 10)}`;
    days.set(day, [...(days.get(day) ?? []), l]);
  }
  const out: Listing[] = [];
  for (const items of days.values()) {
    const byKind = new Map<string, Listing[]>();
    for (const l of items) byKind.set(kindKey(l), [...(byKind.get(kindKey(l)) ?? []), l]);
    const queues = [...byKind.values()];
    while (queues.some((q) => q.length)) for (const q of queues) if (q.length) out.push(q.shift()!);
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

  const rest = mix([...s.events, ...s.farms, ...goods, ...s.reels, ...s.articles, ...s.notices].filter((l) => !promoIds.has(l.id)));

  const out: FeedItem[] = promos.splice(0, PROMO_AT_TOP);
  rest.forEach((l, i) => {
    out.push({ l });
    if ((i + 1) % PROMO_EVERY === 0 && promos.length) out.push(promos.shift()!);
  });
  out.push(...promos);
  return out.slice(0, MAX_POSTS);
}
