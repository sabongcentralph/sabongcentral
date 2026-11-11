import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { counts, reports } from "@/lib/db";
import { AdminNav } from "@/components/AdminNav";
import { Chip, Empty, Page, btnGhost, input } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reports" };

export default async function AdminReports() {
  const email = await requireAdmin();
  const [list, c] = await Promise.all([reports(), counts()]);
  return (
    <Page>
      <AdminNav email={email} at="/admin/reports" counts={c} />
      <h1 className="m-0 font-serif text-[26px] font-semibold">Reports</h1>
      {list.length === 0 ? <Empty>No reports yet.</Empty> : list.map((r) => (
        <article key={r.id} className="flex flex-col gap-2 rounded-2xl border border-line bg-cream p-4">
          <div className="flex flex-wrap items-center gap-2"><Chip tone={r.status === "open" ? "red" : "green"}>{r.status}</Chip><span className="text-[12px] text-muted">#{r.id} · {r.created_at}</span></div>
          <h2 className="m-0 text-[16px] font-bold">{r.target}</h2>
          <span className="text-[14px] font-semibold text-wine">{r.reason}</span>
          {r.details && <p className="m-0 whitespace-pre-line text-[14px] text-ink-soft">{r.details}</p>}
          {r.contact && <span className="text-[13px] text-muted">Reporter contact: {r.contact}</span>}
          <form action="/api/admin/inbox" method="post" className="flex flex-wrap gap-2">
            <input type="hidden" name="what" value="report" /><input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="status" value={r.status === "open" ? "resolved" : "open"} />
            {r.status === "open" && <input name="note" placeholder="Resolution note (logged)" className={`${input} max-w-[360px]`} />}
            <button type="submit" className={btnGhost}>{r.status === "open" ? "Mark resolved" : "Reopen"}</button>
          </form>
        </article>
      ))}
      <p className="m-0 text-[12px] text-muted">To hide a listing while you investigate, open it from the Live list and press “Hide from public”.</p>
    </Page>
  );
}
