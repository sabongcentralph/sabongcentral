import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { audit, byStatus, counts, titleOf, KINDS, type Kind, type Status } from "@/lib/db";
import { one, type Search } from "@/lib/content";
import { AdminNav } from "@/components/AdminNav";
import { Chip, Empty, Page, statusTone } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin" };

const LABEL: Record<Kind, string> = { farm: "Farm", event: "Event", good: "Goods", reel: "Reel", article: "Article", notice: "Notice", supplier: "Supplier" };
const STATUSES = ["pending", "approved", "rejected", "hidden", "all"] as const;

export default async function AdminHome({ searchParams }: { searchParams: Promise<Search> }) {
  const email = await requireAdmin();
  const sp = await searchParams;
  const status = (STATUSES.find((s) => s === one(sp.status)) ?? "pending") as Status | "all";
  const kind = KINDS.find((k) => k === one(sp.kind));
  const [list, c, log] = await Promise.all([byStatus(status, kind), counts(), audit(15)]);
  const link = (s: string, k?: string) => `/admin?status=${s}${k ? `&kind=${k}` : ""}`;

  return (
    <Page>
      <AdminNav email={email} at={status === "approved" ? "/admin?status=approved" : "/admin"} counts={c} />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[["Pending", c.pending, "pending"], ["Live", c.approved, "approved"], ["Open reports", c.reports, ""], ["New messages", c.messages, ""]].map(([l, n, s]) => (
          <a key={l} href={s ? link(String(s)) : l === "Open reports" ? "/admin/reports" : "/admin/messages"} className="rounded-2xl border border-line bg-cream p-3 text-ink no-underline">
            <div className="font-serif text-[28px] font-semibold text-crimson">{n}</div>
            <div className="text-[13px] text-muted">{l}</div>
          </a>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
          {STATUSES.map((s) => (
            <a key={s} href={link(s, kind)} aria-current={s === status ? "page" : undefined}
              className={`flex min-h-9 flex-none items-center rounded-full px-3.5 text-[13px] font-semibold capitalize no-underline ${s === status ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>{s}</a>
          ))}
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
          {[undefined, ...KINDS].map((k) => (
            <a key={k ?? "all"} href={link(status, k)} aria-current={k === kind ? "page" : undefined}
              className={`flex min-h-9 flex-none items-center rounded-full px-3 text-[12.5px] font-semibold no-underline ${k === kind ? "bg-ink-soft text-white" : "border border-line bg-cream text-muted"}`}>{k ? LABEL[k] : "Lahat ng uri"}</a>
          ))}
        </div>
        {list.length === 0 ? <Empty>{status === "pending" ? "Walang naghihintay ng review. 🎉" : "Wala dito."}</Empty> : (
          <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-2xl border border-line bg-cream p-0">
            {list.map((l) => (
              <li key={l.id}>
                <a href={`/admin/item/${l.id}`} className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-ink no-underline">
                  <Chip tone="plain">{LABEL[l.kind]}</Chip>
                  <span className="min-w-0 flex-1 text-[14.5px] font-semibold">{titleOf(l)}</span>
                  <Chip tone={statusTone(l.status)}>{l.status}</Chip>
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
          {log.length === 0 && <li className="text-muted">Wala pang activity.</li>}
          {log.map((a) => (
            <li key={a.id}><span className="text-muted">{a.created_at.slice(0, 16)}</span> · <strong>{a.action}</strong> · {a.target}{a.reason ? ` · “${a.reason}”` : ""} · {a.admin}</li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
