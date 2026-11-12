import { VerifyFields } from "@/components/VerifyFields";
import type { Metadata } from "next";
import { one, type Search } from "@/lib/content";
import { BLOODLINES, EVENT_CATS, GOODS_CATS } from "@/lib/sample";
import { LocationFields } from "@/components/LocationFields";
import { PhotoPicker } from "@/components/PhotoPicker";
import { uploadsOn } from "@/lib/media";
import { Note, Page, PageHead, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Portal" };

const TABS = [["farm", "Farm"], ["event", "Event or seminar"], ["good", "Market item"]] as const;

const Honeypot = () => <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />;

export default async function PortalPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const tab = TABS.find(([k]) => k === one(sp.tab))?.[0] ?? "farm";
  const sent = one(sp.sent) === "1", error = one(sp.error);
  const box = "flex flex-col gap-4 rounded-2xl border border-line bg-cream p-4 md:grid md:grid-cols-2";
  const full = "md:col-span-2";
  const up = await uploadsOn();

  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5">
        <PageHead kicker="Member Portal" title="Submit a listing" sub="For farm owners, event and seminar organizers, venues, Market sellers and suppliers. Every listing is reviewed by an admin before it goes public." />
        <Note>
          <strong>Test version.</strong> On the real site you will first create a Portal account: verify your email with a 6-digit code, add your mobile number, pick your role, and send your business registration or proof of legitimacy. Accounts are coming in the next step; for now you can try submit → admin approve → live.
        </Note>
        <p className="m-0 text-[13.5px] text-ink-soft">Sharing an article, an educational reel or a community announcement? Use the <a href="/submit" className="font-semibold text-wine">public submission form</a> instead; no account needed.</p>
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

        <form action="/api/submit" method="post" encType="multipart/form-data" className={box}>
          <input type="hidden" name="kind" value={tab} />
          <Honeypot />
          {tab === "farm" && (
            <>
              <label className={`${labelCls} ${full}`}>Farm name *<input name="name" required className={input} placeholder="e.g. Bukid Malaya Gamefarm" /></label>
              <LocationFields required idPrefix="pf" />
              <label className={labelCls}>Owner name<input name="ownerName" className={input} /></label>
              <label className={labelCls}>Contact number *<input name="phone" required inputMode="tel" placeholder="09XX XXX XXXX" className={input} /></label>
              <label className={labelCls}>Year established<input name="est" inputMode="numeric" maxLength={4} className={input} /></label>
              <label className={labelCls}>Farm Facebook page *<input name="facebook" required maxLength={300} placeholder="https://www.facebook.com/yourfarm" className={input} /></label>
              <label className={`${labelCls} ${full}`}>About the farm<textarea name="about" rows={4} className={`${input} py-2.5`} /></label>
              {up && <PhotoPicker name="profile" label="Profile photo (logo or farm sign)" />}
              {up && <PhotoPicker name="cover" label="Cover photo" />}
              {up && <div className={full}><PhotoPicker name="gallery" label="Farm photos" max={6} /></div>}
              <label className={labelCls}>Visit policy<input name="visit" placeholder="e.g. By appointment only" className={input} /></label>
              <label className={labelCls}>Exact address (private, admin only)<input name="address" className={input} /></label>
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
              <label className={`${labelCls} ${full}`}>Online link (webinars only)<input name="link" type="url" placeholder="Zoom, Facebook Live or Google Meet link" className={input} /></label>
              <LocationFields idPrefix="pe" />
              <label className={`${labelCls} ${full}`}>Venue<input name="venue" placeholder="Hall, farm, cockpit or arena" className={input} /></label>
              <label className={`${labelCls} ${full}`}>Description<textarea name="desc" rows={4} className={`${input} py-2.5`} /></label>
              <label className={labelCls}>Topics<input name="topics" className={input} /></label>
              <label className={labelCls}>Speakers<input name="speakers" className={input} /></label>
              <label className={labelCls}>Fee<input name="fee" placeholder="Free or ₱500" className={input} /></label>
              <label className={labelCls}>Registration / contact<input name="reg" className={input} /></label>
              {up && <div className={full}><PhotoPicker name="poster" label="Event poster" hint="One poster image. No betting odds or fight photos." /></div>}
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
              <label className={labelCls}>Availability<select name="avail" className={input}>{["Available", "Reserved", "Sold"].map((a) => <option key={a}>{a}</option>)}</select></label>
              <label className={labelCls}>Condition<select name="condition" className={input}>{["New", "Used", "Not applicable (service)"].map((a) => <option key={a}>{a}</option>)}</select></label>
              <label className={`${labelCls} ${full}`}>Pickup or delivery info<input name="pickup" placeholder="e.g. Pickup in Lipa City, or seller arranges delivery" className={input} /></label>
              <label className={labelCls}>Seller name *<input name="seller" required className={input} /></label>
              <label className={labelCls}>Contact number *<input name="phone" required inputMode="tel" className={input} /></label>
              <LocationFields required idPrefix="pg" />
              {up && <div className={full}><PhotoPicker name="photos" label="Product photos" max={3} /></div>}
              <label className={`${labelCls} ${full}`}>Description<textarea name="desc" rows={4} className={`${input} py-2.5`} /></label>
              <p className={`m-0 text-[12.5px] text-muted ${full}`}>Not allowed: live birds, fighting weapons, regulated veterinary medicines, and anything gambling-related. No payments, checkout or delivery booking through Sabong Central.</p>
            </>
          )}
          <VerifyFields farm={tab === "farm"} />
          <label className={`${labelCls} ${full}`}>Your name (for the admin)<input name="contactName" className={input} /></label>
          <label className={`${full} flex items-start gap-2 text-[13.5px] text-ink-soft`}>
            <input type="checkbox" name="confirm" value="1" required className="mt-0.5 size-[17px] flex-none accent-crimson" />
            I confirm the information is accurate, and I agree to the <a href="/legal/rules" className="font-semibold text-wine">Portal Rules</a>{tab === "good" ? <> and <a href="/legal/market" className="font-semibold text-wine">Market Notice</a></> : null}.
          </label>
          <button type="submit" className={`${btnPrimary} ${full}`}>Submit for review</button>
        </form>
      </div>
    </Page>
  );
}
