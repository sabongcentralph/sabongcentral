import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { one, type Search } from "@/lib/content";
import { MEMBER_STATUSES, ROLES, STATUS_LABEL, memberTone, members, type MemberStatus } from "@/lib/members";
import { Chip, Empty, Page } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Members" };

const roleLabel = (r: string) => ROLES.find(([k]) => k === r)?.[1] ?? r;

export default async function AdminMembers({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const st = MEMBER_STATUSES.find((s) => s === one(sp.status));
  const filter = st ?? (one(sp.status) === "all" ? undefined : "pending");
  const [list, all] = await Promise.all([members(filter), members()]);
  const n = (s: MemberStatus) => all.filter((m) => m.status === s).length;
  return (
    <Page>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-serif text-[26px] font-semibold">Members & applications</h1>
        <a href="/admin/members/new" className="mb-2 w-fit rounded-full bg-crimson px-4 py-2 text-[14px] font-semibold text-white no-underline">+ Create account</a>
        <p className="m-0 text-[13.5px] text-muted">Farms, organizers, venues, sellers and suppliers with Portal accounts. Check their Facebook link before approving. No government IDs are collected.</p>
      </div>
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
        {(["pending", "active", "restricted", "suspended", "closed"] as const).map((s) => (
          <a key={s} href={`/admin/members?status=${s}`} aria-current={s === filter ? "page" : undefined}
            className={`flex min-h-9 flex-none items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold no-underline ${s === filter ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {s === "pending" ? "Applications" : STATUS_LABEL[s]}<span className="opacity-70">{n(s)}</span>
          </a>
        ))}
        <a href="/admin/members?status=all" aria-current={!filter ? "page" : undefined}
          className={`flex min-h-9 flex-none items-center rounded-full px-3.5 text-[13px] font-semibold no-underline ${!filter ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>All</a>
      </div>
      {list.length === 0 ? <Empty>{filter === "pending" ? "No applications waiting. 🎉" : "Nobody here."}</Empty> : (
        <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-2xl border border-line bg-cream p-0">
          {list.map((m) => (
            <li key={m.id}>
              <a href={`/admin/members/${m.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-ink no-underline hover:bg-white/[0.03]">
                <span className="flex min-w-0 flex-1 basis-[220px] flex-col">
                  <span className="truncate text-[14.5px] font-semibold">{m.name || m.email}</span>
                  <span className="truncate text-[12.5px] text-muted">{m.roles.map(roleLabel).join(" · ") || "No role yet"} · {m.listings} listing{m.listings === 1 ? "" : "s"}</span>
                </span>
                <span className="text-[12.5px] text-muted">{m.created_at.slice(0, 10)}</span>
                <Chip tone={memberTone(m.status)}>{STATUS_LABEL[m.status]}</Chip>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
