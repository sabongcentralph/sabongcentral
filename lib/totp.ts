import qrcode from "qrcode-generator";
import { db } from "./db";

// Two-step admin login with an authenticator app (Google Authenticator, Microsoft
// Authenticator, Authy…): standard 6-digit TOTP codes, 30-second steps. Free, no email or SMS.
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const enc = new TextEncoder();

export function newSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let bits = "", out = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  for (let i = 0; i + 5 <= bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}

function fromB32(s: string): Uint8Array<ArrayBuffer> {
  let bits = "";
  for (const c of s.replace(/=+$/, "").toUpperCase()) { const v = B32.indexOf(c); if (v >= 0) bits += v.toString(2).padStart(5, "0"); }
  const out = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < out.length; i++) out[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  return out;
}

async function codeAt(secret: string, counter: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", fromB32(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const msg = new ArrayBuffer(8);
  new DataView(msg).setUint32(4, counter);
  new DataView(msg).setUint32(0, Math.floor(counter / 2 ** 32));
  const h = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
  const o = h[19] & 15;
  const n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, "0");
}

// Accepts the code for now, 30 s before or after. Returns the time step used, or null.
export async function checkCode(secret: string, code: string, lastUsed = -1): Promise<number | null> {
  const c = code.replace(/\D/g, "");
  if (c.length !== 6) return null;
  const now = Math.floor(Date.now() / 30000);
  for (const step of [now, now - 1, now + 1]) if (step > lastUsed && (await codeAt(secret, step)) === c) return step;
  return null;
}

export function qrSvg(email: string, secret: string): string {
  const uri = `otpauth://totp/${encodeURIComponent(`Sabong Central:${email}`)}?secret=${secret}&issuer=${encodeURIComponent("Sabong Central")}`;
  const q = qrcode(0, "M");
  q.addData(uri);
  q.make();
  return q.createSvgTag({ cellSize: 5, margin: 4, scalable: true });
}

const sha = async (s: string) => btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)))));

export type TwoFactor = { email: string; secret: string; enabled: number; last_step: number; backup: string };

let ready: Promise<void> | null = null;
export function ensureTotp(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await db().batch([
        db().prepare(`create table if not exists admin_2fa (email text primary key, secret text not null, enabled integer not null default 0, last_step integer not null default -1, backup text not null default '', created_at text not null default (datetime('now')))`),
        db().prepare(`create table if not exists admin_2fa_pending (token_hash text primary key, email text not null, expires_at text not null, tries integer not null default 0)`),
      ]);
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

export async function twoFactorOf(email: string): Promise<TwoFactor | null> {
  await ensureTotp();
  return db().prepare(`select * from admin_2fa where email = ?`).bind(email).first<TwoFactor>();
}

export async function beginSetup(email: string): Promise<string> {
  await ensureTotp();
  const secret = newSecret();
  await db().prepare(`insert into admin_2fa (email, secret, enabled) values (?, ?, 0) on conflict(email) do update set secret = excluded.secret, enabled = 0, backup = '', last_step = -1`).bind(email, secret).run();
  return secret;
}

// Turns 2FA on once the first code checks out. Returns 8 one-time backup codes (shown once).
export async function enable(email: string, code: string): Promise<string[] | null> {
  const t = await twoFactorOf(email);
  if (!t || t.enabled) return null;
  const step = await checkCode(t.secret, code);
  if (step === null) return null;
  const codes = Array.from({ length: 8 }, () => {
    const s = Array.from(crypto.getRandomValues(new Uint8Array(10)), (n) => "abcdefghjkmnpqrstuvwxyz23456789"[n % 31]).join("");
    return `${s.slice(0, 5)}-${s.slice(5)}`;
  });
  const hashed = await Promise.all(codes.map((c) => sha(`${email}:${c}`)));
  await db().prepare(`update admin_2fa set enabled = 1, last_step = ?, backup = ? where email = ?`).bind(step, hashed.join(","), email).run();
  return codes;
}

export async function disable(email: string) {
  await ensureTotp();
  await db().prepare(`delete from admin_2fa where email = ?`).bind(email).run();
}

// Checks an authenticator code or a backup code (each backup code works once).
export async function verifySecond(email: string, input: string): Promise<boolean> {
  const t = await twoFactorOf(email);
  if (!t || !t.enabled) return false;
  const step = await checkCode(t.secret, input, t.last_step);
  if (step !== null) {
    await db().prepare(`update admin_2fa set last_step = ? where email = ?`).bind(step, email).run();
    return true;
  }
  const h = await sha(`${email}:${input.trim().toLowerCase()}`);
  const list = t.backup.split(",").filter(Boolean);
  if (!list.includes(h)) return false;
  await db().prepare(`update admin_2fa set backup = ? where email = ?`).bind(list.filter((x) => x !== h).join(","), email).run();
  return true;
}

export const backupLeft = (t: TwoFactor) => t.backup.split(",").filter(Boolean).length;

// Between the password and the code: a 5-minute pending step (cookie sc_admin_2fa).
export async function startPending(email: string): Promise<string> {
  await ensureTotp();
  const token = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  await db().prepare(`insert into admin_2fa_pending (token_hash, email, expires_at) values (?, ?, datetime('now', '+5 minutes'))`).bind(await sha(token), email).run();
  return token;
}

export async function pendingEmail(token: string | null): Promise<{ email: string; tries: number; hash: string } | null> {
  if (!token) return null;
  await ensureTotp();
  const hash = await sha(token);
  const r = await db().prepare(`select email, tries from admin_2fa_pending where token_hash = ? and expires_at > datetime('now')`).bind(hash).first<{ email: string; tries: number }>();
  return r ? { ...r, hash } : null;
}

export async function pendingTry(hash: string, ok: boolean) {
  await db().prepare(ok ? `delete from admin_2fa_pending where token_hash = ?` : `update admin_2fa_pending set tries = tries + 1 where token_hash = ?`).bind(hash).run();
}
