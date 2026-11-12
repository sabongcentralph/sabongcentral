import { pendingMembers } from "./members";
import { docCounts } from "./docs";
import { audit, byStatus, counts, editIds, flagsOf, openReportTargets, queueStatus, stages, type Flag, type Listing, type QueueStatus } from "./db";

// Queue types: events are split into derbies and seminars/training.
export const TYPES = ["Farm", "Event", "Seminar/Training", "Venue/Organizer", "Market", "Supplier", "Reel", "Article", "Announcement"] as const;
export type QType = (typeof TYPES)[number];
const KIND_TYPE = { farm: "Farm", good: "Market", supplier: "Supplier", reel: "Reel", article: "Article", notice: "Announcement", event: "Event", venue: "Venue/Organizer" } as const;
export function typeOf(l: Listing): QType {
  if (l.kind === "event") return (l.data as { derby?: boolean }).derby ? "Event" : "Seminar/Training";
  return KIND_TYPE[l.kind];
}

export type Row = { l: Listing; qs: QueueStatus; type: QType; flags: Flag[]; edit: boolean };

export async function queueRows(): Promise<Row[]> {
  const [all, st, targets, ed] = await Promise.all([byStatus("all"), stages(), openReportTargets(), editIds()]);
  const edits = new Set(ed);
  return all.map((l) => ({ l, qs: queueStatus(l.status, st.get(l.id), l.reason), type: typeOf(l), flags: flagsOf(l, targets), edit: edits.has(l.id) }));
}

// Everything the admin header bell and the dashboard need, in one pass.
export async function adminSummary() {
  const [rows, c, log, applications, dc] = await Promise.all([queueRows(), counts(), audit(6), pendingMembers(), docCounts()]);
  const by = (s: QueueStatus) => rows.filter((r) => r.qs === s);
  const waiting = rows.filter((r) => r.qs === "New" || r.qs === "In Review");
  const permits = rows.filter((r) => r.l.status === "pending" && r.flags.includes("Permit needed"));
  const risky = rows.filter((r) => r.l.status === "pending" && r.flags.includes("Possible prohibited content"));
  const live = by("Approved");
  const places = live.map((r) => r.l.data as { province?: string; city?: string }).filter((d) => d.province && d.province !== "Online");
  return {
    rows, log, applications,
    newCount: by("New").length,
    edits: rows.filter((r) => r.edit).length,
    docs: dc.pending,
    docsExpiring: dc.expiring,
    waiting, permits, risky, live,
    needsChanges: by("Needs Changes").length,
    reports: c.reports ?? 0,
    messages: c.messages ?? 0,
    provinces: new Set(places.map((d) => d.province)).size,
    cities: new Set(places.map((d) => `${d.city}|${d.province}`)).size,
    events: rows.filter((r) => r.l.kind === "event" && r.qs !== "Archived").slice(0, 5),
  };
}
export type Summary = Awaited<ReturnType<typeof adminSummary>>;

// The short list the bell shows: only things that need the admin, never zeros.
export function alertsOf(s: Summary): { label: string; n: number; href: string; tone: "red" | "gold" }[] {
  return [
    { label: "new submissions to review", n: s.newCount, href: "/admin/queue", tone: "red" as const },
    { label: "edits to live listings", n: s.edits, href: "/admin/queue?q=Edits", tone: "red" as const },
    { label: "member applications", n: s.applications, href: "/admin/members", tone: "red" as const },
    { label: "business documents to check", n: s.docs, href: "/admin/documents", tone: "red" as const },
    { label: "documents expiring within 30 days", n: s.docsExpiring, href: "/admin/documents?s=expiring", tone: "gold" as const },
    { label: "derby permits to check", n: s.permits.length, href: "/admin/queue?q=All&risk=Permit+needed", tone: "red" as const },
    { label: "possible prohibited content", n: s.risky.length, href: "/admin/queue?q=All&risk=Possible+prohibited+content", tone: "red" as const },
    { label: "reports needing action", n: s.reports, href: "/admin/reports", tone: "red" as const },
    { label: "new messages", n: s.messages, href: "/admin/messages", tone: "gold" as const },
  ].filter((a) => a.n > 0);
}
