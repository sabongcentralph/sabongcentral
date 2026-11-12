import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { REPORT_STATUSES, listingsNamed, reportLabel, reportNotes, reports, titleOf, type ReportStatus } from "@/lib/db";
import { one, type Search } from "@/lib/content";
import { Chip, Empty, Note, Page, btnGhost, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reports" };

const TONE: Record<string, "red" | "gold" | "green" | "plain" | "blue"> = { open: "red", investigating: "gold", escalated: "red", resolved: "green", no_action: "plain" };
const ACTIVE = ["open", "investigating", "escalated"];

export default async function AdminReports({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = one(sp.s) === "all" ? "all" : one(sp.s) === "closed" ? "closed" : REPORT_STATUSES.find(([k]) => k === one(sp.s))?.[0] ?? "active";
  const [all, notes] = await Promise.all([reports(), reportNotes()]);
  const n = (f: (s: string) => boolean) => all.filter((r) => f(r.status)).length;
  const list = all.filter((r) => tab === "all" || (tab === "active" ? ACTIVE.includes(r.status) : tab === "closed" ? !ACTIVE.includes(r.status) : r.status === tab));
  const matches = await Promise.all(list.map((r) => listingsNamed(r.target)));
  const tabs: [string, string, number][] = [
    ["active", "Needs action", n((s) => ACTIVE.includes(s))],
    ...REPORT_STATUSES.map(([k, label]) => [k, label, n((s) => s === k)] as [string, string, number]),
    ["all", "All", all.length],
  ];
  return (
    <Page>
      <h1 className="m-0 font-serif text-[26px] font-semibold">Reports</h1>
      {one(sp.error) === "note" && <Note tone="red">Please write a short note when you resolve, escalate or close a report with no action.</Note>}
      {one(sp.done) && <Note tone="green">Saved. Recorded in the activity log.</Note>}
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
        {tabs.map(([k, label, c]) => (
          <a key={k} href={k === "active" ? "/admin/reports" : `/admin/reports?s=${k}`} aria-current={k === tab ? "page" : undefined}
            className={`flex min-h-9 flex-none items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold no-underline ${k === tab ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {label}<span className="opacity-70">{c}</span>
          </a>
        ))}
      </div>
      {list.length === 0 ? <Empty>{tab === "active" ? "No reports need action. 🎉" : "Nothing here."}</Empty> : list.map((r, i) => (
        <article key={r.id} id={`r${r.id}`} className="flex flex-col gap-2.5 rounded-2xl border border-line bg-cream p-4">
          <div className="flex flex-wrap items-center gap-2"><Chip tone={TONE[r.status] ?? "plain"}>{reportLabel(r.status)}</Chip><span className="text-[12px] text-muted">#{r.id} · {r.created_at}</span></div>
          <h2 className="m-0 text-[16px] font-bold">{r.target}</h2>
          <span className="text-[14px] font-semibold text-wine">{r.reason}</span>
          {r.details && <p className="m-0 whitespace-pre-line text-[14px] text-ink-soft">{r.details}</p>}
          {r.contact && <span className="text-[13px] text-muted">Reporter contact (private): {r.contact}</span>}
          {matches[i].length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="text-muted">Listing:</span>
              {matches[i].map((l) => <a key={l.id} href={`/admin/item/${l.id}`} className="rounded-full border border-line bg-ivory px-3 py-1 font-semibold text-ink no-underline">{titleOf(l)} · {l.status === "approved" ? "live" : l.status} ›</a>)}
            </div>
          )}
          {(notes.get(r.id) ?? []).length > 0 && (
            <ol className="m-0 flex list-none flex-col gap-1 border-l-2 border-line pl-3 text-[13px]">
              {notes.get(r.id)!.map((x) => (
                <li key={x.id}><span className="text-muted">{x.created_at} · {x.admin}</span>{x.status && <> · <strong>{reportLabel(x.status)}</strong></>}{x.body && <> · {x.body}</>}</li>
              ))}
            </ol>
          )}
          <form action="/api/admin/inbox" method="post" className="grid gap-2 sm:grid-cols-[180px_1fr_auto] sm:items-end">
            <input type="hidden" name="what" value="report" /><input type="hidden" name="id" value={r.id} />
            <label className={labelCls}>Status
              <select name="status" defaultValue={r.status as ReportStatus} className={input}>{REPORT_STATUSES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}</select>
            </label>
            <label className={labelCls}>Note (private, logged)<input name="note" maxLength={500} placeholder="What you checked or did" className={input} /></label>
            <button type="submit" className={btnGhost}>Save</button>
          </form>
        </article>
      ))}
      <p className="m-0 text-[12px] text-muted">To hide a listing while you investigate, open it and press “Hide from public”. Escalate anything that may need the authorities (scams, threats, illegal sales).</p>
    </Page>
  );
}
