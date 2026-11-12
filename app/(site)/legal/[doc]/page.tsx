import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL } from "@/lib/legal";
import { Note, Page } from "@/components/ui";

export const dynamic = "force-dynamic";

const KEYS: Record<string, string> = { about: "About", terms: "Terms", privacy: "Privacy", rules: "Rules", market: "Market", faq: "FAQ", disclaimer: "Disclaimer", "responsible-gaming": "Responsible" };

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const d = LEGAL[KEYS[(await params).doc]];
  return { title: d?.title ?? "Legal" };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const key = (await params).doc;
  const doc = LEGAL[KEYS[key]];
  if (!doc) notFound();
  return (
    <Page>
      <nav aria-label="Legal pages" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {Object.entries(KEYS).map(([k, v]) => (
          <a key={k} href={`/legal/${k}`} aria-current={k === key ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13px] font-semibold no-underline ${k === key ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {LEGAL[v].tab}
          </a>
        ))}
      </nav>
      <article className="mx-auto flex w-full max-w-[760px] flex-col gap-4">
        <div>
          <h1 className="m-0 font-serif text-[30px] font-semibold leading-tight md:text-[38px]">{doc.title}</h1>
          <p className="m-0 mt-1 text-[13px] text-muted">{doc.meta}</p>
        </div>
        {key !== "about" && key !== "faq" && <Note>Draft: still being reviewed by our lawyer.</Note>}
        {doc.s.map(([h, p]) => (
          <section key={h} className="flex flex-col gap-1.5">
            <h2 className="m-0 text-[17px] font-bold">{h}</h2>
            <p className="m-0 text-[15px] leading-[1.7] text-ink-soft">{p}</p>
          </section>
        ))}
      </article>
    </Page>
  );
}
