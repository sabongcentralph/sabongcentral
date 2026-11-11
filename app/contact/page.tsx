import type { Metadata } from "next";
import { one, type Search } from "@/lib/content";
import { CONTACT_EMAIL, FB_PAGE } from "@/lib/site";
import { Note, Page, PageHead, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact Us" };

const TOPICS = ["General question", "Listing help", "Report a problem", "Privacy / data request", "Partnership"];

export default async function ContactPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const sent = one(sp.sent) === "1", error = one(sp.error) === "1";
  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[620px] flex-col gap-5">
        <PageHead kicker="Contact Us" title="Mag-message sa amin" sub="Sasagutin namin sa email within 1–3 araw." />
        {sent ? (
          <Note tone="green"><strong>Salamat! Naipadala na ang message mo.</strong> Sasagot kami sa email mo.</Note>
        ) : (
          <form action="/api/contact" method="post" className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-4">
            {error && <Note tone="red">Pakikumpleto ang name, tamang email at message.</Note>}
            <label className={labelCls}>Pangalan *<input name="name" required className={input} /></label>
            <label className={labelCls}>Email *<input name="email" type="email" required className={input} /></label>
            <label className={labelCls}>Topic<select name="topic" className={input}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label className={labelCls}>Message *<textarea name="body" rows={6} required className={`${input} py-2.5`} /></label>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
            <button type="submit" className={btnPrimary}>Ipadala</button>
          </form>
        )}
        <p className="m-0 text-[14px] text-ink-soft">Iba pang paraan: {CONTACT_EMAIL} · Facebook page: {FB_PAGE} · Manila, Philippines</p>
      </div>
    </Page>
  );
}
