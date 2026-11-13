import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListedBy } from "@/components/ListedBy";
import { approved, approvedOne } from "@/lib/db";
import { toEmbed } from "@/lib/embed";
import { ReelCard } from "@/components/cards";
import { Chip, Note, Page, Photo, SampleTag } from "@/components/ui";
import { Flag } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = await approvedOne("reel", (await params).slug);
  return { title: r?.data.title ?? "Reel" };
}

export default async function ReelPage({ params }: { params: Promise<{ slug: string }> }) {
  const r = await approvedOne("reel", (await params).slug);
  if (!r) notFound();
  const d = r.data;
  const embed = toEmbed(d.url);
  const more = (await approved("reel")).filter((x) => x.id !== r.id).sort((x, y) => Number(y.data.topic === d.topic) - Number(x.data.topic === d.topic)).slice(0, 4);
  return (
    <Page>
      <div className="grid gap-5 md:grid-cols-[minmax(0,420px)_1fr]">
        <div className="mx-auto w-full max-w-[420px]">
          {embed ? (
            <div className={`overflow-hidden rounded-2xl bg-black ${embed.vertical ? "aspect-[9/16]" : "aspect-video"}`}>
              <iframe src={embed.src} title={d.title} className="size-full border-0" loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin" />
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl">
              <Photo className="aspect-[9/16]" label="Video placeholder" />
              <p className="absolute inset-x-4 bottom-4 m-0 rounded-xl bg-black/60 p-3 text-center text-[13px] text-white">
                Sample reel: no video link yet. On a real listing, the embedded {d.platform} video plays here.
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5"><Chip tone="green">{d.topic}</Chip><Chip tone="plain">{embed?.platform ?? d.platform}</Chip>{r.isSample && <SampleTag />}</div>
          <h1 className="m-0 font-serif text-[26px] font-semibold leading-tight">{d.title}</h1>
          {d.farmSlug ? <a href={`/farms/${d.farmSlug}`} className="text-[15px] font-semibold text-wine">{d.farm}</a> : <span className="text-[15px] font-semibold">{d.farm}</span>}
          {d.desc && <p className="m-0 text-[15px] leading-relaxed text-ink-soft">{d.desc}</p>}
          {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold text-wine">Watch on {embed?.platform ?? d.platform} ↗</a>}
          <Note>External content: this video is embedded from {embed?.platform ?? d.platform} and is not hosted by Sabong Sentral. Educational content only: no fight footage, betting, animal cruelty or prohibited products.</Note>
          <ListedBy data={d} title={d.title} />
          <a href={`/report?target=${encodeURIComponent("Reel: " + d.title)}`} className="flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-wine no-underline"><Flag size={15} /> Report this reel</a>
        </div>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-serif text-[21px] font-semibold">Related reels</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{more.map((x) => <ReelCard key={x.id} r={x} />)}</div>
      </section>
    </Page>
  );
}
