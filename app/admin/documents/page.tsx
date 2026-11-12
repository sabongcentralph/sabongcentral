import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { one, type Search } from "@/lib/content";
import { allDocs, daysToExpiry } from "@/lib/docs";
import { AdminDocCard } from "@/components/admin/DocCard";
import { Empty, Note, Page } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Documents" };

const TABS = [["pending", "Waiting for review"], ["expiring", "Expiring or expired"], ["approved", "Approved"], ["rejected", "Not accepted"], ["all", "All"]] as const;

export default async function AdminDocuments({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find(([k]) => k === one(sp.s))?.[0] ?? "pending";
  const open = Number(one(sp.open)) || 0;
  const all = await allDocs();
  const expiring = (d: (typeof all)[number]) => d.status === "approved" && (daysToExpiry(d) ?? 999) <= 30;
  const pick = (k: string) => all.filter((d) => (k === "all" ? true : k === "expiring" ? expiring(d) : d.status === k));
  const list = pick(tab);
  const next = tab === "pending" ? "/admin/documents" : `/admin/documents?s=${tab}`;
  return (
    <Page>
      <h1 className="m-0 font-serif text-[26px] font-semibold">Business documents</h1>
      <p className="m-0 text-[13.5px] text-muted">Photos of business papers members upload for the Business Verified badge. Private: only admins can open them, and every view is logged. No government IDs.</p>
      {one(sp.error) === "note" && <Note tone="red">Please write a short note so the member knows why it wasn’t accepted.</Note>}
      {one(sp.done) && <Note tone="green">Saved. Recorded in the activity log.</Note>}
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
        {TABS.map(([k, label]) => (
          <a key={k} href={k === "pending" ? "/admin/documents" : `/admin/documents?s=${k}`} aria-current={k === tab ? "page" : undefined}
            className={`flex min-h-9 flex-none items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold no-underline ${k === tab ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {label}<span className="opacity-70">{pick(k).length}</span>
          </a>
        ))}
      </div>
      {list.length === 0 ? <Empty>{tab === "pending" ? "No documents waiting. 🎉" : "Nothing here."}</Empty>
        : list.map((d) => <AdminDocCard key={d.id} d={d} who={{ name: d.name, email: d.email, href: `/admin/members/${d.member_id}` }} open={open === d.id} next={next} />)}
    </Page>
  );
}
