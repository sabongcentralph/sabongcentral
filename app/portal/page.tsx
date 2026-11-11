import type { Metadata } from "next";
import { one, type Search } from "@/lib/content";
import { BLOODLINES, EVENT_CATS, GOODS_CATS } from "@/lib/sample";
import { LocationFields } from "@/components/LocationFields";
import { Note, Page, PageHead, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Portal" };

const TABS = [
  ["farm", "Farm"], ["event", "Event"], ["good", "Goods"], ["reel", "Reel"], ["notice", "Announcement"],
] as const;
const TOPICS = ["Feeding", "Poultry Health", "Breeding", "Farm Management", "Housing", "Incubation"];

const Honeypot = () => <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />;

export default async function PortalPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const tab = TABS.find(([k]) => k === one(sp.tab))?.[0] ?? "farm";
  const sent = one(sp.sent) === "1", error = one(sp.error);
  const box = "flex flex-col gap-4 rounded-2xl border border-line bg-cream p-4 md:grid md:grid-cols-2";
  const full = "md:col-span-2";

  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
        <PageHead kicker="Portal" title="Submit a listing" sub="For farms, organizers and sellers. Every submission is reviewed by an admin before it goes public." />
        <Note>
          <strong>Test version.</strong> There's no login yet. Accounts (email code), business documents and your dashboard come in the next step. For now you can try submit → admin approve → live.
        </Note>
        <nav aria-label="Listing type" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {TABS.map(([k, label]) => (
            <a key={k} href={`/portal?tab=${k}`} aria-current={k === tab ? "page" : undefined}
              className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${k === tab ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
              {label}
            </a>
          ))}
        </nav>
        {sent && <Note tone="green"><strong>Received!</strong> Your submission is pending review. It will appear on the site once an admin approves it.</Note>}
        {error && <Note tone="red">{error}</Note>}

        <form action="/api/submit" method="post" className={box}>
          <input type="hidden" name="kind" value={tab} />
          <Honeypot />
          {tab === "farm" && (
            <>
              <label className={`${labelCls} ${full}`}>Farm name *<input name="name" required className={input} placeholder="e.g. Bukid Malaya Gamefarm" /></label>
              <LocationFields required idPrefix="pf" />
              <label className={labelCls}>Owner name<input name="ownerName" className={input} /></label>
              <label className={labelCls}>Contact number *<input name="phone" required inputMode="tel" placeholder="09XX XXX XXXX" className={input} /></label>
              <label className={labelCls}>Year established<input name="est" inputMode="numeric" maxLength={4} className={input} /></label>
              <label className={labelCls}>Facebook page (for the Message button)<input name="facebook" placeholder="facebook.com/yourfarm" className={input} /></label>
              <label className={`${labelCls} ${full}`}>About the farm<textarea name="about" rows={4} className={`${input} py-2.5`} /></label>
              <fieldset className={`m-0 border-0 p-0 ${full}`}>
                <legend className="mb-1.5 text-[13px] font-semibold text-ink-soft">Bloodlines</legend>
                <div className="grid grid-cols-2 gap-x-3 sm:grid-cols-3">
                  {BLOODLINES.map((b) => <label key={b} className="flex min-h-9 items-center gap-2 text-[14px]"><input type="checkbox" name="line" value={b} className="size-[17px] accent-crimson" /> {b}</label>)}
                </div>
              </fieldset>
              <div className={`${full} flex flex-col gap-2 rounded-xl border border-dashed border-gold p-3`}>
                <span className="text-[14px] font-bold">Business registration (for the Business Verified badge)</span>
                <span className="text-[12.5px] text-muted">DTI, SEC or Mayor’s permit. Private, seen by admins only. Upload comes with accounts.</span>
                <label className="flex min-h-9 items-center gap-2 text-[14px]"><input type="checkbox" name="docs" value="yes" className="size-[17px] accent-crimson" /> I have business registration I can submit</label>
              </div>
            </>
          )}
          {tab === "event" && (
            <>
              <label className={`${labelCls} ${full}`}>Event title *<input name="title" required className={input} /></label>
              <label className={labelCls}>Event type *
                <select name="sub" required className={input} defaultValue="">
                  <option value="">Select</option>
                  {EVENT_CATS.map(([cat, , , subs]) => <optgroup key={cat} label={cat}>{subs.map((s) => <option key={s}>{s}</option>)}</optgroup>)}
                </select>
              </label>
              <label className={labelCls}>Organizer name<input name="org" className={input} /></label>
              <label className={labelCls}>Start date *<input name="date" type="date" required className={input} /></label>
              <label className={labelCls}>End date (if multi-day)<input name="endDate" type="date" className={input} /></label>
              <label className={labelCls}>Start time<input name="start" type="time" className={input} /></label>
              <label className={labelCls}>End time<input name="end" type="time" className={input} /></label>
              <label className={`${full} flex min-h-9 items-center gap-2 text-[14px] font-semibold text-ink-soft`}><input type="checkbox" name="online" value="1" className="size-[17px] accent-crimson" /> Online event (webinar)</label>
              <LocationFields idPrefix="pe" />
              <label className={`${labelCls} ${full}`}>Venue<input name="venue" placeholder="Hall, farm, cockpit or arena" className={input} /></label>
              <label className={`${labelCls} ${full}`}>Description<textarea name="desc" rows={4} className={`${input} py-2.5`} /></label>
              <label className={labelCls}>Topics<input name="topics" className={input} /></label>
              <label className={labelCls}>Speakers<input name="speakers" className={input} /></label>
              <label className={labelCls}>Fee<input name="fee" placeholder="Free or ₱500" className={input} /></label>
              <label className={labelCls}>Registration / contact<input name="reg" className={input} /></label>
              <label className={`${labelCls} ${full}`}>Permits<input name="permits" placeholder="e.g. LGU event permit no., cockpit license (required for derbies)" className={input} /></label>
              <p className={`m-0 text-[12.5px] text-muted ${full}`}>Derby listings need a verified cockpit license and LGU permit before they are published. Poster upload comes with accounts.</p>
            </>
          )}
          {tab === "good" && (
            <>
              <label className={`${labelCls} ${full}`}>Product name *<input name="name" required className={input} /></label>
              <label className={labelCls}>Subcategory *
                <select name="sub" required className={input} defaultValue="">
                  <option value="">Select</option>
                  {Object.entries(GOODS_CATS).map(([cat, subs]) => <optgroup key={cat} label={cat}>{subs.map((s) => <option key={s}>{s}</option>)}</optgroup>)}
                </select>
              </label>
              <label className={labelCls}>Price (₱)<input name="price" inputMode="decimal" placeholder="850 (blank = ask for quote)" className={input} /></label>
              <label className={labelCls}>Seller name *<input name="seller" required className={input} /></label>
              <label className={labelCls}>Contact number *<input name="phone" required inputMode="tel" className={input} /></label>
              <LocationFields required idPrefix="pg" />
              <label className={`${labelCls} ${full}`}>Description<textarea name="desc" rows={4} className={`${input} py-2.5`} /></label>
              <p className={`m-0 text-[12.5px] text-muted ${full}`}>Not allowed: live birds, fighting weapons and regulated veterinary medicines.</p>
            </>
          )}
          {tab === "reel" && (
            <>
              <label className={`${labelCls} ${full}`}>Video link * (Facebook, YouTube or TikTok)
                <input name="url" type="url" required placeholder="https://www.youtube.com/shorts/… or https://www.tiktok.com/@farm/video/…" className={input} />
              </label>
              <label className={labelCls}>Title *<input name="title" required className={input} /></label>
              <label className={labelCls}>Topic<select name="topic" className={input}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label className={`${labelCls} ${full}`}>Farm name<input name="farm" className={input} /></label>
              <p className={`m-0 text-[12.5px] text-muted ${full}`}>Educational only: no fight footage, betting content or animal cruelty.</p>
            </>
          )}
          {tab === "notice" && (
            <>
              <label className={labelCls}>Farm name<input name="farm" className={input} /></label>
              <label className={labelCls}>Title *<input name="title" required className={input} /></label>
              <label className={`${labelCls} ${full}`}>Details *<textarea name="text" rows={4} required className={`${input} py-2.5`} /></label>
            </>
          )}
          <label className={`${labelCls} ${full}`}>Your name (for the admin)<input name="contactName" className={input} /></label>
          <button type="submit" className={`${btnPrimary} ${full}`}>Submit for review</button>
        </form>
      </div>
    </Page>
  );
}
