import { db, ensureDb, titleOf, type Kind, type Listing } from "./db";

// Site stats (Em, 2026-11-14): how many people visit each week, which pages and
// which listings get views. Privacy-light, like Plausible / Cloudflare Web Analytics:
// - no cookies, no accounts, no IP addresses saved;
// - a visitor is a short hash of (IP + browser + a random weekly key). The key is
//   deleted when the week ends, so last week's hashes can't be traced back to anyone;
// - bots are skipped (the counter runs in the browser, and known bot browsers are ignored);
// - Em's own visits are skipped while she is signed in to Admin.
// Raw rows are kept KEEP_DAYS; per-listing totals are kept for good (future "stats" perk for paid tiers).

const KEEP_DAYS = 180;

const SCHEMA = [
  `create table if not exists page_views (
    id integer primary key autoincrement,
    day text not null,
    path text not null,
    listing_id integer,
    visitor text not null,
    ref text,
    device text,
    country text
  )`,
  `create index if not exists page_views_day on page_views (day)`,
  `create index if not exists page_views_listing on page_views (listing_id, day)`,
  `create table if not exists stats_salt (week text primary key, salt text not null)`,
  `create table if not exists listing_views (listing_id integer primary key, views integer not null default 0)`,
];

let ready: Promise<void> | null = null;
export function ensureStats(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await ensureDb();
      const d = db();
      await d.batch(SCHEMA.map((s) => d.prepare(s)));
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

// Dates in Philippine time (UTC+8, no daylight saving).
const MANILA = 8 * 3600_000;
export const manilaDay = (t = Date.now()) => new Date(t + MANILA).toISOString().slice(0, 10);
const addDays = (day: string, n: number) => new Date(Date.parse(day + "T00:00:00Z") + n * 86400_000).toISOString().slice(0, 10);
// Monday of the week that holds `day`.
export const weekOf = (day: string) => addDays(day, -((new Date(day + "T00:00:00Z").getUTCDay() + 6) % 7));

const BOT = /bot|crawl|spider|slurp|scrape|facebookexternalhit|meta-external|whatsapp|telegram|preview|headless|phantom|python|curl|wget|httpclient|okhttp|axios|node-fetch|go-http|java\/|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|check/i;
export const isBotAgent = (ua: string) => !ua || BOT.test(ua);

// Pages that show one listing: /farms/<slug>, /events/<slug>, ...
const SECTIONS: Record<string, Kind> = {
  farms: "farm", events: "event", education: "event", market: "good", goods: "good",
  reels: "reel", learn: "article", venues: "venue",
};

export function deviceOf(ua: string): string {
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  return /Mobi|Android|iPhone|iPod/i.test(ua) ? "Phone" : "Computer";
}

// Where the visit came from, as a short name. Visits from inside the site have none.
export function sourceOf(referrer: string, self: string): string | null {
  let h: string;
  try { h = new URL(referrer).hostname.toLowerCase(); } catch { return null; }
  if (!h || h === self || h.endsWith("sabongsentral.ph") || h.endsWith(".workers.dev")) return null;
  if (/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com|m\.me)$/.test(h)) return "Facebook";
  if (/(^|\.)google\./.test(h)) return "Google";
  if (/(^|\.)(youtube\.com|youtu\.be)$/.test(h)) return "YouTube";
  if (/(^|\.)tiktok\.com$/.test(h)) return "TikTok";
  if (/(^|\.)(bing\.com|duckduckgo\.com|yahoo\.com)$/.test(h)) return "Other search";
  return h.replace(/^www\./, "").slice(0, 60);
}

async function sha(s: string) {
  const b = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  return Array.from(b.slice(0, 8), (x) => x.toString(16).padStart(2, "0")).join("");
}

async function weeklySalt(week: string): Promise<string> {
  const d = db();
  const fresh = Array.from(crypto.getRandomValues(new Uint8Array(16)), (x) => x.toString(16).padStart(2, "0")).join("");
  await d.batch([
    d.prepare(`insert or ignore into stats_salt (week, salt) values (?, ?)`).bind(week, fresh),
    d.prepare(`delete from stats_salt where week < ?`).bind(week), // old keys gone for good
  ]);
  const r = await d.prepare(`select salt from stats_salt where week = ?`).bind(week).first<{ salt: string }>();
  return r?.salt ?? fresh;
}

let lastPrune = 0;
export async function recordView(o: { path: string; referrer: string; ip: string; ua: string; country: string | null; host: string }) {
  await ensureStats();
  const d = db();
  const day = manilaDay();
  const path = o.path.split(/[?#]/)[0].replace(/\/+$/, "").slice(0, 200) || "/";
  const [, section, slug] = path.split("/");
  let listingId: number | null = null;
  const kind = SECTIONS[section ?? ""];
  if (kind && slug) {
    let s = slug;
    try { s = decodeURIComponent(slug); } catch { /* keep raw */ }
    const r = await d.prepare(`select id from listings where kind = ? and slug = ? and status = 'approved'`).bind(kind, s).first<{ id: number }>();
    listingId = r?.id ?? null;
  }
  const visitor = await sha(`${await weeklySalt(weekOf(day))}|${o.ip}|${o.ua}`);
  const q = [
    d.prepare(`insert into page_views (day, path, listing_id, visitor, ref, device, country) values (?, ?, ?, ?, ?, ?, ?)`)
      .bind(day, path, listingId, visitor, sourceOf(o.referrer, o.host), deviceOf(o.ua), o.country?.slice(0, 2) || null),
  ];
  if (listingId) q.push(d.prepare(`insert into listing_views (listing_id, views) values (?, 1) on conflict (listing_id) do update set views = views + 1`).bind(listingId));
  if (Date.now() - lastPrune > 3600_000) {
    lastPrune = Date.now();
    q.push(d.prepare(`delete from page_views where day < ?`).bind(addDays(day, -KEEP_DAYS)));
  }
  await d.batch(q);
}

// ---- Admin numbers ----

export type Count = { label: string; n: number; extra?: number; href?: string };
export type SiteStats = {
  today: string;
  week: { visitors: number; views: number };
  lastWeek: { visitors: number; views: number };
  lastWeekSoFar: { visitors: number; views: number };
  daily: { day: string; visitors: number; views: number }[];
  pages: Count[];
  listings: Count[];
  allTime: Count[];
  sources: Count[];
  devices: Count[];
  countries: Count[];
};

const KIND_LABEL: Record<string, string> = { farm: "Farm", event: "Event", good: "Market", reel: "Reel", article: "Article", venue: "Venue" };
const hrefOf = (l: Pick<Listing, "kind" | "slug">) =>
  ({ farm: "/farms/", event: "/events/", good: "/market/", reel: "/reels/", article: "/learn/", venue: "/venues/" } as Record<string, string>)[l.kind] + l.slug;

export async function siteStats(): Promise<SiteStats> {
  await ensureStats();
  const d = db();
  const today = manilaDay();
  const mon = weekOf(today);
  const lastMon = addDays(mon, -7);
  const sameDayLastWeek = addDays(today, -7);
  const from14 = addDays(today, -13);
  const from30 = addDays(today, -29);
  const sum = `select count(distinct visitor) visitors, count(*) views from page_views where day between ? and ?`;
  type N = { visitors: number; views: number };
  type L = { label: string; n: number; extra: number };
  const [w, lw, lws, daily, pages, top, all, src, dev, cty] = await d.batch([
    d.prepare(sum).bind(mon, today),
    d.prepare(sum).bind(lastMon, addDays(mon, -1)),
    d.prepare(sum).bind(lastMon, sameDayLastWeek),
    d.prepare(`select day, count(distinct visitor) visitors, count(*) views from page_views where day >= ? group by day order by day`).bind(from14),
    d.prepare(`select path label, count(*) n, count(distinct visitor) extra from page_views where day >= ? group by path order by n desc limit 10`).bind(mon),
    d.prepare(`select listing_id label, count(*) n, count(distinct visitor) extra from page_views where day >= ? and listing_id is not null group by listing_id order by n desc limit 10`).bind(from30),
    d.prepare(`select listing_id label, views n, 0 extra from listing_views order by views desc limit 10`),
    // One source per visitor: where they first came from this week.
    d.prepare(`select coalesce(src, 'Direct / typed / app') label, count(*) n, 0 extra from (select visitor, max(ref) src from page_views where day >= ? group by visitor) group by 1 order by n desc limit 8`).bind(mon),
    d.prepare(`select coalesce(device, '?') label, count(distinct visitor) n, 0 extra from page_views where day >= ? group by 1 order by n desc`).bind(mon),
    d.prepare(`select coalesce(country, '?') label, count(distinct visitor) n, 0 extra from page_views where day >= ? group by 1 order by n desc limit 6`).bind(mon),
  ]);
  const one = (r: D1Result) => (r.results[0] as N | undefined) ?? { visitors: 0, views: 0 };
  const rows = (r: D1Result) => r.results as L[];

  // Listing titles for the top lists (deleted listings show as "Removed listing").
  const ids = [...new Set([...rows(top), ...rows(all)].map((r) => Number(r.label)))];
  const names = new Map<number, { title: string; href: string; kind: string }>();
  if (ids.length) {
    const { results } = await d.prepare(`select id, kind, slug, data from listings where id in (${ids.map(() => "?").join(",")})`).bind(...ids)
      .all<{ id: number; kind: Kind; slug: string; data: string }>();
    for (const r of results) {
      let data = {};
      try { data = JSON.parse(r.data); } catch { /* empty */ }
      names.set(r.id, { title: titleOf({ kind: r.kind, data } as Listing), href: hrefOf(r), kind: KIND_LABEL[r.kind] ?? r.kind });
    }
  }
  const named = (r: L): Count => {
    const x = names.get(Number(r.label));
    return { label: x ? `${x.title} · ${x.kind}` : "Removed listing", n: r.n, extra: r.extra || undefined, href: x?.href };
  };

  // Fill missing days with zero so the chart has 14 bars.
  const byDay = new Map((daily.results as { day: string; visitors: number; views: number }[]).map((r) => [r.day, r]));
  const days = Array.from({ length: 14 }, (_, i) => addDays(from14, i)).map((day) => byDay.get(day) ?? { day, visitors: 0, views: 0 });

  return {
    today,
    week: one(w), lastWeek: one(lw), lastWeekSoFar: one(lws),
    daily: days,
    pages: rows(pages).map((r) => ({ label: r.label, n: r.n, extra: r.extra, href: r.label })),
    listings: rows(top).map(named),
    allTime: rows(all).map(named),
    sources: rows(src),
    devices: rows(dev),
    countries: rows(cty),
  };
}
