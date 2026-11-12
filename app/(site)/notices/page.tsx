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
      <PageHead kicker="Community Notices" title="Advisories & Announcements" sub="Official advisories, safety warnings and farm announcements, reviewed by an admin." />
      <nav aria-label="Notice types" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {["", ...KINDS].map((k) => (
          <a key={k || "all"} href={k ? `/notices?kind=${encodeURIComponent(k)}` : "/notices"} aria-current={k === kind ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${k === kind ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {k || "All"}
          </a>
        ))}
      </nav>
      <Note tone="red">Official advisories come only from government sources such as the DA, BAI or a provincial vet office, and are posted by admins with a link to the source. The advisories on this test site are SAMPLES.</Note>
      {shown.length === 0 ? <Empty>No notices.</Empty> : <div className="grid gap-3 md:grid-cols-2">{shown.map((n) => <NoticeCard key={n.id} n={n} />)}</div>}
      <p className="m-0 text-[13px] text-muted">Have a farm or community announcement? <a href="/submit?tab=notice" className="font-semibold text-wine">Submit it here</a> (no account needed) or through your Portal. Only admins post official advisories, always with the issuer, date, area and official source.</p>
    </Page>
  );
}
