import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { approved, approvedOne } from "@/lib/db";
import { ArticleCard } from "@/components/cards";
import { Flag } from "@/components/icons";
import { Chip, Note, Page, Photo, SampleTag } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await approvedOne("article", (await params).slug);
  return { title: a?.data.title ?? "Article" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = await approvedOne("article", (await params).slug);
  if (!a) notFound();
  const d = a.data;
  const related = (await approved("article")).filter((x) => x.id !== a.id).sort((x, y) => Number(y.data.topic === d.topic) - Number(x.data.topic === d.topic)).slice(0, 4);
  return (
    <Page>
      <article className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
        <div className="flex gap-1.5"><Chip tone="green">{d.topic}</Chip>{a.isSample && <SampleTag />}</div>
        <h1 className="m-0 font-serif text-[30px] font-semibold leading-tight md:text-[40px]">{d.title}</h1>
        {d.summary && <p className="m-0 text-[17px] leading-relaxed text-ink-soft">{d.summary}</p>}
        <span className="text-[13px] text-muted">By {d.by}{d.org ? ` (${d.org})` : ""} · Published {d.date}{d.reviewed ? ` · Reviewed ${d.reviewed}` : ""} · {d.read}</span>
        <Photo className="h-[200px] rounded-2xl md:h-[320px]" label="Article photo" />
        {d.body.map((p, i) => <p key={i} className="m-0 text-[16px] leading-[1.75] text-ink-soft">{p}</p>)}
        {d.refs && d.refs.length > 0 && (
          <section className="flex flex-col gap-1.5">
            <h2 className="m-0 text-[16px] font-bold">References</h2>
            <ul className="m-0 flex flex-col gap-1 pl-5 text-[14px] text-ink-soft">
              {d.refs.map((r) => <li key={r}>{/^https?:\/\//.test(r) ? <a href={r} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-wine">{r}</a> : r}</li>)}
            </ul>
          </section>
        )}
        <Note>General information only, not veterinary advice. Consult a licensed veterinarian for diagnosis, treatment and medicine.</Note>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href="/learn" className="text-[14px] font-semibold text-wine">← All articles</a>
          <a href={`/report?target=${encodeURIComponent("Article: " + d.title)}`} className="flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-wine no-underline"><Flag size={15} /> Report this article</a>
        </div>
      </article>
      {related.length > 0 && (
        <section className="mx-auto flex w-full max-w-[720px] flex-col gap-3">
          <h2 className="m-0 font-serif text-[21px] font-semibold">Related articles</h2>
          <div className="grid gap-3">{related.map((x) => <ArticleCard key={x.id} a={x} />)}</div>
        </section>
      )}
    </Page>
  );
}
