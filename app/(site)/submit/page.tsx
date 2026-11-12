import { VerifyFields } from "@/components/VerifyFields";
import type { Metadata } from "next";
import { one, type Search } from "@/lib/content";
import { ARTICLE_TOPICS, REEL_TOPICS } from "@/lib/sample";
import { Note, Page, PageHead, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Submit content" };

const TABS = [["article", "Article"], ["reel", "Educational reel"], ["notice", "Community announcement"]] as const;

// Public form: no account needed, but only for articles, reels and announcements.
export default async function SubmitPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const tab = TABS.find(([k]) => k === one(sp.tab))?.[0] ?? "article";
  const sent = one(sp.sent) === "1", error = one(sp.error);
  const box = "flex flex-col gap-4 rounded-2xl border border-line bg-cream p-4 md:grid md:grid-cols-2";
  const full = "md:col-span-2";

  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
        <PageHead kicker="Share with the community" title="Submit content" sub="Educational articles, reels and community announcements. No account needed." />
        <ul className="m-0 flex list-none flex-col gap-1.5 rounded-2xl border border-line bg-cream p-4 text-[13.5px] leading-relaxed text-ink-soft">
          <li>• Submitting does <strong>not</strong> guarantee publication. An admin reviews everything first.</li>
          <li>• Your content must be accurate, your own (or properly credited), and lawful.</li>
          <li>• This form is <strong>not</strong> for farm listings, events, seminars or Market items. Those need a <a href="/portal" className="font-semibold text-wine">Portal account</a>.</li>
          <li>• No betting, fight footage, animal cruelty or selling.</li>
        </ul>
        <nav aria-label="Content type" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {TABS.map(([k, label]) => (
            <a key={k} href={`/submit?tab=${k}`} aria-current={k === tab ? "page" : undefined}
              className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${k === tab ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
              {label}
            </a>
          ))}
        </nav>
        {sent && <Note tone="green"><strong>Received!</strong> An admin will review it. If it is approved it will appear on the site; we may email you with questions.</Note>}
        {error && <Note tone="red">{error}</Note>}

        <form action="/api/submit" method="post" className={box}>
          <input type="hidden" name="kind" value={tab} />
          <input type="hidden" name="via" value="public" />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
          {tab === "article" && (
            <>
              <label className={`${labelCls} ${full}`}>Title *<input name="title" required maxLength={160} className={input} /></label>
              <label className={labelCls}>Topic *<select name="topic" required className={input}>{ARTICLE_TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label className={labelCls}>Farm or organization (optional)<input name="org" className={input} /></label>
              <label className={`${labelCls} ${full}`}>Short summary<input name="summary" maxLength={300} placeholder="One or two sentences" className={input} /></label>
              <label className={`${labelCls} ${full}`}>Article *<textarea name="body" required rows={10} placeholder="Write your article here. Leave a blank line between paragraphs." className={`${input} py-2.5`} /></label>
              <label className={`${labelCls} ${full}`}>Sources / references<textarea name="refs" rows={3} placeholder="One link or source per line" className={`${input} py-2.5`} /></label>
            </>
          )}
          {tab === "reel" && (
            <>
              <label className={`${labelCls} ${full}`}>Video link * (Facebook, YouTube or TikTok)
                <input name="url" type="url" required placeholder="https://www.youtube.com/shorts/… or https://www.tiktok.com/@farm/video/…" className={input} />
              </label>
              <label className={labelCls}>Title *<input name="title" required maxLength={160} className={input} /></label>
              <label className={labelCls}>Topic *<select name="topic" required className={input}>{REEL_TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label className={`${labelCls} ${full}`}>Creator or farm name<input name="farm" className={input} /></label>
              <label className={`${labelCls} ${full}`}>Short description<textarea name="desc" rows={3} maxLength={600} className={`${input} py-2.5`} /></label>
            </>
          )}
          {tab === "notice" && (
            <>
              <label className={`${labelCls} ${full}`}>Title *<input name="title" required maxLength={160} className={input} /></label>
              <label className={`${labelCls} ${full}`}>Farm or group (optional)<input name="farm" className={input} /></label>
              <label className={`${labelCls} ${full}`}>Announcement *<textarea name="text" rows={5} required className={`${input} py-2.5`} /></label>
              <p className={`m-0 text-[12.5px] text-muted ${full}`}>Only admins post official advisories (DA, BAI, provincial vet office).</p>
            </>
          )}
          <VerifyFields />
          <label className={labelCls}>Your name or display name *<input name="contactName" required maxLength={120} className={input} /></label>
          <label className={labelCls}>Email (for the admin, not public) *<input name="email" type="email" required maxLength={200} className={input} /></label>
          <label className={`${full} flex items-start gap-2 text-[13.5px] text-ink-soft`}>
            <input type="checkbox" name="confirm" value="1" required className="mt-0.5 size-[17px] flex-none accent-crimson" />
            I confirm this is educational, accurate and lawful, and that I have the right to share it. No betting, fight footage, animal cruelty or selling.
          </label>
          <button type="submit" className={`${btnPrimary} ${full}`}>Submit for review</button>
        </form>
      </div>
    </Page>
  );
}
