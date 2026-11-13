import { REEL_TOPICS } from "@/lib/sample";
import type { Metadata } from "next";
import { approved } from "@/lib/db";
import { shuffled } from "@/lib/feed";
import { one, type Search } from "@/lib/content";
import { ReelCard } from "@/components/cards";
import { Empty, Note, Page, PageHead } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reels" };

export default async function ReelsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const topic = one((await searchParams).topic);
  const all = await approved("reel");
  const topics = REEL_TOPICS;
  const shown = topic ? all.filter((r) => r.data.topic === topic) : shuffled(all); // shuffled unless filtered (Em, 2026-11-13)
  return (
    <Page>
      <PageHead kicker="Educational Reels" title="Reels" sub="Short videos on feeding, health, housing and farm management, from farms' Facebook, YouTube and TikTok." />
      <nav aria-label="Topics" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {["", ...topics].map((t) => (
          <a key={t || "all"} href={t ? `/reels?topic=${encodeURIComponent(t)}` : "/reels"} aria-current={t === topic ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${t === topic ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {t || "All"}
          </a>
        ))}
      </nav>
      {shown.length === 0 ? <Empty>No reels here yet.</Empty> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{shown.map((r) => <ReelCard key={r.id} r={r} />)}</div>
      )}
      <Note>Educational only: no fight footage, betting content or animal cruelty. Every reel is reviewed by an admin before it goes live. <a href="/submit?tab=reel" className="font-semibold text-wine">Submit a reel</a></Note>
    </Page>
  );
}
