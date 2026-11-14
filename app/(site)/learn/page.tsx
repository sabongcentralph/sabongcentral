import type { Metadata } from "next";
import { shuffled } from "@/lib/feed";
import { approved } from "@/lib/db";
import { one, type Search } from "@/lib/content";
import { ARTICLE_TOPICS, RESOURCES } from "@/lib/sample";
import { ArticleCard } from "@/components/cards";
import { Empty, Page, PageHead } from "@/components/ui";
import { DownloadIcon } from "@/components/icons";
import { LearnSwitch } from "@/components/LearnSwitch";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Learn" };

export default async function LearnPage({ searchParams }: { searchParams: Promise<Search> }) {
  const topic = one((await searchParams).topic);
  const all = await approved("article");
  const topics = ARTICLE_TOPICS;
  const shown = topic ? all.filter((a) => a.data.topic === topic) : shuffled(all); // shuffled unless filtered (Em, 2026-11-13)
  return (
    <Page>
      <PageHead kicker="Learn & Grow" title="Learn" sub="Seminars, workshops, training, webinars and expos, plus articles and guides from breeders and veterinarians." />
      <LearnSwitch at="articles" />
      <nav aria-label="Topics" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {["", ...topics, "Downloads"].map((t) => (
          <a key={t || "all"} href={t ? `/learn?topic=${encodeURIComponent(t)}` : "/learn"} aria-current={t === topic ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${t === topic ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {t || "All"}
          </a>
        ))}
      </nav>
      <p className="m-0 text-[13.5px] text-ink-soft">Every article is reviewed by an admin. Want to share your knowledge? <a href="/submit?tab=article" className="font-semibold text-wine">Submit an article</a>.</p>
      {topic === "Downloads" ? (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[21px] font-semibold">Breeder Resources</h2>
          <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
            {RESOURCES.map(([name, meta]) => (
              <li key={name} className="flex items-center gap-3 rounded-2xl border border-line bg-cream p-4">
                <DownloadIcon className="flex-none text-crimson" />
                <div className="flex flex-1 flex-col"><span className="text-[15px] font-bold">{name}</span><span className="text-[12.5px] text-muted">{meta} · free</span></div>
                <span className="text-[12px] font-semibold text-muted">Coming soon</span>
              </li>
            ))}
          </ul>
        </section>
      ) : shown.length === 0 ? <Empty>No articles here yet.</Empty> : (
        <div className="grid gap-3 md:grid-cols-2">{shown.map((a) => <ArticleCard key={a.id} a={a} />)}</div>
      )}
    </Page>
  );
}
