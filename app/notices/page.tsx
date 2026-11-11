import type { Metadata } from "next";
import { approved } from "@/lib/db";
import { one, type Search } from "@/lib/content";
import { NoticeCard } from "@/components/cards";
import { Empty, Note, Page, PageHead } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Community Notices" };

const KINDS = ["Official Advisories", "Safety Warnings", "Farm Announcements"];

export default async function NoticesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const kind = one((await searchParams).kind);
  const shown = (await approved("notice")).filter((n) => !kind || n.data.kind === kind);
  return (
    <Page>
      <PageHead kicker="Community Notices" title="Mga Paalala at Anunsyo" sub="Official advisories, safety warnings at farm announcements na ni-review ng admin." />
      <nav aria-label="Notice types" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {["", ...KINDS].map((k) => (
          <a key={k || "all"} href={k ? `/notices?kind=${encodeURIComponent(k)}` : "/notices"} aria-current={k === kind ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${k === kind ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {k || "Lahat"}
          </a>
        ))}
      </nav>
      <Note tone="red">Ang official advisories ay galing lang sa DA, BAI o provincial vet office, may petsa at link sa source. SAMPLE ang advisories dito sa test site.</Note>
      {shown.length === 0 ? <Empty>Walang notices.</Empty> : <div className="grid gap-3 md:grid-cols-2">{shown.map((n) => <NoticeCard key={n.id} n={n} />)}</div>}
      <p className="m-0 text-[13px] text-muted">May farm announcement ka? I-submit sa <a href="/portal" className="font-semibold text-wine">Portal</a>. Admin lang ang nagpo-post ng official advisories.</p>
    </Page>
  );
}
