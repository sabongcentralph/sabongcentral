import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { QUEUE, audit, byStatus, counts, flagsOf, openReportTargets, queueStatus, stages, titleOf, type Listing, type QueueStatus } from "@/lib/db";
import { one, type Search } from "@/lib/content";
import { AdminNav } from "@/components/AdminNav";
import { Chip, Empty, Page, btnGhost, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin" };

// Queue types: events are split into derbies and seminars/training.
const TYPES = ["Farm", "Event", "Seminar/Training", "Market", "Supplier", "Reel", "Article", "Announcement"] as const;
type QType = (typeof TYPES)[number];
const KIND_TYPE = { farm: "Farm", good: "Market", supplier: "Supplier", reel: "Reel", article: "Article", notice: "Announcement", event: "Event" } as const;
function typeOf(l: Listing): QType {
  if (l.kind === "event") return (l.data as { derby?: boolean }).derby ? "Event" : "Seminar/Training";
  return KIND_TYPE[l.kind];
}
const RISKS = ["Permit needed", "Report received", "Possible prohibited content"] as const;
const tone = (q: QueueStatus) => (q === "Approved" ? "green" : q === "Rejected" || q === "Hidden" ? "red" : q === "Needs Changes" || q === "In Review" ? "gold" : "plain") as "green" | "red" | "gold" | "plain";

export default async function AdminHome({ searchParams }: { searchParams: Promise<Search> }) {
  const email = await requireAdmin();
  const sp = await searchParams;
  const q = (QUEUE as readonly string[]).includes(one(sp.q)) ? (one(sp.q) as QueueStatus) : one(sp.q) === "All" ? "All" : "New";
  const type = TYPES.find((t) => t === one(sp.type));
  const risk = RISKS.find((r) => r === one(sp.risk));
  const who = one(sp.who).toLowerCase(), where = one(sp.where).toLowerCase();
  const [all, st, c, log, targets] = await Promise.all([byStatus("all"), stages(), counts(), audit(15), openReportTargets()]);
  const rows = all.map((l) => ({ l, qs: queueStatus(l.status, st.get(l.id)), type: typeOf(l), flags: flagsOf(l, targets) }));
  const tally = (s: QueueStatus) => rows.filter((r) => r.qs === s).length;
  const placeOf = (l: Listing) => { const d = l.data as { province?: string; city?: string }; return `${d.city ?? ""} ${d.province ?? ""}`.toLowerCase(); };
  const list = rows.filter((r) => (q === "All" || r.qs === q) && (!type || r.type === type) && (!risk || r.flags.includes(risk)) &&
    (!who || (r.l.submittedBy ?? "").toLowerCase().includes(who)) && (!where || placeOf(r.l).includes(where)));
  const link = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, type, risk, who: one(sp.who), where: one(sp.where), ...o })) if (v && !(k === "q" && v === "New")) p.set(k, v);
    const s = p.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  return (
    <Page>
      <AdminNav email={email} at="/admin" counts={c} />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {([
          ["New submissions", tally("New"), link({ q: "New", type: undefined, risk: undefined })],
          ["Needs changes", tally("Needs Changes"), link({ q: "Needs Changes", type: undefined, risk: undefined })],
          ["Permit needed", rows.filter((r) => r.flags.includes("Permit needed") && r.l.status === "pending").length, link({ q: "All", risk: "Permit needed" })],
          ["Open reports", c.reports, "/admin/reports"],
          ["New messages", c.messages, "/admin/messages"],
        ] as const).map(([l, n, href]) => (
          <a key={l} href={href} className="rounded-2xl border border-line bg-cream p-3 text-ink no-underline">
            <div className="font-serif text-[28px] font-semibold text-crimson">{n}</div>
            <div className="text-[13px] text-muted">{l}</div>
          </a>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-[13px]">
        <a href="/admin/reports" className="rounded-full border border-line bg-cream px-3.5 py-2 font-semibold text-ink no-underline">Review reports</a>
        <span className="rounded-full border border-dashed border-line px-3.5 py-2 text-muted">Member applications and the advisory editor: coming next</span>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-serif text-[20px] font-semibold">Review queue</h2>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
          {[...QUEUE, "All"].map((s) => (
            <a key={s} href={link({ q: s })} aria-current={s === q ? "page" : undefined}
              className={`flex min-h-9 flex-none items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold no-underline ${s === q ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
              {s}{s !== "All" && <span className="opacity-70">{tally(s as QueueStatus)}</span>}
            </a>
          ))}
        </div>
        <form method="get" action="/admin" className="grid gap-2 rounded-2xl border border-line bg-cream p-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          {q !== "New" && <input type="hidden" name="q" value={q} />}
          <label className={labelCls}>Type<select name="type" defaultValue={type ?? ""} className={input}><option value="">All types</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label className={labelCls}>Risk<select name="risk" defaultValue={risk ?? ""} className={input}><option value="">Any</option>{RISKS.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label className={labelCls}>Submitter<input name="who" defaultValue={one(sp.who)} className={input} /></label>
          <label className={labelCls}>Province / city<input name="where" defaultValue={one(sp.where)} className={input} /></label>
          <button type="submit" className={btnGhost}>Filter</button>
        </form>
        {list.length === 0 ? <Empty>{q === "New" ? "Nothing waiting for review. 🎉" : "Nothing here."}</Empty> : (
          <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-2xl border border-line bg-cream p-0">
            {list.map(({ l, qs, type: t, flags }) => (
              <li key={l.id}>
                <a href={`/admin/item/${l.id}`} className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-ink no-underline">
                  <Chip tone="plain">{t}</Chip>
                  <span className="min-w-0 flex-1 text-[14.5px] font-semibold">{titleOf(l)}</span>
                  {flags.map((f) => <Chip key={f} tone="red">{f}</Chip>)}
                  <Chip tone={tone(qs)}>{qs}</Chip>
                  <span className="w-full text-[12px] text-muted md:w-auto">{l.submittedBy ?? "—"} · {l.createdAt.slice(0, 16)}{l.isSample ? " · sample" : ""}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="m-0 font-serif text-[20px] font-semibold">Activity log</h2>
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[13px] text-ink-soft">
          {log.length === 0 && <li className="text-muted">No activity yet.</li>}
          {log.map((a) => (
            <li key={a.id}><span className="text-muted">{a.created_at.slice(0, 16)}</span> · <strong>{a.action}</strong> · {a.target}{a.reason ? ` · “${a.reason}”` : ""} · {a.admin}</li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
