import { cookies } from "next/headers";
import { db, ensureDb } from "./db";
import { disable } from "./totp";

export const SUPER_ADMIN = "sabongcentralph@gmail.com";
// Hash of the first Super Admin password (PBKDF2-SHA256). The password itself is
// never stored. Change it from Admin → Account after the first login.
const FIRST_PASSWORD_HASH = "pbkdf2$100000$YR/mj+wzTlGrOpuah0CUvw==$pHB16MRiwJW+Frb3gomH/h3z+fMWkZowXie7E+i1NjU=";
const COOKIE = "sc_admin";
const SESSION_DAYS = 7;

const enc = new TextEncoder();
const b64 = (u: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(u)));
const unb64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const it = 100000;
  return `pbkdf2$${it}$${b64(salt)}$${b64(await pbkdf2(password, salt, it))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, it, salt, hash] = stored.split("$");
  if (algo !== "pbkdf2") return false;
  const got = new Uint8Array(await pbkdf2(password, unb64(salt), Number(it)));
  const want = unb64(hash);
  if (got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got[i] ^ want[i];
  return diff === 0;
}

async function sha256(s: string) {
  return b64(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}

async function ensureAdmin() {
  await ensureDb();
  await db().prepare(`insert or ignore into admins (email, pw_hash) values (?, ?)`).bind(SUPER_ADMIN, FIRST_PASSWORD_HASH).run();
  await db().prepare(`create table if not exists login_attempts (email text not null, at text not null default (datetime('now')))`).run();
}

// Password check. Locks out after 5 failed tries in 15 minutes.
export async function checkAdminPassword(email: string, password: string): Promise<"ok" | "locked" | "bad"> {
  await ensureAdmin();
  const e = email.trim().toLowerCase();
  const fails = await db().prepare(`select count(*) as n from login_attempts where email = ? and at > datetime('now', '-15 minutes')`).bind(e).first<{ n: number }>();
  if ((fails?.n ?? 0) >= 5) return "locked";
  const row = await db().prepare(`select pw_hash from admins where email = ?`).bind(e).first<{ pw_hash: string }>();
  if (!row || !(await verifyPassword(password, row.pw_hash))) {
    await db().prepare(`insert into login_attempts (email) values (?)`).bind(e).run();
    return "bad";
  }
  await db().prepare(`delete from login_attempts where email = ?`).bind(e).run();
  return "ok";
}

export async function startAdminSession(email: string): Promise<string> {
  const token = b64(crypto.getRandomValues(new Uint8Array(32)));
  await db().prepare(`insert into sessions (token_hash, email, expires_at) values (?, ?, datetime('now', '+${SESSION_DAYS} days'))`).bind(await sha256(token), email.trim().toLowerCase()).run();
  return token;
}

// Counts a failed second step against the same 15-minute lockout.
export async function failedAttempt(email: string) {
  await db().prepare(`insert into login_attempts (email) values (?)`).bind(email).run();
}

export function sessionCookie(token: string) {
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}
export const clearCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

function tokenFrom(req?: Request): string | null {
  const raw = req?.headers.get("cookie") ?? "";
  const m = raw.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

async function emailFor(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;
  await ensureAdmin();
  const r = await db().prepare(`select email from sessions where token_hash = ? and expires_at > datetime('now')`).bind(await sha256(token)).first<{ email: string }>();
  return r?.email ?? null;
}

// For pages (server components).
export async function currentAdmin(): Promise<string | null> {
  const store = await cookies();
  return emailFor(store.get(COOKIE)?.value);
}

// For route handlers.
export async function adminFromRequest(req: Request): Promise<string | null> {
  return emailFor(tokenFrom(req));
}

export async function logout(req: Request) {
  const t = tokenFrom(req);
  if (t) await db().prepare(`delete from sessions where token_hash = ?`).bind(await sha256(t)).run();
}

export async function changePassword(email: string, current: string, next: string): Promise<boolean> {
  const row = await db().prepare(`select pw_hash from admins where email = ?`).bind(email).first<{ pw_hash: string }>();
  if (!row || !(await verifyPassword(current, row.pw_hash))) return false;
  await db().batch([
    db().prepare(`update admins set pw_hash = ? where email = ?`).bind(await hashPassword(next), email),
    db().prepare(`delete from sessions where email = ?`).bind(email),
  ]);
  return true;
}

// Forms post back to the same site only.
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  return !origin || origin === new URL(req.url).origin;
}

// First-time setup / password reset: the Super Admin sets their own password
// using a setup code they saved themselves as the ADMIN_SETUP_CODE secret in the
// Cloudflare dashboard. Nobody else ever sees the password. Without the secret,
// setup is turned off.
export async function setupWithCode(code: string, email: string, next: string): Promise<"ok" | "off" | "bad"> {
  const { env } = await import("cloudflare:workers");
  const secret = (env as unknown as { ADMIN_SETUP_CODE?: string }).ADMIN_SETUP_CODE;
  if (!secret || secret.length < 12) return "off";
  await ensureAdmin();
  const e = email.trim().toLowerCase();
  const fails = await db().prepare(`select count(*) as n from login_attempts where email = 'setup' and at > datetime('now', '-15 minutes')`).first<{ n: number }>();
  if ((fails?.n ?? 0) >= 5) return "bad";
  const a = enc.encode(code), b = enc.encode(secret);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.min(a.length, b.length); i++) diff |= a[i] ^ b[i];
  if (diff !== 0 || e !== SUPER_ADMIN) {
    await db().prepare(`insert into login_attempts (email) values ('setup')`).run();
    return "bad";
  }
  await db().batch([
    db().prepare(`update admins set pw_hash = ? where email = ?`).bind(await hashPassword(next), e),
    db().prepare(`delete from sessions where email = ?`).bind(e),
  ]);
  // Lost phone: the setup code also turns two-step login off, so it can be set up again.
  await disable(e);
  return "ok";
}
