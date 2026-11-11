import type { Metadata } from "next";
import { approved } from "@/lib/db";
import { one, type Search } from "@/lib/content";
import { RESOURCES } from "@/lib/sample";
import { ArticleCard } from "@/components/cards";
import { Empty, Page, PageHead } from "@/components/ui";
import { DownloadIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Learning Hub" };

export default async function LearnPage({ searchParams }: { searchParams: Promise<Search> }) {
  const topic = one((await searchParams).topic);
  const all = await approved("article");
  const topics = [...new Set(all.map((a) => a.data.topic))];
  const shown = all.filter((a) => !topic || a.data.topic === topic);
  return (
    <Page>
      <PageHead kicker="Learning Hub" title="Articles & Guides" sub="Breeding, nutrition, health at farm management, mula sa breeders at beterinaryo. Ni-review ng admin." />
      <nav aria-label="Topics" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {["", ...topics, "Downloads"].map((t) => (
          <a key={t || "all"} href={t ? `/learn?topic=${encodeURIComponent(t)}` : "/learn"} aria-current={t === topic ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${t === topic ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {t || "Lahat"}
          </a>
        ))}
      </nav>
      {topic === "Downloads" ? (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[21px] font-semibold">Breeder Resources</h2>
          <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
            {RESOURCES.map(([name, meta]) => (
              <li key={name} className="flex items-center gap-3 rounded-2xl border border-line bg-cream p-4">
                <DownloadIcon className="flex-none text-crimson" />
                <div className="flex flex-1 flex-col"><span className="text-[15px] font-bold">{name}</span><span className="text-[12.5px] text-muted">{meta} · libre</span></div>
                <span className="text-[12px] font-semibold text-muted">Malapit na</span>
              </li>
            ))}
          </ul>
        </section>
      ) : shown.length === 0 ? <Empty>Wala pang articles dito.</Empty> : (
        <div className="grid gap-3 md:grid-cols-2">{shown.map((a) => <ArticleCard key={a.id} a={a} />)}</div>
      )}
    </Page>
  );
}
