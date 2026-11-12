import { cookies } from "next/headers";
import { hashPassword, verifyPassword } from "./auth";
import { byId, db, ensureDb, logAction, queueStatus, stages, type Listing, type QueueStatus } from "./db";

// Member Portal accounts: farms, organizers, sellers, suppliers, venues.
// Passwordless sign-in with a 6-digit email code. No government IDs.
export const ROLES = [
  ["farm", "Gamefarm owner"],
  ["organizer", "Event / seminar organizer"],
  ["venue", "Venue representative"],
  ["seller", "Market seller"],
  ["supplier", "Supplier"],
] as const;
export type Role = (typeof ROLES)[number][0];
export const MEMBER_STATUSES = ["incomplete", "pending", "active", "restricted", "suspended", "closed"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];
export const STATUS_LABEL: Record<MemberStatus, string> = {
  incomplete: "Sign-up not finished", pending: "Pending approval", active: "Active", restricted: "Restricted", suspended: "Suspended", closed: "Closed",
};

export const memberTone = (s: MemberStatus) => (s === "active" ? "green" : s === "pending" ? "gold" : s === "incomplete" ? "plain" : "red") as "green" | "gold" | "plain" | "red";

export type Member = {
  id: number; email: string; name: string; phone: string; roles: Role[]; facebook: string; org_link: string;
  status: MemberStatus; created_at: string; last_login: string | null;
};
type MemberRow = Omit<Member, "roles"> & { roles: string };

const COOKIE = "sc_member";
const SESSION_DAYS = 30;
const enc = new TextEncoder();
const b64 = (u: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(u)));
const sha256 = async (s: string) => b64(await crypto.subtle.digest("SHA-256", enc.encode(s)));

let ready: Promise<void> | null = null;
export function ensureMembers(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await ensureDb();
      const d = db();
      await d.batch([
        d.prepare(`create table if not exists members (
          id integer primary key autoincrement, email text not null unique, name text not null default '', phone text not null default '',
          roles text not null default '', facebook text not null default '', org_link text not null default '',
          status text not null default 'incomplete', created_at text not null default (datetime('now')), last_login text)`),
        d.prepare(`create table if not exists member_codes (
          email text not null, code_hash text not null, expires_at text not null, tries integer not null default 0,
          created_at text not null default (datetime('now')))`),
        d.prepare(`create table if not exists member_sessions (token_hash text primary key, member_id integer not null, expires_at text not null)`),
        d.prepare(`create table if not exists member_listings (listing_id integer primary key, member_id integer not null)`),
        d.prepare(`create index if not exists member_listings_m on member_listings (member_id)`),
        // Passwords (Em, 2026-11-12): until email sending is set up, an admin creates the
        // account and sends a temporary password, which the member changes on first sign-in.
        d.prepare(`create table if not exists member_passwords (
          member_id integer primary key, pw_hash text not null, must_change integer not null default 1,
          terms integer not null default 0, updated_at text not null default (datetime('now')))`),
        d.prepare(`create table if not exists member_login_fails (email text not null, at text not null default (datetime('now')))`),
      ]);
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

const toMember = (r: MemberRow): Member => ({ ...r, roles: r.roles.split(",").filter(Boolean) as Role[] });

// Until an email service is set up (needs the sabongcentral.com domain), the test
// site shows the code on screen. Set EMAIL_ENABLED to "true" once emails send.
export async function testMode(): Promise<boolean> {
  const { env } = await import("cloudflare:workers");
  return (env as unknown as { EMAIL_ENABLED?: string }).EMAIL_ENABLED !== "true";
}

export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 200;

// Creates a sign-in code. Max 5 codes per email per hour.
export async function newCode(email: string): Promise<string | "limit"> {
  await ensureMembers();
  const e = email.trim().toLowerCase();
  const n = await db().prepare(`select count(*) as n from member_codes where email = ? and created_at > datetime('now', '-1 hour')`).bind(e).first<{ n: number }>();
  if ((n?.n ?? 0) >= 5) return "limit";
  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
  await db().prepare(`insert into member_codes (email, code_hash, expires_at) values (?, ?, datetime('now', '+10 minutes'))`).bind(e, await sha256(`${e}:${code}`)).run();
  return code;
}

// Checks a code (5 tries), then signs the member in. Returns a session token.
export async function verifyCode(email: string, code: string): Promise<{ token: string; member: Member } | "bad" | "expired"> {
  await ensureMembers();
  const e = email.trim().toLowerCase();
  const row = await db().prepare(`select rowid as id, code_hash, tries, expires_at > datetime('now') as live from member_codes where email = ? order by rowid desc limit 1`).bind(e).first<{ id: number; code_hash: string; tries: number; live: number }>();
  if (!row || !row.live || row.tries >= 5) return "expired";
  if (row.code_hash !== (await sha256(`${e}:${code.trim()}`))) {
    await db().prepare(`update member_codes set tries = tries + 1 where rowid = ?`).bind(row.id).run();
    return "bad";
  }
  await db().prepare(`delete from member_codes where email = ?`).bind(e).run();
  await db().prepare(`insert or ignore into members (email) values (?)`).bind(e).run();
  const m = await db().prepare(`select * from members where email = ?`).bind(e).first<MemberRow>();
  return { token: await startSession(m!.id), member: toMember(m!) };
}

async function startSession(memberId: number): Promise<string> {
  const token = b64(crypto.getRandomValues(new Uint8Array(32)));
  await db().batch([
    db().prepare(`insert into member_sessions (token_hash, member_id, expires_at) values (?, ?, datetime('now', '+${SESSION_DAYS} days'))`).bind(await sha256(token), memberId),
    db().prepare(`update members set last_login = datetime('now') where id = ?`).bind(memberId),
  ]);
  return token;
}

// Easy to read out or type: no 0/O or 1/l/I. Example: k7Pm-x4Qa-9t
export function tempPassword(): string {
  const abc = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = crypto.getRandomValues(new Uint8Array(10));
  const s = Array.from(r, (n) => abc[n % abc.length]).join("");
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}

export type NewMember = { email: string; name: string; phone: string; roles: Role[]; facebook: string; org_link: string };

// Admin creates an account; returns the temporary password to send the member.
export async function createMember(p: NewMember, admin: string): Promise<{ id: number; temp: string } | "exists"> {
  await ensureMembers();
  const e = p.email.trim().toLowerCase();
  if (await db().prepare(`select 1 from members where email = ?`).bind(e).first()) return "exists";
  const r = await db().prepare(`insert into members (email, name, phone, roles, facebook, org_link, status) values (?, ?, ?, ?, ?, ?, 'active') returning id`)
    .bind(e, p.name, p.phone, p.roles.join(","), p.facebook, p.org_link).first<{ id: number }>();
  const temp = tempPassword();
  await db().prepare(`insert into member_passwords (member_id, pw_hash) values (?, ?)`).bind(r!.id, await hashPassword(temp)).run();
  await logAction(admin, "account created", `member #${r!.id}: ${p.name}`);
  return { id: r!.id, temp };
}

// New temporary password; signs the member out everywhere.
export async function resetPassword(id: number, admin: string): Promise<string | null> {
  const m = await memberById(id);
  if (!m) return null;
  const temp = tempPassword();
  const h = await hashPassword(temp);
  await db().batch([
    db().prepare(`insert into member_passwords (member_id, pw_hash, must_change) values (?, ?, 1) on conflict(member_id) do update set pw_hash = excluded.pw_hash, must_change = 1, updated_at = datetime('now')`).bind(id, h),
    db().prepare(`delete from member_sessions where member_id = ?`).bind(id),
  ]);
  await logAction(admin, "temporary password issued", `member #${id}: ${m.name || m.email}`);
  return temp;
}

// Email + password sign-in. 5 wrong tries in 15 minutes locks that email for a while.
export async function passwordLogin(email: string, password: string): Promise<{ token: string } | "bad" | "locked" | "blocked"> {
  await ensureMembers();
  const e = email.trim().toLowerCase();
  const fails = await db().prepare(`select count(*) as n from member_login_fails where email = ? and at > datetime('now', '-15 minutes')`).bind(e).first<{ n: number }>();
  if ((fails?.n ?? 0) >= 5) return "locked";
  const row = await db().prepare(`select m.id, m.status, p.pw_hash from members m join member_passwords p on p.member_id = m.id where m.email = ?`).bind(e).first<{ id: number; status: string; pw_hash: string }>();
  if (!row || !(await verifyPassword(password, row.pw_hash))) {
    await db().prepare(`insert into member_login_fails (email) values (?)`).bind(e).run();
    return "bad";
  }
  if (row.status === "suspended" || row.status === "closed") return "blocked";
  await db().prepare(`delete from member_login_fails where email = ?`).bind(e).run();
  return { token: await startSession(row.id) };
}

export async function passwordState(memberId: number): Promise<{ has: boolean; mustChange: boolean; terms: boolean }> {
  await ensureMembers();
  const r = await db().prepare(`select must_change, terms from member_passwords where member_id = ?`).bind(memberId).first<{ must_change: number; terms: number }>();
  return { has: !!r, mustChange: !!r?.must_change, terms: !!r?.terms };
}

export async function setOwnPassword(memberId: number, pw: string, terms: boolean) {
  await ensureMembers();
  await db().prepare(`insert into member_passwords (member_id, pw_hash, must_change, terms) values (?, ?, 0, ?) on conflict(member_id) do update set pw_hash = excluded.pw_hash, must_change = 0, terms = max(member_passwords.terms, excluded.terms), updated_at = datetime('now')`)
    .bind(memberId, await hashPassword(pw), terms ? 1 : 0).run();
  await logAction(`member #${memberId}`, "password changed", `member #${memberId}`);
}

export const PW_MIN = 10;

export const memberCookie = (token: string) => `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
export const clearMemberCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

function tokenFrom(req: Request): string | null {
  const m = (req.headers.get("cookie") ?? "").match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

async function memberFor(token: string | null | undefined): Promise<Member | null> {
  if (!token) return null;
  await ensureMembers();
  const r = await db().prepare(`select m.* from member_sessions s join members m on m.id = s.member_id where s.token_hash = ? and s.expires_at > datetime('now')`).bind(await sha256(token)).first<MemberRow>();
  return r ? toMember(r) : null;
}

export async function currentMember(): Promise<Member | null> {
  return memberFor((await cookies()).get(COOKIE)?.value);
}
export const memberFromRequest = (req: Request) => memberFor(tokenFrom(req));

export async function signOut(req: Request) {
  const t = tokenFrom(req);
  if (t) await db().prepare(`delete from member_sessions where token_hash = ?`).bind(await sha256(t)).run();
}

export async function saveProfile(id: number, p: { name: string; phone: string; roles: Role[]; facebook: string; org_link: string }) {
  await ensureMembers();
  await db().prepare(`update members set name = ?, phone = ?, roles = ?, facebook = ?, org_link = ?, status = case when status = 'incomplete' then 'pending' else status end where id = ?`)
    .bind(p.name, p.phone, p.roles.join(","), p.facebook, p.org_link, id).run();
}

// Members who can submit listings. Pending members can submit; their listings wait for review like everyone's.
export const canSubmit = (m: Member) => m.status === "pending" || m.status === "active";

export async function linkListing(listingId: number, memberId: number) {
  await ensureMembers();
  await db().prepare(`insert or replace into member_listings (listing_id, member_id) values (?, ?)`).bind(listingId, memberId).run();
}

export async function ownsListing(memberId: number, listingId: number): Promise<boolean> {
  await ensureMembers();
  return !!(await db().prepare(`select 1 from member_listings where listing_id = ? and member_id = ?`).bind(listingId, memberId).first());
}

export async function listingsOf(memberId: number): Promise<{ l: Listing; qs: QueueStatus }[]> {
  await ensureMembers();
  const { results } = await db().prepare(`select listing_id from member_listings where member_id = ? order by listing_id desc`).bind(memberId).all<{ listing_id: number }>();
  const st = await stages();
  const out: { l: Listing; qs: QueueStatus }[] = [];
  for (const r of results) {
    const l = await byId(r.listing_id);
    if (l) out.push({ l, qs: queueStatus(l.status, st.get(l.id)) });
  }
  return out;
}

// Admin
export async function members(status?: MemberStatus): Promise<(Member & { listings: number })[]> {
  await ensureMembers();
  const { results } = await db().prepare(
    `select m.*, (select count(*) from member_listings x where x.member_id = m.id) as listings from members m ${status ? "where status = ?" : "where status != 'incomplete'"} order by m.id desc limit 500`,
  ).bind(...(status ? [status] : [])).all<MemberRow & { listings: number }>();
  return results.map((r) => ({ ...toMember(r), listings: r.listings }));
}

export async function memberById(id: number): Promise<Member | null> {
  await ensureMembers();
  const r = await db().prepare(`select * from members where id = ?`).bind(id).first<MemberRow>();
  return r ? toMember(r) : null;
}

export async function memberByListing(listingId: number): Promise<Member | null> {
  await ensureMembers();
  const r = await db().prepare(`select m.* from member_listings x join members m on m.id = x.member_id where x.listing_id = ?`).bind(listingId).first<MemberRow>();
  return r ? toMember(r) : null;
}

export async function pendingMembers(): Promise<number> {
  await ensureMembers();
  const r = await db().prepare(`select count(*) as n from members where status = 'pending'`).first<{ n: number }>();
  return r?.n ?? 0;
}

export async function setMemberStatus(id: number, status: MemberStatus, admin: string, reason: string) {
  const m = await memberById(id);
  if (!m) return;
  await db().prepare(`update members set status = ? where id = ?`).bind(status, id).run();
  if (status === "suspended" || status === "closed") await db().prepare(`delete from member_sessions where member_id = ?`).bind(id).run();
  await logAction(admin, `member ${STATUS_LABEL[status].toLowerCase()}`, `member: ${m.name || m.email}`, reason);
}
