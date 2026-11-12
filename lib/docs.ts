import { db, logAction, setVerified } from "./db";
import { ensureMembers, listingsOf, type Member } from "./members";
import { photoStore } from "./media";

// Private business documents (Em, 2026-11-12: photos only, no PDF, no government IDs).
// Stored in R2 under d/ and served only to signed-in admins; every view is logged.
export const DOC_TYPES = [
  "DTI business name registration", "SEC registration", "Mayor’s / business permit", "BIR certificate of registration",
  "LGU event permit", "Cockpit license", "Barangay clearance (business)", "Other business paper",
] as const;
export const DOC_STATUSES = [["pending", "Waiting for review"], ["approved", "Approved"], ["rejected", "Not accepted"]] as const;
export type DocStatus = (typeof DOC_STATUSES)[number][0];
export const docLabel = (s: string) => DOC_STATUSES.find(([k]) => k === s)?.[1] ?? s;
export const MAX_DOC_BYTES = 1_500_000; // after the browser shrinks it
export const MAX_DOC_PAGES = 3;
const TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
export const DOC_KEY_RE = /^d\/[\w-]+\.(webp|jpg|png)$/;

export type Doc = {
  id: number; member_id: number; type: string; keys: string[]; expires: string | null; status: DocStatus;
  note: string | null; reviewer: string | null; created_at: string; reviewed_at: string | null;
};
type DocRow = Omit<Doc, "keys"> & { keys: string };
const toDoc = (r: DocRow): Doc => ({ ...r, keys: r.keys.split(",").filter(Boolean) });

let ready: Promise<void> | null = null;
function ensureDocs(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await ensureMembers();
      const d = db();
      await d.batch([
        d.prepare(`create table if not exists member_docs (
          id integer primary key autoincrement, member_id integer not null, type text not null, keys text not null,
          expires text, status text not null default 'pending', note text, reviewer text,
          created_at text not null default (datetime('now')), reviewed_at text)`),
        d.prepare(`create index if not exists member_docs_m on member_docs (member_id)`),
      ]);
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

// Days until expiry (null = no expiry date given).
export function daysToExpiry(d: Pick<Doc, "expires">): number | null {
  if (!d.expires) return null;
  return Math.ceil((Date.parse(d.expires + "T23:59:59+08:00") - Date.now()) / 86_400_000);
}
export const isValid = (d: Doc) => d.status === "approved" && (daysToExpiry(d) ?? 1) > 0;

export function badDoc(files: File[]): string | null {
  if (!files.length) return "Please add a photo of the document.";
  for (const f of files) {
    if (!TYPES[f.type]) return "Documents must be photos (JPG, PNG or WebP). PDF files are not accepted.";
    if (f.size > MAX_DOC_BYTES) return "A photo is too large. Please take a smaller photo.";
  }
  return null;
}

export async function addDoc(m: Member, type: string, expires: string, files: File[]): Promise<void> {
  await ensureDocs();
  const store = await photoStore();
  if (!store) throw new Error("storage off");
  const keys: string[] = [];
  for (const f of files) {
    const key = `d/${crypto.randomUUID()}.${TYPES[f.type]}`;
    await store.put(key, await f.arrayBuffer(), { httpMetadata: { contentType: f.type } });
    keys.push(key);
  }
  await db().prepare(`insert into member_docs (member_id, type, keys, expires) values (?, ?, ?, ?)`).bind(m.id, type, keys.join(","), expires || null).run();
  await logAction(`${m.name || m.email} (member #${m.id})`, "document uploaded", `member #${m.id}: ${type}`);
}

export async function docsOf(memberId: number): Promise<Doc[]> {
  await ensureDocs();
  return (await db().prepare(`select * from member_docs where member_id = ? order by id desc`).bind(memberId).all<DocRow>()).results.map(toDoc);
}

export async function docById(id: number): Promise<Doc | null> {
  await ensureDocs();
  const r = await db().prepare(`select * from member_docs where id = ?`).bind(id).first<DocRow>();
  return r ? toDoc(r) : null;
}

export type DocWithMember = Doc & { name: string; email: string };
export async function allDocs(): Promise<DocWithMember[]> {
  await ensureDocs();
  const { results } = await db().prepare(`select d.*, m.name, m.email from member_docs d join members m on m.id = d.member_id order by (d.status = 'pending') desc, d.id desc limit 500`).all<DocRow & { name: string; email: string }>();
  return results.map((r) => ({ ...toDoc(r), name: r.name, email: r.email }));
}

export async function docCounts(): Promise<{ pending: number; expiring: number }> {
  const all = await allDocs();
  return {
    pending: all.filter((d) => d.status === "pending").length,
    expiring: all.filter((d) => d.status === "approved" && (daysToExpiry(d) ?? 999) <= 30).length,
  };
}

// Approving a document gives the Business Verified badge to the member's farms and Market items.
export async function reviewDoc(id: number, approve: boolean, admin: string, note: string, badge: boolean) {
  const doc = await docById(id);
  if (!doc) return;
  await db().prepare(`update member_docs set status = ?, note = ?, reviewer = ?, reviewed_at = datetime('now') where id = ?`)
    .bind(approve ? "approved" : "rejected", note || null, admin, id).run();
  await logAction(admin, approve ? "document approved" : "document rejected", `member #${doc.member_id}: ${doc.type}`, note);
  if (approve && badge) {
    for (const { l } of await listingsOf(doc.member_id)) {
      if ((l.kind === "farm" || l.kind === "good") && l.status === "approved") await setVerified(l.id, true, admin);
    }
  }
}

// Deleting removes the photos from storage too (retention: keep only what is needed).
export async function deleteDoc(doc: Doc, who: string) {
  const store = await photoStore();
  if (store) for (const k of doc.keys) await store.delete(k);
  await db().prepare(`delete from member_docs where id = ?`).bind(doc.id).run();
  await logAction(who, "document deleted", `member #${doc.member_id}: ${doc.type}`);
}

// New farm/Market listings from a member with a valid approved document start with the badge.
export async function hasValidDoc(memberId: number): Promise<boolean> {
  return (await docsOf(memberId)).some(isValid);
}

