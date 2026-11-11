import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { approvedOne } from "@/lib/db";
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
  return (
    <Page>
      <article className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
        <div className="flex gap-1.5"><Chip tone="green">{d.topic}</Chip>{a.isSample && <SampleTag />}</div>
        <h1 className="m-0 font-serif text-[30px] font-semibold leading-tight md:text-[40px]">{d.title}</h1>
        <span className="text-[13px] text-muted">{d.by} · {d.date} · {d.read}</span>
        <Photo className="h-[200px] rounded-2xl md:h-[320px]" label="Article photo" />
        {d.body.map((p, i) => <p key={i} className="m-0 text-[16px] leading-[1.75] text-ink-soft">{p}</p>)}
        <Note>Pangkalahatang impormasyon lang ito. Kumonsulta sa lisensyadong beterinaryo para sa diagnosis at gamot.</Note>
        <a href="/learn" className="text-[14px] font-semibold text-wine">← Lahat ng articles</a>
      </article>
    </Page>
  );
}
