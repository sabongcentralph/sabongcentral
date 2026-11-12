import { env } from "cloudflare:workers";
import { ARTICLES, EVENTS, FARMS, GOODS, NOTICES, REELS, SUPPLIERS, type Bloodline } from "./sample";

// Everything people can see on the site is a "listing": farms, events, goods,
// reels, articles, community notices and suppliers. Nothing is public until an
// admin approves it (status = 'approved').
export const KINDS = ["farm", "event", "good", "reel", "article", "notice", "supplier", "venue"] as const;
export type Kind = (typeof KINDS)[number];
export type Status = "pending" | "approved" | "rejected" | "hidden";

export type FarmData = {
  name: string; province: string; city: string; about: string; ownerName: string; phone: string;
  facebook: string; messenger?: string; bloodlines: Bloodline[]; verified: boolean; est: string;
  visit?: string; address?: string; // address is private: never shown publicly
  profile?: string; cover?: string; gallery?: string[]; // /media/p/... photo paths
  featured?: boolean; spotlight?: boolean; // set by admin: home page "Featured Gamefarms" and "Farm Spotlight"
};
export type EventData = {
  title: string; cat: string; sub: string; group: string; derby: boolean; date: string; days: string; longDate: string;
  time: string; province: string; city: string; online: boolean; venue: string; desc: string; topics: string;
  speakers: string; fee: string; reg: string; permits: string; org: string;
  status?: EventStatus; link?: string; poster?: string;
  endDate?: string; startTime?: string; endTime?: string; // raw form values, so members can edit
};
export const EVENT_STATUSES = ["Upcoming", "Postponed", "Cancelled", "Completed"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];
export type GoodData = {
  name: string; cat: string; sub: string; price: string; seller: string; phone: string; province: string; city: string;
  sold: boolean; sellerVerified: boolean; desc?: string;
  avail?: Availability; condition?: string; pickup?: string; photos?: string[];
  renewed?: string; // ISO time the seller last renewed it
};
export const AVAILABILITY = ["Available", "Reserved", "Sold", "Removed"] as const;
export type Availability = (typeof AVAILABILITY)[number];
export const availOf = (d: GoodData): Availability => d.avail ?? (d.sold ? "Sold" : "Available");
export type ReelData = { title: string; topic: string; farm: string; farmSlug?: string; platform: string; url?: string; dur?: string; desc?: string };
export type ArticleData = {
  title: string; topic: string; date: string; read: string; by: string; body: string[];
  summary?: string; org?: string; refs?: string[]; reviewed?: string;
};
export type NoticeData = {
  kind: string; title: string; meta: string; text: string; source: string;
  issuer?: string; scope?: string; url?: string; expires?: string;
};
export type SupplierData = { kind: string; name: string; place: string; about: string; phone: string };
// Venues & Organizers (Em, 2026-11-12): cockpit arenas and event organizers; one profile can be both.
export const VENUE_ROLES = ["Venue", "Organizer"] as const;
export type VenueData = {
  name: string; roles: string[]; province: string; city: string; place: string; about: string;
  phone: string; facebook: string; messenger?: string; permits: string; verified: boolean;
  operator?: string; // private, admin only
  profile?: string; cover?: string;
};

type DataOf = {
  farm: FarmData; event: EventData; good: GoodData; reel: ReelData; article: ArticleData; notice: NoticeData; supplier: SupplierData; venue: VenueData;
};

export type Listing<K extends Kind = Kind> = {
  id: number; kind: K; slug: string; status: Status; isSample: boolean; data: DataOf[K];
  submittedBy: string | null; reason: string | null; createdAt: string; updatedAt: string;
};

type Row = {
  id: number; kind: Kind; slug: string; status: Status; is_sample: number; data: string;
  submitted_by: string | null; reason: string | null; created_at: string; updated_at: string;
};

const SCHEMA = [
  `create table if not exists listings (
    id integer primary key autoincrement,
    kind text not null,
    slug text not null,
    status text not null default 'pending' check (status in ('pending','approved','rejected','hidden')),
    is_sample integer not null default 0,
    data text not null,
    submitted_by text,
    reason text,
    created_at text not null default (datetime('now')),
    updated_at text not null default (datetime('now')),
    unique (kind, slug)
  )`,
  `create index if not exists listings_kind_status on listings (kind, status)`,
  `create table if not exists reports (
    id integer primary key autoincrement,
    target text not null,
    reason text not null,
    details text,
    contact text,
    status text not null default 'open',
    created_at text not null default (datetime('now'))
  )`,
  `create table if not exists messages (
    id integer primary key autoincrement,
    name text not null,
    email text not null,
    topic text not null,
    body text not null,
    status text not null default 'new',
    created_at text not null default (datetime('now'))
  )`,
  `create table if not exists audit_log (
    id integer primary key autoincrement,
    admin text not null,
    action text not null,
    target text not null,
    reason text,
    created_at text not null default (datetime('now'))
  )`,
  `create table if not exists admins (
    email text primary key,
    pw_hash text not null,
    role text not null default 'super',
    created_at text not null default (datetime('now'))
  )`,
  // Review workflow on top of status: "in_review", "needs_changes" (still pending)
  // and "archived" (hidden). One row per listing that has left the "New" stage.
  `create table if not exists review_stage (
    listing_id integer primary key,
    stage text not null check (stage in ('in_review','needs_changes','archived')),
    updated_at text not null default (datetime('now'))
  )`,
  // Internal admin notes: never shown publicly.
  `create table if not exists admin_notes (
    id integer primary key autoincrement,
    listing_id integer not null,
    admin text not null,
    body text not null,
    created_at text not null default (datetime('now'))
  )`,
  `create index if not exists admin_notes_listing on admin_notes (listing_id)`,
  // A member's edit to a live listing waits here; the live version stays up until an admin approves it.
  `create table if not exists listing_edits (
    listing_id integer primary key,
    data text not null,
    by text not null,
    created_at text not null default (datetime('now'))
  )`,
  // Admin notes on a report (status changes and findings).
  `create table if not exists report_notes (
    id integer primary key autoincrement,
    report_id integer not null,
    admin text not null,
    status text,
    body text,
    created_at text not null default (datetime('now'))
  )`,
  `create table if not exists sessions (
    token_hash text primary key,
    email text not null,
    expires_at text not null
  )`,
];

export const slugify = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "item";

// Approved samples so every page has examples, plus a few pending ones so the
// admin queue has something to review. All are marked is_sample = 1 and can be
// removed with: delete from listings where is_sample = 1;
function samples(): Array<{ kind: Kind; slug: string; status: Status; by: string; data: object }> {
  const out: Array<{ kind: Kind; slug: string; status: Status; by: string; data: object }> = [];
  const add = (kind: Kind, slug: string, data: object, status: Status = "approved", by = "Sample") => out.push({ kind, slug, status, by, data });
  for (const { slug, ...f } of FARMS) add("farm", slug, f);
  for (const { slug, ...e } of EVENTS) add("event", slug, e);
  for (const { slug, ...g } of GOODS) add("good", slug, { ...g, desc: "Details from the seller: contents, use, and pickup or delivery options." });
  for (const { slug, ...r } of REELS) add("reel", slug, r);
  for (const { slug, ...a } of ARTICLES) add("article", slug, a);
  for (const n of NOTICES) add("notice", slugify(n.title), n);
  for (const s of SUPPLIERS) add("supplier", slugify(s.name), s);
  // Pending examples for the admin queue.
  add("farm", "sunrise-gamefarm", {
    name: "Sunrise Gamefarm", province: "Batangas", city: "Tanauan City", est: "2017", verified: false, ownerName: "Rico Santos",
    phone: "0919 404 7781", facebook: "facebook.com/sabongcentral", about: "Newly submitted farm (sample), waiting for admin review.",
    bloodlines: [{ name: "Sweater" }, { name: "Roundhead" }],
  }, "pending", "Rico Santos (sample)");
  add("good", "conditioning-mix-5-kg", {
    name: "Conditioning Mix (5 kg)", cat: "Feeds", sub: "Conditioning", price: "₱420", seller: "Farm Deals PH", phone: "0918 777 XXXX",
    province: "Batangas", city: "Lemery", sold: false, sellerVerified: false, desc: "New listing (sample) waiting for approval.",
  }, "pending", "Farm Deals PH (sample)");
  add("reel", "how-to-bathe-chickens-properly", {
    title: "How to bathe chickens properly", topic: "Farm Management", farm: "Tres Lomas Farm", farmSlug: "tres-lomas-farm", platform: "YouTube", url: "",
  }, "pending", "Tres Lomas Farm (sample)");
  return out;
}

let ready: Promise<void> | null = null;

export function db(): D1Database {
  return env.DB;
}

// Creates tables and seeds samples once per Worker instance. Safe to repeat.
export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const d = db();
      await d.batch(SCHEMA.map((sql) => d.prepare(sql)));
      const insert = d.prepare(
        `insert or ignore into listings (kind, slug, status, is_sample, data, submitted_by) values (?, ?, ?, 1, ?, ?)`,
      );
      // Approved samples follow this file; admin decisions on pending samples are kept.
      const refresh = d.prepare(`update listings set data = ? where kind = ? and slug = ? and is_sample = 1`);
      // Sample listings only when SAMPLE_DATA is "true" (off since the soft launch, 2026-11-12).
      // When off, the cleanup below removes every sample row.
      const rows = (env as unknown as { SAMPLE_DATA?: string }).SAMPLE_DATA === "true" ? samples() : [];
      if (rows.length) await d.batch(rows.flatMap((r) => [insert.bind(r.kind, r.slug, r.status, JSON.stringify(r.data), r.by), refresh.bind(JSON.stringify(r.data), r.kind, r.slug)]));
      // Remove samples that are no longer in this file (e.g. renamed slugs).
      const keep = rows.map((r) => `${r.kind}:${r.slug}`);
      const { results } = await d.prepare(`select id, kind, slug from listings where is_sample = 1`).all<{ id: number; kind: string; slug: string }>();
      const stale = results.filter((r) => !keep.includes(`${r.kind}:${r.slug}`));
      if (stale.length) await d.batch(stale.map((r) => d.prepare(`delete from listings where id = ? and is_sample = 1`).bind(r.id)));
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

function toListing<K extends Kind>(r: Row): Listing<K> {
  let data: DataOf[K];
  try {
    data = JSON.parse(r.data);
  } catch {
    data = {} as DataOf[K];
  }
  return {
    id: r.id, kind: r.kind as K, slug: r.slug, status: r.status, isSample: r.is_sample === 1, data,
    submittedBy: r.submitted_by, reason: r.reason, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

// Public pages: approved listings only.
export async function approved<K extends Kind>(kind: K): Promise<Listing<K>[]> {
  await ensureDb();
  const { results } = await db()
    .prepare(`select * from listings where kind = ? and status = 'approved' order by is_sample asc, case when is_sample = 1 then id end asc, created_at desc, id desc limit 1000`)
    .bind(kind)
    .all<Row>();
  return results.map((r) => toListing<K>(r)).filter(isPublic);
}

// A seller can mark an item "Removed": it stays approved but leaves the public site.
function isPublic(l: Listing): boolean {
  if (l.kind !== "good") return true;
  return (l.data as GoodData).avail !== "Removed" && !(!l.isSample && daysLeft(l) <= 0);
}

// Market items stay up for MARKET_DAYS after they are listed or renewed by the seller.
export const MARKET_DAYS = 60;
export function daysLeft(l: Pick<Listing, "data" | "createdAt">): number {
  const from = (l.data as { renewed?: string }).renewed ?? l.createdAt;
  const t = Date.parse(from.includes("T") ? from : from.replace(" ", "T") + "Z");
  return Math.ceil(MARKET_DAYS - (Date.now() - t) / 86_400_000);
}

export async function approvedOne<K extends Kind>(kind: K, slug: string): Promise<Listing<K> | null> {
  await ensureDb();
  const r = await db().prepare(`select * from listings where kind = ? and slug = ? and status = 'approved'`).bind(kind, slug).first<Row>();
  const l = r ? toListing<K>(r) : null;
  return l && isPublic(l) ? l : null;
}

export async function recent(limit = 6): Promise<Listing[]> {
  await ensureDb();
  const { results } = await db()
    .prepare(`select * from listings where status = 'approved' and kind in ('farm','event','good','reel','article') order by updated_at desc, id desc limit ?`)
    .bind(limit)
    .all<Row>();
  return results.map((r) => toListing(r));
}

// Admin
export async function byStatus(status: Status | "all", kind?: Kind): Promise<Listing[]> {
  await ensureDb();
  const where: string[] = [];
  const args: unknown[] = [];
  if (status !== "all") { where.push("status = ?"); args.push(status); }
  if (kind) { where.push("kind = ?"); args.push(kind); }
  const { results } = await db()
    .prepare(`select * from listings ${where.length ? "where " + where.join(" and ") : ""} order by created_at desc, id desc limit 500`)
    .bind(...args)
    .all<Row>();
  return results.map((r) => toListing(r));
}

export async function byId(id: number): Promise<Listing | null> {
  await ensureDb();
  const r = await db().prepare(`select * from listings where id = ?`).bind(id).first<Row>();
  return r ? toListing(r) : null;
}

export async function counts(): Promise<Record<string, number>> {
  await ensureDb();
  const { results } = await db().prepare(`select status, count(*) as n from listings group by status`).all<{ status: string; n: number }>();
  const out: Record<string, number> = { pending: 0, approved: 0, rejected: 0, hidden: 0 };
  for (const r of results) out[r.status] = r.n;
  const rep = await db().prepare(`select count(*) as n from reports where status in ('open','investigating','escalated')`).first<{ n: number }>();
  const msg = await db().prepare(`select count(*) as n from messages where status = 'new'`).first<{ n: number }>();
  out.reports = rep?.n ?? 0;
  out.messages = msg?.n ?? 0;
  return out;
}

export async function setStatus(id: number, status: Status, admin: string, reason: string) {
  await ensureDb();
  const l = await byId(id);
  if (!l) return;
  await db().batch([
    db().prepare(`update listings set status = ?, reason = ?, updated_at = datetime('now') where id = ?`).bind(status, reason || null, id),
    db().prepare(`insert into audit_log (admin, action, target, reason) values (?, ?, ?, ?)`).bind(admin, status, `${l.kind}: ${titleOf(l)}`, reason || null),
  ]);
}

// ---- Review queue (admin) ----
export const QUEUE = ["New", "In Review", "Needs Changes", "Approved", "Rejected", "Hidden", "Archived", "Draft"] as const;
export type QueueStatus = (typeof QUEUE)[number];
type Stage = "in_review" | "needs_changes" | "archived";

// Drafts (Em, 2026-11-12): saved but never sent for review or published. Stored as
// hidden with this reason, so they never show on the public site.
export const DRAFT = "Draft (not published yet)";

export function queueStatus(status: Status, stage: Stage | null | undefined, reason?: string | null): QueueStatus {
  if (status === "hidden" && reason === DRAFT) return "Draft";
  if (status === "pending") return stage === "in_review" ? "In Review" : stage === "needs_changes" ? "Needs Changes" : "New";
  if (status === "hidden") return stage === "archived" ? "Archived" : "Hidden";
  return status === "approved" ? "Approved" : "Rejected";
}

export async function stages(): Promise<Map<number, Stage>> {
  await ensureDb();
  const { results } = await db().prepare(`select listing_id, stage from review_stage`).all<{ listing_id: number; stage: Stage }>();
  return new Map(results.map((r) => [r.listing_id, r.stage]));
}

// Moves a listing through the review workflow and logs it.
export async function review(id: number, to: QueueStatus, admin: string, reason: string) {
  await ensureDb();
  const l = await byId(id);
  if (!l) return;
  const status: Status = to === "Approved" ? "approved" : to === "Rejected" ? "rejected" : to === "Hidden" || to === "Archived" ? "hidden" : "pending";
  const stage: Stage | null = to === "In Review" ? "in_review" : to === "Needs Changes" ? "needs_changes" : to === "Archived" ? "archived" : null;
  const d = db();
  await d.batch([
    d.prepare(`update listings set status = ?, reason = ?, updated_at = datetime('now') where id = ?`).bind(status, reason || null, id),
    stage
      ? d.prepare(`insert into review_stage (listing_id, stage) values (?, ?) on conflict(listing_id) do update set stage = excluded.stage, updated_at = datetime('now')`).bind(id, stage)
      : d.prepare(`delete from review_stage where listing_id = ?`).bind(id),
    d.prepare(`insert into audit_log (admin, action, target, reason) values (?, ?, ?, ?)`).bind(admin, to.toLowerCase(), `${l.kind}: ${titleOf(l)}`, reason || null),
  ]);
}

export async function addNote(id: number, admin: string, body: string) {
  await ensureDb();
  await db().prepare(`insert into admin_notes (listing_id, admin, body) values (?, ?, ?)`).bind(id, admin, body).run();
}

export async function notesFor(id: number) {
  await ensureDb();
  const { results } = await db().prepare(`select * from admin_notes where listing_id = ? order by id desc`).bind(id).all<{ id: number; admin: string; body: string; created_at: string }>();
  return results;
}

export async function historyFor(l: Listing) {
  await ensureDb();
  const { results } = await db().prepare(`select * from audit_log where target = ? order by id desc limit 50`).bind(`${l.kind}: ${titleOf(l)}`)
    .all<{ id: number; admin: string; action: string; reason: string | null; created_at: string }>();
  return results;
}

export async function reportsAbout(l: Listing) {
  await ensureDb();
  const { results } = await db().prepare(`select * from reports where target like ? order by id desc limit 50`).bind(`%${titleOf(l)}%`).all<Report>();
  return results;
}

// Words that suggest betting, payments or banned items. A flag only asks the admin to look closer.
const RISKY = /\b(bet|bets|betting|odds|pustahan|sabong live|e-?sabong|online sabong|live ?stream|gcash|paymaya|send payment|pay ?now|escrow|live birds?|for sale.*(rooster|stag|cock)|gaff|tari|knife|blade|antibiotic|injectable|vaccine for sale)\b/i;

export type Flag = "Permit needed" | "Report received" | "Possible prohibited content";
export function flagsOf(l: Listing, reportTargets: string[]): Flag[] {
  const out: Flag[] = [];
  const d = l.data as unknown as Record<string, unknown>;
  if (l.kind === "event" && (d.derby || !String(d.permits ?? "").trim()) && l.status !== "approved") out.push("Permit needed");
  const t = titleOf(l).toLowerCase();
  if (t.length > 3 && reportTargets.some((r) => r.toLowerCase().includes(t))) out.push("Report received");
  if (RISKY.test(JSON.stringify(l.data))) out.push("Possible prohibited content");
  return out;
}

export async function openReportTargets(): Promise<string[]> {
  await ensureDb();
  const { results } = await db().prepare(`select target from reports where status in ('open','investigating','escalated')`).all<{ target: string }>();
  return results.map((r) => r.target);
}

export async function submit(kind: Kind, data: object, by: string): Promise<number> {
  await ensureDb();
  const base = slugify(titleOf({ kind, data } as Listing));
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const hit = await db().prepare(`select 1 from listings where kind = ? and slug = ?`).bind(kind, slug).first();
    if (!hit) break;
    slug = `${base}-${i}`;
  }
  const r = await db()
    .prepare(`insert into listings (kind, slug, status, data, submitted_by) values (?, ?, 'pending', ?, ?) returning id`)
    .bind(kind, slug, JSON.stringify(data), by)
    .first<{ id: number }>();
  return r?.id ?? 0;
}

export function titleOf(l: Pick<Listing, "kind" | "data">): string {
  const d = l.data as unknown as Record<string, string>;
  return d.name || d.title || "Untitled";
}

export async function audit(limit = 50) {
  await ensureDb();
  const { results } = await db().prepare(`select * from audit_log order by id desc limit ?`).bind(limit).all<{ id: number; admin: string; action: string; target: string; reason: string | null; created_at: string }>();
  return results;
}

export async function logAction(admin: string, action: string, target: string, reason?: string) {
  await db().prepare(`insert into audit_log (admin, action, target, reason) values (?, ?, ?, ?)`).bind(admin, action, target, reason || null).run();
}

// Admin marks a farm or seller as Business Verified after reviewing their papers.
export async function setVerified(id: number, on: boolean, admin: string) {
  const l = await byId(id);
  if (!l) return;
  const key = l.kind === "good" ? "sellerVerified" : l.kind === "farm" || l.kind === "venue" ? "verified" : null;
  if (!key) return;
  const data = { ...(l.data as object), [key]: on };
  await db().batch([
    db().prepare(`update listings set data = ?, updated_at = datetime('now') where id = ?`).bind(JSON.stringify(data), id),
    db().prepare(`insert into audit_log (admin, action, target) values (?, ?, ?)`).bind(admin, on ? "business verified" : "badge removed", `${l.kind}: ${titleOf(l)}`),
  ]);
}

// Event status (Upcoming/Postponed/…) and Market availability (Available/Reserved/…).
export async function setState(id: number, value: string, admin: string) {
  const l = await byId(id);
  if (!l) return;
  const key = l.kind === "event" ? "status" : l.kind === "good" ? "avail" : null;
  const allowed: readonly string[] = l.kind === "event" ? EVENT_STATUSES : AVAILABILITY;
  if (!key || !allowed.includes(value)) return;
  const data = { ...(l.data as object), [key]: value, ...(l.kind === "good" ? { sold: value === "Sold" } : {}) };
  await db().batch([
    db().prepare(`update listings set data = ?, updated_at = datetime('now') where id = ?`).bind(JSON.stringify(data), id),
    db().prepare(`insert into audit_log (admin, action, target) values (?, ?, ?)`).bind(admin, `set ${key}: ${value}`, `${l.kind}: ${titleOf(l)}`),
  ]);
}

export type Report = { id: number; target: string; reason: string; details: string | null; contact: string | null; status: string; created_at: string };
export type Message = { id: number; name: string; email: string; topic: string; body: string; status: string; created_at: string };

export async function reports(): Promise<Report[]> {
  await ensureDb();
  return (await db().prepare(`select * from reports order by (status = 'open') desc, id desc limit 500`).all<Report>()).results;
}

// Report workflow. "open" is shown as New.
export const REPORT_STATUSES = [["open", "New"], ["investigating", "Investigating"], ["escalated", "Escalated"], ["resolved", "Resolved"], ["no_action", "No action"]] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number][0];
export const reportLabel = (s: string) => REPORT_STATUSES.find(([k]) => k === s)?.[1] ?? s;
export type ReportNote = { id: number; report_id: number; admin: string; status: string | null; body: string | null; created_at: string };

export async function setReport(id: number, status: ReportStatus | null, admin: string, note: string) {
  await ensureDb();
  const d = db();
  const r = await d.prepare(`select * from reports where id = ?`).bind(id).first<Report>();
  if (!r || (!status && !note)) return;
  const change = status && status !== r.status ? status : null;
  await d.batch([
    ...(change ? [d.prepare(`update reports set status = ? where id = ?`).bind(change, id)] : []),
    d.prepare(`insert into report_notes (report_id, admin, status, body) values (?, ?, ?, ?)`).bind(id, admin, change, note || null),
    d.prepare(`insert into audit_log (admin, action, target, reason) values (?, ?, ?, ?)`).bind(admin, change ? `report: ${reportLabel(change).toLowerCase()}` : "report note", `report #${id}: ${r.target}`, note || null),
  ]);
}

export async function reportNotes(): Promise<Map<number, ReportNote[]>> {
  await ensureDb();
  const { results } = await db().prepare(`select * from report_notes order by id desc limit 2000`).all<ReportNote>();
  const out = new Map<number, ReportNote[]>();
  for (const n of results) out.set(n.report_id, [...(out.get(n.report_id) ?? []), n]);
  return out;
}

// The listing a report is about, matched by its title (reports store the title text).
export async function listingsNamed(target: string): Promise<Listing[]> {
  await ensureDb();
  const t = target.trim().toLowerCase();
  if (t.length < 3) return [];
  const { results } = await db().prepare(`select * from listings where is_sample = 0 or status = 'approved' order by id desc limit 1000`).all<Row>();
  return results.map((r) => toListing(r)).filter((l) => { const n = titleOf(l).toLowerCase(); return n.length > 3 && (t.includes(n) || n.includes(t)); }).slice(0, 3);
}

// ---- Member changes to their own listings ----

export type PendingEdit = { data: Record<string, unknown>; by: string; created_at: string };

export async function pendingEdit(id: number): Promise<PendingEdit | null> {
  await ensureDb();
  const r = await db().prepare(`select * from listing_edits where listing_id = ?`).bind(id).first<{ data: string; by: string; created_at: string }>();
  if (!r) return null;
  try { return { data: JSON.parse(r.data), by: r.by, created_at: r.created_at }; } catch { return null; }
}

export async function editIds(): Promise<number[]> {
  await ensureDb();
  return (await db().prepare(`select listing_id from listing_edits order by created_at`).all<{ listing_id: number }>()).results.map((r) => r.listing_id);
}

// Live listing: the edit waits for review. Anything else: replace it and send it back to review.
export async function memberEdit(l: Listing, data: object, who: string, draft = false): Promise<"waiting" | "resubmitted" | "draft"> {
  const d = db();
  const target = `${l.kind}: ${titleOf(l)}`;
  if (draft && l.status !== "approved") {
    await d.batch([
      d.prepare(`update listings set data = ?, status = 'hidden', reason = ?, updated_at = datetime('now') where id = ?`).bind(JSON.stringify(data), DRAFT, l.id),
      d.prepare(`delete from review_stage where listing_id = ?`).bind(l.id),
      d.prepare(`insert into audit_log (admin, action, target) values (?, 'draft saved', ?)`).bind(who, target),
    ]);
    return "draft";
  }
  if (l.status === "approved") {
    await d.batch([
      d.prepare(`insert into listing_edits (listing_id, data, by) values (?, ?, ?) on conflict(listing_id) do update set data = excluded.data, by = excluded.by, created_at = datetime('now')`).bind(l.id, JSON.stringify(data), who),
      d.prepare(`insert into audit_log (admin, action, target) values (?, 'edit submitted', ?)`).bind(who, target),
    ]);
    return "waiting";
  }
  await d.batch([
    d.prepare(`update listings set data = ?, status = 'pending', reason = null, updated_at = datetime('now') where id = ?`).bind(JSON.stringify(data), l.id),
    d.prepare(`delete from review_stage where listing_id = ?`).bind(l.id),
    d.prepare(`delete from listing_edits where listing_id = ?`).bind(l.id),
    d.prepare(`insert into audit_log (admin, action, target) values (?, 'resubmitted', ?)`).bind(who, target),
  ]);
  return "resubmitted";
}

export async function decideEdit(id: number, approve: boolean, admin: string, reason: string) {
  const l = await byId(id);
  const e = await pendingEdit(id);
  if (!l || !e) return;
  const d = db();
  // Admin-controlled fields always come from the live listing.
  const keep = Object.fromEntries(["verified", "sellerVerified", "featured", "spotlight"].filter((k) => k in (l.data as object)).map((k) => [k, (l.data as Record<string, unknown>)[k]]));
  await d.batch([
    ...(approve ? [d.prepare(`update listings set data = ?, reason = null, updated_at = datetime('now') where id = ?`).bind(JSON.stringify({ ...e.data, ...keep }), id)] : []),
    ...(!approve && reason ? [d.prepare(`update listings set reason = ? where id = ?`).bind(reason, id)] : []),
    d.prepare(`delete from listing_edits where listing_id = ?`).bind(id),
    d.prepare(`insert into audit_log (admin, action, target, reason) values (?, ?, ?, ?)`).bind(admin, approve ? "edit approved" : "edit rejected", `${l.kind}: ${titleOf(l)}`, reason || null),
  ]);
}

// Home page picks (farms): "featured" can be many; only one farm is the Spotlight.
export async function setHomePick(id: number, what: "featured" | "spotlight", on: boolean, admin: string) {
  const l = await byId(id);
  if (!l || l.kind !== "farm") return;
  const d = db();
  const data = { ...(l.data as object), [what]: on };
  await d.batch([
    ...(what === "spotlight" && on ? [d.prepare(`update listings set data = json_remove(data, '$.spotlight') where kind = 'farm' and id != ? and json_extract(data, '$.spotlight') = 1`).bind(id)] : []),
    d.prepare(`update listings set data = ?, updated_at = datetime('now') where id = ?`).bind(JSON.stringify(data), id),
    d.prepare(`insert into audit_log (admin, action, target) values (?, ?, ?)`).bind(admin, `${on ? "" : "removed "}${what === "spotlight" ? "farm spotlight" : "featured"}`, `${l.kind}: ${titleOf(l)}`),
  ]);
}

// Keeps a listing as a draft: not public and not in the review queue.
export async function makeDraft(id: number, who: string) {
  const l = await byId(id);
  if (!l) return;
  const d = db();
  await d.batch([
    d.prepare(`update listings set status = 'hidden', reason = ?, updated_at = datetime('now') where id = ?`).bind(DRAFT, id),
    d.prepare(`delete from review_stage where listing_id = ?`).bind(id),
    d.prepare(`insert into audit_log (admin, action, target) values (?, 'saved as draft', ?)`).bind(who, `${l.kind}: ${titleOf(l)}`),
  ]);
}

// Deletes a listing for good, with its notes, waiting edit and photos. The audit log keeps a record.
export async function deleteListing(l: Listing, who: string) {
  const d = db();
  const edit = await pendingEdit(l.id);
  const photos = [l.data as unknown as Record<string, unknown>, edit?.data ?? {}].flatMap((x) =>
    ["profile", "cover", "gallery", "poster", "photos"].flatMap((k) => (Array.isArray(x[k]) ? (x[k] as unknown[]) : x[k] ? [x[k]] : [])).map(String));
  await d.batch([
    d.prepare(`delete from listings where id = ?`).bind(l.id),
    d.prepare(`delete from review_stage where listing_id = ?`).bind(l.id),
    d.prepare(`delete from listing_edits where listing_id = ?`).bind(l.id),
    d.prepare(`delete from admin_notes where listing_id = ?`).bind(l.id),
    d.prepare(`insert into audit_log (admin, action, target) values (?, 'deleted', ?)`).bind(who, `${l.kind}: ${titleOf(l)}`),
  ]);
  await d.prepare(`delete from member_listings where listing_id = ?`).bind(l.id).run().catch(() => {}); // table exists once members are on
  const { deletePhotos } = await import("./media");
  await deletePhotos(photos);
}

// Admin edits apply at once (the admin is the reviewer).
export async function adminEdit(l: Listing, data: object, admin: string) {
  const d = db();
  await d.batch([
    d.prepare(`update listings set data = ?, updated_at = datetime('now') where id = ?`).bind(JSON.stringify(data), l.id),
    d.prepare(`insert into audit_log (admin, action, target) values (?, 'edited', ?)`).bind(admin, `${l.kind}: ${titleOf(l)}`),
  ]);
}

// Hands a listing Sabong Central added over to the member who owns it.
export async function transferListing(l: Listing, memberId: number, memberName: string, admin: string) {
  const d = db();
  const data = { ...(l.data as object) } as Record<string, unknown>;
  delete data.listedBy;
  await d.batch([
    d.prepare(`update listings set data = ?, updated_at = datetime('now') where id = ?`).bind(JSON.stringify(data), l.id),
    d.prepare(`insert or replace into member_listings (listing_id, member_id) values (?, ?)`).bind(l.id, memberId),
    d.prepare(`insert into audit_log (admin, action, target, reason) values (?, 'moved to member', ?, ?)`).bind(admin, `${l.kind}: ${titleOf(l)}`, `${memberName} (member #${memberId})`),
  ]);
}

export const UNPUBLISHED_BY_OWNER = "Unpublished by the owner";

// Quick changes a member can make without review.
export async function ownerAction(l: Listing, action: string, value: string, who: string): Promise<string | null> {
  const d = db();
  const target = `${l.kind}: ${titleOf(l)}`;
  const log = (a: string) => d.prepare(`insert into audit_log (admin, action, target) values (?, ?, ?)`).bind(who, a, target);
  const live = l.status === "approved";
  if (action === "state") {
    if (!live || (l.kind !== "event" && l.kind !== "good")) return "Only live events and Market items can change status.";
    await setState(l.id, value, who);
    return null;
  }
  if (action === "renew") {
    if (!live || l.kind !== "good") return "Only live Market items can be renewed.";
    const data = { ...(l.data as object), renewed: new Date().toISOString() };
    await d.batch([d.prepare(`update listings set data = ?, updated_at = datetime('now') where id = ?`).bind(JSON.stringify(data), l.id), log("renewed")]);
    return null;
  }
  if (action === "unpublish") {
    if (l.status === "hidden" || l.status === "rejected") return "This listing is already not public.";
    await d.batch([
      d.prepare(`update listings set status = 'hidden', reason = ?, updated_at = datetime('now') where id = ?`).bind(UNPUBLISHED_BY_OWNER, l.id),
      d.prepare(`insert into review_stage (listing_id, stage) values (?, 'archived') on conflict(listing_id) do update set stage = 'archived', updated_at = datetime('now')`).bind(l.id),
      d.prepare(`delete from listing_edits where listing_id = ?`).bind(l.id),
      log("unpublished by owner"),
    ]);
    return null;
  }
  if (action === "republish") {
    if (l.reason !== UNPUBLISHED_BY_OWNER) return "Only listings you unpublished yourself can be sent back. Please contact us.";
    await d.batch([
      d.prepare(`update listings set status = 'pending', reason = null, updated_at = datetime('now') where id = ?`).bind(l.id),
      d.prepare(`delete from review_stage where listing_id = ?`).bind(l.id),
      log("republish requested"),
    ]);
    return null;
  }
  if (action === "submit_draft") {
    if (l.reason !== DRAFT) return "This listing isn’t a draft.";
    await d.batch([
      d.prepare(`update listings set status = 'pending', reason = null, updated_at = datetime('now') where id = ?`).bind(l.id),
      log("submitted for review"),
    ]);
    return null;
  }
  if (action === "delete") {
    await deleteListing(l, who);
    return null;
  }
  if (action === "cancel_edit") {
    await d.batch([d.prepare(`delete from listing_edits where listing_id = ?`).bind(l.id), log("edit withdrawn")]);
    return null;
  }
  return "Unknown action.";
}
export async function messages(): Promise<Message[]> {
  await ensureDb();
  return (await db().prepare(`select * from messages order by (status = 'new') desc, id desc limit 200`).all<Message>()).results;
}
