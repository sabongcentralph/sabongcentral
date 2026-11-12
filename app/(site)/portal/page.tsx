import type { Metadata } from "next";
import { one, type Search } from "@/lib/content";
import { BLOODLINES, EVENT_CATS, GOODS_CATS } from "@/lib/sample";
import { LocationFields } from "@/components/LocationFields";
import { PhotoPicker } from "@/components/PhotoPicker";
import { uploadsOn } from "@/lib/media";
import { Chip, Note, Page, PageHead, btnGhost, btnPrimary, input, labelCls } from "@/components/ui";
import { ROLES, STATUS_LABEL, canSubmit, currentMember, listingsOf, testMode, type Member } from "@/lib/members";
import { AVAILABILITY, EVENT_STATUSES, MARKET_DAYS, UNPUBLISHED_BY_OWNER, availOf, byId, daysLeft, editIds, titleOf, type GoodData, type Listing, type QueueStatus } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Portal" };

const TABS = [["home", "My listings"], ["farm", "+ Farm"], ["event", "+ Event or seminar"], ["good", "+ Market item"], ["account", "Account"]] as const;
type Tab = (typeof TABS)[number][0];

const Honeypot = () => <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />;


const box = "flex flex-col gap-4 rounded-2xl border border-line bg-cream p-4 md:grid md:grid-cols-2";
const full = "md:col-span-2";
const tone = (q: QueueStatus) => (q === "Approved" ? "green" : q === "Rejected" || q === "Hidden" ? "red" : q === "Needs Changes" || q === "In Review" ? "gold" : "plain") as "green" | "red" | "gold" | "plain";
const PATH = { farm: "farms", event: "events", good: "market", reel: "reels", article: "learn", notice: "notices", supplier: "suppliers" } as const;

function CurrentPhotos({ d, keys }: { d: Record<string, unknown>; keys: string[] }) {
  const ps = keys.flatMap((k) => (Array.isArray(d[k]) ? (d[k] as string[]) : d[k] ? [String(d[k])] : []));
  if (!ps.length) return null;
  return (
    <div className={`${full} flex flex-col gap-2`}>
      <span className="text-[13px] font-semibold text-ink-soft">Current photos (kept unless you upload new ones in that spot)</span>
      <div className="flex flex-wrap gap-2">{ps.map((p) => <img key={p} src={p} alt="" className="size-20 rounded-lg border border-line object-cover" />)}</div>
    </div>
  );
}

function SubmitForm({ tab, up, m, l }: { tab: "farm" | "event" | "good"; up: boolean; m: Member; l?: Listing }) {
  // When editing, every field starts with the listing's current value.
  const d = (l?.data ?? {}) as unknown as Record<string, unknown>;
  const v = (k: string, dflt = "") => (l ? String(d[k] ?? "") : dflt);
  const lines = l ? ((d.bloodlines as { name: string }[] | undefined) ?? []).map((b) => b.name) : [];
  const price = v("price").replace(/^₱\s?/, "").replace(/^quote$/, "");
  return (
  <form action="/api/submit" method="post" encType="multipart/form-data" className={box}>
    <input type="hidden" name="kind" value={tab} />
    {l && <input type="hidden" name="edit" value={l.id} />}
    <Honeypot />
    {l && <CurrentPhotos d={d} keys={["profile", "cover", "gallery", "poster", "photos"]} />}
    {tab === "farm" && (
      <>
        <label className={`${labelCls} ${full}`}>Farm name *<input name="name" required defaultValue={v("name")} className={input} placeholder="e.g. Bukid Malaya Gamefarm" /></label>
        <LocationFields required idPrefix="pf" province={v("province")} city={v("city")} />
        <label className={labelCls}>Owner name<input name="ownerName" defaultValue={v("ownerName")} className={input} /></label>
        <label className={labelCls}>Contact number *<input name="phone" required inputMode="tel" placeholder="09XX XXX XXXX" defaultValue={v("phone", m.phone)} className={input} /></label>
        <label className={labelCls}>Year established<input name="est" inputMode="numeric" maxLength={4} defaultValue={v("est")} className={input} /></label>
        <label className={labelCls}>Farm Facebook page *<input name="facebook" required maxLength={300} defaultValue={v("facebook", m.facebook)} placeholder="https://www.facebook.com/yourfarm" className={input} /></label>
        <label className={`${labelCls} ${full}`}>About the farm<textarea name="about" rows={4} defaultValue={v("about")} className={`${input} py-2.5`} /></label>
        {up && <PhotoPicker name="profile" label="Profile photo (logo or farm sign)" />}
        {up && <PhotoPicker name="cover" label="Cover photo" />}
        {up && <div className={full}><PhotoPicker name="gallery" label="Farm photos" max={6} /></div>}
        <label className={labelCls}>Visit policy<input name="visit" defaultValue={v("visit")} placeholder="e.g. By appointment only" className={input} /></label>
        <label className={labelCls}>Exact address (private, admin only)<input name="address" defaultValue={v("address")} className={input} /></label>
        <fieldset className={`m-0 border-0 p-0 ${full}`}>
          <legend className="mb-1.5 text-[13px] font-semibold text-ink-soft">Bloodlines</legend>
          <div className="grid grid-cols-2 gap-x-3 sm:grid-cols-3">
            {BLOODLINES.map((b) => <label key={b} className="flex min-h-9 items-center gap-2 text-[14px]"><input type="checkbox" name="line" value={b} defaultChecked={lines.includes(b)} className="size-[17px] accent-crimson" /> {b}</label>)}
          </div>
        </fieldset>
        <div className={`${full} flex flex-col gap-2 rounded-xl border border-dashed border-gold p-3`}>
          <span className="text-[14px] font-bold">Business registration (for the Business Verified badge)</span>
          <span className="text-[12.5px] text-muted">DTI, SEC or Mayor’s permit. Private, seen by admins only. Document upload is coming soon.</span>
          <label className="flex min-h-9 items-center gap-2 text-[14px]"><input type="checkbox" name="docs" value="yes" defaultChecked={!!d.docs} className="size-[17px] accent-crimson" /> I have business registration I can submit</label>
        </div>
      </>
    )}
    {tab === "event" && (
      <>
        <label className={`${labelCls} ${full}`}>Event title *<input name="title" required defaultValue={v("title")} className={input} /></label>
        <label className={labelCls}>Event type *
          <select name="sub" required className={input} defaultValue={v("sub")}>
            <option value="">Select</option>
            {EVENT_CATS.map(([cat, , , subs]) => <optgroup key={cat} label={cat}>{subs.map((s) => <option key={s}>{s}</option>)}</optgroup>)}
          </select>
        </label>
        <label className={labelCls}>Organizer name<input name="org" defaultValue={v("org", m.name)} className={input} /></label>
        <label className={labelCls}>Start date *<input name="date" type="date" required defaultValue={v("date")} className={input} /></label>
        <label className={labelCls}>End date (if multi-day)<input name="endDate" type="date" defaultValue={v("endDate")} className={input} /></label>
        <label className={labelCls}>Start time<input name="start" type="time" defaultValue={v("startTime")} className={input} /></label>
        <label className={labelCls}>End time<input name="end" type="time" defaultValue={v("endTime")} className={input} /></label>
        <label className={`${full} flex min-h-9 items-center gap-2 text-[14px] font-semibold text-ink-soft`}><input type="checkbox" name="online" value="1" defaultChecked={!!d.online} className="size-[17px] accent-crimson" /> Online event (webinar)</label>
        <label className={`${labelCls} ${full}`}>Online link (webinars only)<input name="link" type="url" defaultValue={v("link")} placeholder="Zoom, Facebook Live or Google Meet link" className={input} /></label>
        <LocationFields idPrefix="pe" province={d.online ? "" : v("province")} city={d.online ? "" : v("city")} />
        <label className={`${labelCls} ${full}`}>Venue<input name="venue" defaultValue={v("venue")} placeholder="Hall, farm, cockpit or arena" className={input} /></label>
        <label className={`${labelCls} ${full}`}>Description<textarea name="desc" rows={4} defaultValue={v("desc")} className={`${input} py-2.5`} /></label>
        <label className={labelCls}>Topics<input name="topics" defaultValue={v("topics")} className={input} /></label>
        <label className={labelCls}>Speakers<input name="speakers" defaultValue={v("speakers")} className={input} /></label>
        <label className={labelCls}>Fee<input name="fee" defaultValue={v("fee")} placeholder="Free or ₱500" className={input} /></label>
        <label className={labelCls}>Registration / contact<input name="reg" defaultValue={v("reg")} className={input} /></label>
        {up && <div className={full}><PhotoPicker name="poster" label="Event poster" hint="One poster image. No betting odds or fight photos." /></div>}
        <label className={`${labelCls} ${full}`}>Permits<input name="permits" defaultValue={v("permits")} placeholder="e.g. LGU event permit no., cockpit license (required for derbies)" className={input} /></label>
        <p className={`m-0 text-[12.5px] text-muted ${full}`}>Derby listings need a verified cockpit license and LGU permit before they are published.</p>
      </>
    )}
    {tab === "good" && (
      <>
        <label className={`${labelCls} ${full}`}>Product name *<input name="name" required defaultValue={v("name")} className={input} /></label>
        <label className={labelCls}>Subcategory *
          <select name="sub" required className={input} defaultValue={v("sub")}>
            <option value="">Select</option>
            {Object.entries(GOODS_CATS).map(([cat, subs]) => <optgroup key={cat} label={cat}>{subs.map((s) => <option key={s}>{s}</option>)}</optgroup>)}
          </select>
        </label>
        <label className={labelCls}>Price (₱)<input name="price" inputMode="decimal" defaultValue={price} placeholder="850 (blank = ask for quote)" className={input} /></label>
        <label className={labelCls}>Availability<select name="avail" className={input} defaultValue={v("avail", "Available")}>{["Available", "Reserved", "Sold"].map((a) => <option key={a}>{a}</option>)}</select></label>
        <label className={labelCls}>Condition<select name="condition" className={input} defaultValue={v("condition", "New")}>{["New", "Used", "Not applicable (service)"].map((a) => <option key={a}>{a}</option>)}</select></label>
        <label className={`${labelCls} ${full}`}>Pickup or delivery info<input name="pickup" defaultValue={v("pickup")} placeholder="e.g. Pickup in Lipa City, or seller arranges delivery" className={input} /></label>
        <label className={labelCls}>Seller name *<input name="seller" required defaultValue={v("seller", m.name)} className={input} /></label>
        <label className={labelCls}>Contact number *<input name="phone" required inputMode="tel" defaultValue={v("phone", m.phone)} className={input} /></label>
        <LocationFields required idPrefix="pg" province={v("province")} city={v("city")} />
        {up && <div className={full}><PhotoPicker name="photos" label="Product photos" max={3} /></div>}
        <label className={`${labelCls} ${full}`}>Description<textarea name="desc" rows={4} defaultValue={v("desc")} className={`${input} py-2.5`} /></label>
        <p className={`m-0 text-[12.5px] text-muted ${full}`}>Not allowed: live birds, fighting weapons, regulated veterinary medicines, and anything gambling-related. No payments, checkout or delivery booking through Sabong Central.</p>
      </>
    )}
    <label className={`${full} flex items-start gap-2 text-[13.5px] text-ink-soft`}>
      <input type="checkbox" name="confirm" value="1" required className="mt-0.5 size-[17px] flex-none accent-crimson" />
      I confirm the information is accurate, and I agree to the <a href="/legal/rules" className="font-semibold text-wine">Portal Rules</a>{tab === "good" ? <> and <a href="/legal/market" className="font-semibold text-wine">Market Notice</a></> : null}.
    </label>
    <button type="submit" className={`${btnPrimary} ${full}`}>{l ? (l.status === "approved" ? "Send changes for review" : "Save and resubmit") : "Submit for review"}</button>
  </form>
  );
}

// Step 1 and 2: email, then the 6-digit code.
async function SignIn({ sp }: { sp: Search }) {
  const step = one(sp.step), email = one(sp.email), test = one(sp.test), error = one(sp.error);
  const test_ = await testMode();
  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[460px] flex-col gap-5">
        <PageHead kicker="Member Portal" title={step === "code" ? "Enter your code" : "Sign in or create an account"} sub="For farm owners, event and seminar organizers, venues, Market sellers and suppliers. No password: we email you a 6-digit code." />
        {error && <Note tone="red">{error}</Note>}
        {step === "code" && email ? (
          <form action="/api/member/verify" method="post" className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-5">
            <input type="hidden" name="email" value={email} />
            <p className="m-0 text-[14px] text-ink-soft">We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.</p>
            {test && <Note><strong>Test site:</strong> email sending isn’t set up yet, so here is your code: <strong className="text-[17px] tracking-[0.2em]">{test}</strong></Note>}
            <label className={labelCls}>6-digit code<input name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} autoFocus className={`${input} text-center text-[22px] tracking-[0.35em]`} /></label>
            <button type="submit" className={btnPrimary}>Continue</button>
            <a href="/portal" className="text-center text-[13.5px] font-semibold text-wine">Use a different email or get a new code</a>
          </form>
        ) : (
          <form action="/api/member/code" method="post" className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-5">
            <Honeypot />
            <label className={labelCls}>Email<input name="email" type="email" required autoComplete="email" defaultValue={email} className={input} /></label>
            <button type="submit" className={btnPrimary}>Send me a code</button>
            {test_ && <p className="m-0 text-[12px] text-muted">Test site: the code is shown on screen instead of emailed.</p>}
          </form>
        )}
        <p className="m-0 text-[13.5px] text-ink-soft">Just sharing an article, an educational reel or a community announcement? Use the <a href="/submit" className="font-semibold text-wine">public submission form</a>; no account needed.</p>
      </div>
    </Page>
  );
}

function ProfileForm({ m, first }: { m: Member; first: boolean }) {
  return (
    <form action="/api/member/profile" method="post" className={box}>
      <label className={`${labelCls} ${full}`}>Your name or business name *<input name="name" required maxLength={120} defaultValue={m.name} className={input} /></label>
      <label className={labelCls}>Mobile number *<input name="phone" required inputMode="tel" placeholder="09XX XXX XXXX" defaultValue={m.phone} className={input} /></label>
      <label className={labelCls}>Email<input value={m.email} disabled className={`${input} opacity-70`} /></label>
      <fieldset className={`${full} m-0 flex flex-col gap-1 border-0 p-0`}>
        <legend className="mb-1.5 text-[13px] font-semibold text-ink-soft">I am a… * (pick all that apply)</legend>
        <div className="grid gap-x-3 sm:grid-cols-2">
          {ROLES.map(([k, label]) => <label key={k} className="flex min-h-10 items-center gap-2 text-[14px]"><input type="checkbox" name="role" value={k} defaultChecked={m.roles.includes(k)} className="size-[17px] accent-crimson" /> {label}</label>)}
        </div>
      </fieldset>
      <label className={`${labelCls} ${full}`}>Facebook page or profile link * (for verification)<input name="facebook" required maxLength={300} defaultValue={m.facebook} placeholder="https://www.facebook.com/yourpage" className={input} /></label>
      <label className={`${labelCls} ${full}`}>Organization, farm or business link (optional)<input name="org_link" maxLength={300} defaultValue={m.org_link} placeholder="https://…" className={input} /></label>
      {first && (
        <>
          <label className={`${full} flex items-start gap-2 text-[13.5px] text-ink-soft`}><input type="checkbox" name="adult" value="1" required className="mt-0.5 size-[17px] flex-none accent-crimson" /> I am 18 years old or older.</label>
          <label className={`${full} flex items-start gap-2 text-[13.5px] text-ink-soft`}><input type="checkbox" name="terms" value="1" required className="mt-0.5 size-[17px] flex-none accent-crimson" /> <span>I agree to the <a href="/legal/rules" className="font-semibold text-wine">Portal Rules</a>, <a href="/legal/terms" className="font-semibold text-wine">Terms of Use</a> and <a href="/legal/privacy" className="font-semibold text-wine">Privacy Notice</a>. Sabong Central never asks for government IDs.</span></label>
        </>
      )}
      <button type="submit" className={`${btnPrimary} ${full}`}>{first ? "Create my account" : "Save changes"}</button>
    </form>
  );
}

const DONE: Record<string, string> = {
  state: "Status updated.", renew: `Renewed. It stays listed for another ${MARKET_DAYS} days.`, unpublish: "Unpublished. It is no longer on the public site.",
  republish: "Sent back for review. It goes live again after an admin approves it.", cancel_edit: "Your waiting edit was withdrawn.",
};

const small = "inline-flex min-h-9 cursor-pointer items-center rounded-full border border-sand bg-ivory px-3.5 text-[13px] font-semibold text-crimson no-underline";

// One of the member's listings, with what they can do to it.
function ListingRow({ l, qs, editing, blocked }: { l: Listing; qs: QueueStatus; editing: boolean; blocked: boolean }) {
  const live = qs === "Approved";
  const mine = l.reason === UNPUBLISHED_BY_OWNER;
  const d = l.data as unknown as Record<string, unknown>;
  const left = l.kind === "good" ? daysLeft(l) : null;
  const expired = live && left !== null && left <= 0;
  const label = expired ? "Expired" : mine ? "Unpublished" : qs === "New" ? "Pending review" : live ? "Live" : qs;
  const hidden = { id: <input type="hidden" name="id" value={l.id} /> };
  const states = l.kind === "event" ? EVENT_STATUSES : l.kind === "good" ? AVAILABILITY : null;
  const current = l.kind === "event" ? String(d.status ?? "Upcoming") : l.kind === "good" ? availOf(l.data as GoodData) : "";
  return (
    <li id={`l${l.id}`} className="flex flex-col gap-2 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="min-w-0 flex-1 text-[14.5px] font-semibold">{titleOf(l)}</span>
        <Chip tone="plain">{l.kind === "good" ? "Market" : l.kind === "event" ? "Event" : "Farm"}</Chip>
        <Chip tone={expired ? "red" : mine ? "plain" : tone(qs)}>{label}</Chip>
        {editing && <Chip tone="gold">Edit waiting for review</Chip>}
      </div>
      {l.reason && !mine && (qs === "Needs Changes" || qs === "Rejected" || qs === "Hidden" || qs === "Approved") && <p className="m-0 text-[13px] text-wine">Admin note: “{l.reason}”</p>}
      {live && left !== null && <p className={`m-0 text-[12.5px] ${left <= 7 ? "font-semibold text-wine" : "text-muted"}`}>{expired ? "Expired: no longer shown in the Market. Renew to list it again." : `Listed for ${left} more day${left === 1 ? "" : "s"}.`}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {live && !expired && <a href={`/${l.kind === "event" && !d.derby ? "education" : PATH[l.kind]}/${l.slug}`} className={small}>View ↗</a>}
        {!blocked && !mine && qs !== "Hidden" && <a href={`/portal?tab=edit&id=${l.id}`} className={small}>Edit</a>}
        {live && states && (
          <form action="/api/member/listing" method="post" className="flex items-center gap-1.5">
            {hidden.id}<input type="hidden" name="action" value="state" />
            <select name="state" defaultValue={current} aria-label="Status" className="min-h-9 rounded-full border border-sand bg-ivory px-3 text-[13px]">
              {states.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button type="submit" className={small}>Update</button>
          </form>
        )}
        {live && l.kind === "good" && (left ?? 99) <= 14 && (
          <form action="/api/member/listing" method="post">{hidden.id}<button name="action" value="renew" className={small}>Renew {MARKET_DAYS} days</button></form>
        )}
        {editing && <form action="/api/member/listing" method="post">{hidden.id}<button name="action" value="cancel_edit" className={small}>Withdraw edit</button></form>}
        {(live || qs === "New" || qs === "In Review" || qs === "Needs Changes") && (
          <form action="/api/member/listing" method="post">{hidden.id}<button name="action" value="unpublish" className={`${small} text-muted`}>Unpublish</button></form>
        )}
        {mine && !blocked && <form action="/api/member/listing" method="post">{hidden.id}<button name="action" value="republish" className={small}>Publish again (goes to review)</button></form>}
      </div>
    </li>
  );
}

export default async function PortalPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const m = await currentMember();
  if (!m) return <SignIn sp={sp} />;
  const error = one(sp.error);
  if (m.status === "incomplete") {
    return (
      <Page>
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
          <PageHead kicker="Member Portal" title="Finish your account" sub="An admin checks every account. Your Facebook link helps us confirm you are real." />
          {error && <Note tone="red">{error}</Note>}
          <ProfileForm m={m} first />
        </div>
      </Page>
    );
  }
  const tab: Tab | "edit" = one(sp.tab) === "edit" ? "edit" : TABS.find(([k]) => k === one(sp.tab))?.[0] ?? "home";
  const sent = one(sp.sent) === "1";
  const up = await uploadsOn();
  const mine = await listingsOf(m.id);
  const count = (f: (q: QueueStatus) => boolean) => mine.filter((x) => f(x.qs)).length;
  const blocked = !canSubmit(m);
  const edits = new Set(await editIds());
  const editId = Number(one(sp.id)) || 0;
  const editing = tab === "edit" && mine.some(({ l }) => l.id === editId) ? await byId(editId) : null;
  const edited = one(sp.edited), done = one(sp.done);

  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <PageHead kicker="Member Portal" title={`Hi, ${m.name.split(" ")[0] || "there"}`} sub={m.roles.map((r) => ROLES.find(([k]) => k === r)?.[1]).join(" · ")} />
          </div>
          <Chip tone={m.status === "active" ? "green" : m.status === "pending" ? "gold" : "red"}>{STATUS_LABEL[m.status]}</Chip>
        </div>
        {one(sp.welcome) === "1" && <Note tone="green"><strong>Welcome!</strong> Your account is waiting for admin approval. You can already submit listings; they go live after review.</Note>}
        {m.status === "pending" && one(sp.welcome) !== "1" && <Note>Your account is waiting for admin approval. Listings you submit are reviewed before they go public.</Note>}
        {blocked && <Note tone="red">Your account is {STATUS_LABEL[m.status].toLowerCase()}, so you can’t submit listings. Please <a href="/contact" className="font-semibold">contact us</a>.</Note>}
        {sent && <Note tone="green"><strong>Received!</strong> Your listing is pending review. You can follow it under My listings.</Note>}
        {edited === "waiting" && <Note tone="green"><strong>Changes sent.</strong> Your listing stays live as it was until an admin approves the edit.</Note>}
        {edited === "resubmitted" && <Note tone="green"><strong>Saved.</strong> Your listing is back in the review queue.</Note>}
        {done && <Note tone="green">{DONE[done] ?? "Done."}</Note>}
        {error && <Note tone="red">{error}</Note>}

        <nav aria-label="Portal" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {TABS.filter(([k]) => !blocked || k === "home" || k === "account").map(([k, label]) => (
            <a key={k} href={`/portal?tab=${k}`} aria-current={k === tab ? "page" : undefined}
              className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${k === tab ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
              {label}
            </a>
          ))}
        </nav>

        {tab === "home" && (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([["Pending", count((q) => q === "New" || q === "In Review")], ["Needs changes", count((q) => q === "Needs Changes")], ["Live", count((q) => q === "Approved")], ["Not published", count((q) => q === "Rejected" || q === "Hidden" || q === "Archived")]] as const).map(([l, n]) => (
                <div key={l} className="rounded-2xl border border-line bg-cream p-3"><div className="font-serif text-[26px] font-semibold text-crimson">{n}</div><div className="text-[13px] text-muted">{l}</div></div>
              ))}
            </div>
            {mine.length === 0 ? (
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-sand p-6">
                <p className="m-0 text-[15px] font-semibold">No listings yet.</p>
                {!blocked && <div className="flex flex-wrap gap-2"><a href="/portal?tab=farm" className={btnGhost}>+ Farm</a><a href="/portal?tab=event" className={btnGhost}>+ Event or seminar</a><a href="/portal?tab=good" className={btnGhost}>+ Market item</a></div>}
              </div>
            ) : (
              <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-2xl border border-line bg-cream p-0">
                {mine.map(({ l, qs }) => <ListingRow key={l.id} l={l} qs={qs} editing={edits.has(l.id)} blocked={blocked} />)}
              </ul>
            )}
            <p className="m-0 text-[12.5px] text-muted">Edits to a live listing are checked by an admin; the current version stays up until then. Status changes, renewing and unpublishing happen right away. Market items stay up for {MARKET_DAYS} days; renew to keep them listed.</p>
          </>
        )}

        {(tab === "farm" || tab === "event" || tab === "good") && !blocked && <SubmitForm tab={tab} up={up} m={m} />}

        {tab === "edit" && (editing && (editing.kind === "farm" || editing.kind === "event" || editing.kind === "good") && !blocked ? (
          <>
            <div className="flex flex-col gap-1">
              <a href="/portal" className="text-[13.5px] font-semibold text-wine">← My listings</a>
              <h2 className="m-0 font-serif text-[22px] font-semibold">Edit: {titleOf(editing)}</h2>
              <p className="m-0 text-[13.5px] text-ink-soft">{editing.status === "approved" ? "Your listing stays live as it is now. The changes go public after an admin checks them." : "Saving sends this listing back to the review queue."}</p>
            </div>
            <SubmitForm tab={editing.kind} up={up} m={m} l={editing} />
          </>
        ) : <Note tone="red">{blocked ? "Your account can’t edit listings right now." : "Listing not found."}</Note>)}

        {tab === "account" && (
          <>
            {one(sp.saved) === "1" && <Note tone="green">Saved.</Note>}
            <ProfileForm m={m} first={false} />
            <form action="/api/member/logout" method="post"><button type="submit" className={btnGhost}>Sign out</button></form>
          </>
        )}
      </div>
    </Page>
  );
}
