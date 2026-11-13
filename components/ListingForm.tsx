import { ARTICLE_TOPICS, BLOODLINES, EVENT_CATS, GOODS_CATS, NOTICE_KINDS, REEL_TOPICS, SUPPLIER_KINDS } from "@/lib/sample";
import { LocationFields } from "@/components/LocationFields";
import { PhotoPicker } from "@/components/PhotoPicker";
import { btnGhost, btnPrimary, input, labelCls } from "@/components/ui";
import { DRAFT, VENUE_ROLES, type Listing } from "@/lib/db";

type Who = { name: string; phone: string; facebook: string };
const Honeypot = () => <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />;
const box = "flex flex-col gap-4 rounded-2xl border border-line bg-cream p-4 md:grid md:grid-cols-2";
const full = "md:col-span-2";

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

// Farm, event, Market item (and, for admins, reel) form. Members submit for review;
// admins (admin) post directly and their listings go live at once.
export function ListingForm({ tab, up, who, l, admin = false, venues = [] }: { tab: "farm" | "event" | "good" | "reel" | "article" | "notice" | "supplier" | "venue"; up: boolean; who: Who; l?: Listing; admin?: boolean; venues?: { name: string; roles: string[] }[] }) {
  const m = who;
  // When editing, every field starts with the listing's current value.
  const d = (l?.data ?? {}) as unknown as Record<string, unknown>;
  const v = (k: string, dflt = "") => (l ? String(d[k] ?? "") : dflt);
  const lines = l ? ((d.bloodlines as { name: string }[] | undefined) ?? []).map((b) => b.name) : [];
  const isDraft = l?.reason === DRAFT;
  // New listings and drafts can be saved as a draft; live ones (and admin edits of them) can't.
  const canDraft = !l || isDraft || (!admin && l.status !== "approved");
  const price = v("price").replace(/^₱\s?/, "").replace(/^quote$/, "");
  return (
  <form action="/api/submit" method="post" encType="multipart/form-data" className={box}>
    <input type="hidden" name="kind" value={tab} />
    {admin && <input type="hidden" name="admin" value="1" />}
    {l && <input type="hidden" name="edit" value={l.id} />}
    <Honeypot />
    {l && <CurrentPhotos d={d} keys={["profile", "cover", "gallery", "poster", "photos"]} />}
    {tab === "farm" && (
      <>
        <label className={`${labelCls} ${full}`}>Farm name *<input name="name" required defaultValue={v("name")} className={input} placeholder="e.g. Bukid Malaya Gamefarm" /></label>
        <LocationFields required idPrefix="pf" province={v("province")} city={v("city")} />
        <label className={labelCls}>Owner name<input name="ownerName" defaultValue={v("ownerName")} className={input} /></label>
        <label className={labelCls}>Contact number{admin ? " (public number only)" : " *"}<input name="phone" required={!admin} inputMode="tel" placeholder="09XX XXX XXXX" defaultValue={v("phone", m.phone)} className={input} /></label>
        <label className={labelCls}>Year established<input name="est" inputMode="numeric" maxLength={4} defaultValue={v("est")} className={input} /></label>
        <label className={labelCls}>Farm Facebook page *<input name="facebook" required maxLength={300} defaultValue={v("facebook", m.facebook)} placeholder="https://www.facebook.com/yourfarm" className={input} /></label>
        <label className={labelCls}>Messenger link (for the Message button)<input name="messenger" maxLength={300} defaultValue={v("messenger")} placeholder="https://m.me/yourfarm" className={input} />
          <span className="text-[12px] font-normal text-muted">On Facebook: your page → Messenger → copy the m.me link. Blank = we use the Facebook page.</span>
        </label>
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
          <span className="text-[12.5px] text-muted">DTI, SEC or Mayor’s permit. Upload a photo of it under <a href="/portal?tab=docs" className="font-semibold text-wine">Documents</a>. Private, seen by admins only.</span>
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
        <label className={labelCls}>Organizer name<input name="org" list="sc-organizers" defaultValue={v("org", m.name)} className={input} /></label>
        <datalist id="sc-organizers">{venues.filter((x) => x.roles.includes("Organizer")).map((x) => <option key={x.name} value={x.name} />)}</datalist>
        <datalist id="sc-venues">{venues.filter((x) => x.roles.includes("Venue")).map((x) => <option key={x.name} value={x.name} />)}</datalist>
        <label className={labelCls}>Start date *<input name="date" type="date" required defaultValue={v("date")} className={input} /></label>
        <label className={labelCls}>End date (if multi-day)<input name="endDate" type="date" defaultValue={v("endDate")} className={input} /></label>
        <label className={labelCls}>Start time<input name="start" type="time" defaultValue={v("startTime")} className={input} /></label>
        <label className={labelCls}>End time<input name="end" type="time" defaultValue={v("endTime")} className={input} /></label>
        <label className={`${full} flex min-h-9 items-center gap-2 text-[14px] font-semibold text-ink-soft`}><input type="checkbox" name="online" value="1" defaultChecked={!!d.online} className="size-[17px] accent-crimson" /> Online event (webinar)</label>
        <label className={`${labelCls} ${full}`}>Online link (webinars only)<input name="link" type="url" defaultValue={v("link")} placeholder="Zoom, Facebook Live or Google Meet link" className={input} /></label>
        <LocationFields idPrefix="pe" province={d.online ? "" : v("province")} city={d.online ? "" : v("city")} />
        <label className={`${labelCls} ${full}`}>Venue<input name="venue" list="sc-venues" defaultValue={v("venue")} placeholder="Hall, farm, cockpit or arena (pick from the list to link its page)" className={input} /></label>
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
    {tab === "venue" && (
      <>
        <label className={`${labelCls} ${full}`}>Name *<input name="name" required maxLength={120} defaultValue={v("name")} placeholder="e.g. Coliseo de Calauan" className={input} /></label>
        <fieldset className={`m-0 border-0 p-0 ${full}`}>
          <legend className="mb-1.5 text-[13px] font-semibold text-ink-soft">This is a… * (tick both if the arena also organizes derbies)</legend>
          <div className="flex flex-wrap gap-x-5">
            {VENUE_ROLES.map((r) => <label key={r} className="flex min-h-9 items-center gap-2 text-[14px]"><input type="checkbox" name="role" value={r} defaultChecked={l ? ((d.roles as string[] | undefined) ?? []).includes(r) : r === "Venue"} className="size-[17px] accent-crimson" /> {r === "Venue" ? "Venue (cockpit arena)" : "Organizer"}</label>)}
          </div>
        </fieldset>
        <LocationFields required idPrefix="pv" province={v("province")} city={v("city")} />
        <label className={`${labelCls} ${full}`}>Street / barangay<input name="place" maxLength={200} defaultValue={v("place")} placeholder="e.g. Barangay Dayap" className={input} /></label>
        <label className={`${labelCls} ${full}`}>About<textarea name="about" rows={4} maxLength={2000} defaultValue={v("about")} className={`${input} py-2.5`} /></label>
        <label className={labelCls}>Public contact number{admin ? "" : " *"}<input name="phone" required={!admin} inputMode="tel" defaultValue={v("phone", m.phone)} className={input} /></label>
        <label className={labelCls}>Facebook page{admin ? "" : " *"}<input name="facebook" required={!admin} maxLength={300} defaultValue={v("facebook", m.facebook)} placeholder="https://www.facebook.com/…" className={input} /></label>
        <label className={`${labelCls} ${full}`}>Messenger link (for the Message button)<input name="messenger" maxLength={300} defaultValue={v("messenger")} placeholder="https://m.me/…" className={input} /></label>
        {up && <PhotoPicker name="profile" label="Logo or profile photo" />}
        {up && <PhotoPicker name="cover" label="Cover photo (the arena or venue)" />}
        <label className={`${labelCls} ${full}`}>Permits / franchise{admin ? " (private)" : " (private, admins check it)"}<input name="permits" maxLength={300} defaultValue={v("permits")} placeholder="e.g. LGU franchise ordinance no., Mayor’s permit 2026" className={input} /></label>
        {admin && <label className={`${labelCls} ${full}`}>Operator (private, admin only)<input name="operator" maxLength={200} defaultValue={v("operator")} className={input} /></label>}
        <p className={`m-0 text-[12.5px] text-muted ${full}`}>Venues are shown as “Permit not yet verified” until an admin checks the permit or franchise. Upload a photo of it under Documents for the Business Verified badge.</p>
      </>
    )}
    {tab === "reel" && (
      <>
        <label className={`${labelCls} ${full}`}>Video link * (Facebook, YouTube or TikTok)<input name="url" type="url" required defaultValue={v("url")} className={input} /></label>
        <label className={labelCls}>Title *<input name="title" required maxLength={160} defaultValue={v("title")} className={input} /></label>
        <label className={labelCls}>Topic *<select name="topic" required defaultValue={v("topic")} className={input}>{REEL_TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className={`${labelCls} ${full}`}>Creator or farm name<input name="farm" defaultValue={v("farm")} className={input} /></label>
        <label className={`${labelCls} ${full}`}>Short description<textarea name="desc" rows={3} maxLength={600} defaultValue={v("desc")} className={`${input} py-2.5`} /></label>
      </>
    )}
    {tab === "article" && (
      <>
        <label className={`${labelCls} ${full}`}>Title *<input name="title" required maxLength={160} defaultValue={v("title")} className={input} /></label>
        <label className={labelCls}>Topic *<select name="topic" required defaultValue={v("topic")} className={input}>{ARTICLE_TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className={labelCls}>Author or source *<input name="by" required maxLength={120} defaultValue={v("by", "Sabong Sentral")} className={input} /></label>
        <label className={`${labelCls} ${full}`}>Organization (optional)<input name="org" maxLength={120} defaultValue={v("org")} className={input} /></label>
        <label className={`${labelCls} ${full}`}>Short summary<input name="summary" maxLength={300} defaultValue={v("summary")} className={input} /></label>
        <label className={`${labelCls} ${full}`}>Article * (blank line between paragraphs)<textarea name="body" required rows={12} defaultValue={l ? ((d.body as string[] | undefined) ?? []).join("\n\n") : ""} className={`${input} py-2.5`} /></label>
        <label className={`${labelCls} ${full}`}>Sources / references (one per line)<textarea name="refs" rows={3} defaultValue={l ? ((d.refs as string[] | undefined) ?? []).join("\n") : ""} className={`${input} py-2.5`} /></label>
      </>
    )}
    {tab === "notice" && (
      <>
        <label className={labelCls}>Type *<select name="nkind" required defaultValue={v("kind", "Official Advisories")} className={input}>{NOTICE_KINDS.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className={labelCls}>Title *<input name="title" required maxLength={160} defaultValue={v("title")} className={input} /></label>
        <label className={`${labelCls} ${full}`}>Details *<textarea name="text" required rows={5} maxLength={1500} defaultValue={v("text")} className={`${input} py-2.5`} /></label>
        <label className={labelCls}>Issued by (for official advisories)<input name="issuer" placeholder="e.g. DA, BAI, Batangas Provincial Vet Office" defaultValue={v("issuer")} className={input} /></label>
        <label className={labelCls}>Applies to (area)<input name="scope" placeholder="e.g. Region IV-A, Batangas" defaultValue={v("scope")} className={input} /></label>
        <label className={labelCls}>Official source link<input name="url" type="url" placeholder="https://…" defaultValue={v("url")} className={input} /></label>
        <label className={labelCls}>Valid until<input name="expires" type="date" defaultValue={v("expires")} className={input} /></label>
        <p className={`m-0 text-[12.5px] text-muted ${full}`}>Official advisories need the issuer and the official source link.</p>
      </>
    )}
    {tab === "supplier" && (
      <>
        <label className={`${labelCls} ${full}`}>Supplier name *<input name="name" required maxLength={120} defaultValue={v("name")} className={input} /></label>
        <label className={labelCls}>Type *<select name="skind" required defaultValue={v("kind")} className={input}>{SUPPLIER_KINDS.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className={labelCls}>Location *<input name="place" required maxLength={120} placeholder="e.g. Lipa City, Batangas" defaultValue={v("place")} className={input} /></label>
        <label className={labelCls}>Public contact number<input name="phone" inputMode="tel" defaultValue={v("phone")} className={input} /></label>
        <label className={`${labelCls} ${full}`}>About<textarea name="about" rows={3} maxLength={600} defaultValue={v("about")} className={`${input} py-2.5`} /></label>
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
        <label className={labelCls}>Contact number{admin ? " (public number only)" : " *"}<input name="phone" required={!admin} inputMode="tel" defaultValue={v("phone", m.phone)} className={input} /></label>
        <LocationFields required idPrefix="pg" province={v("province")} city={v("city")} />
        {up && <div className={full}><PhotoPicker name="photos" label="Product photos" max={3} /></div>}
        <label className={`${labelCls} ${full}`}>Description<textarea name="desc" rows={4} defaultValue={v("desc")} className={`${input} py-2.5`} /></label>
        <p className={`m-0 text-[12.5px] text-muted ${full}`}>Not allowed: live birds, fighting weapons, regulated veterinary medicines, and anything gambling-related. No payments, checkout or delivery booking through Sabong Sentral.</p>
      </>
    )}
    {admin && (
      <label className={`${labelCls} ${full}`}>Source link (their Facebook page or post; admin only){["farm", "article", "notice", "supplier", "venue"].includes(tab) ? "" : " *"}
        <input name="vfb" required={!["farm", "article", "notice", "supplier", "venue"].includes(tab)} maxLength={300} defaultValue={v("verifyFacebook")} placeholder="https://www.facebook.com/…" className={input} />
      </label>
    )}
    {admin ? <input type="hidden" name="confirm" value="1" /> : (
    <label className={`${full} flex items-start gap-2 text-[13.5px] text-ink-soft`}>
      <input type="checkbox" name="confirm" value="1" required className="mt-0.5 size-[17px] flex-none accent-crimson" />
      I confirm the information is accurate, and I agree to the <a href="/legal/rules" className="font-semibold text-wine">Portal Rules</a>{tab === "good" ? <> and <a href="/legal/market" className="font-semibold text-wine">Market Notice</a></> : null}.
    </label>
    )}
    {canDraft ? (
      <div className={`${full} flex flex-wrap gap-2`}>
        <button type="submit" name="go" value="draft" className={`${btnGhost} flex-1`}>{isDraft ? "Save draft" : "Save as draft"}</button>
        <button type="submit" name="go" value="publish" className={`${btnPrimary} flex-1`}>{admin ? "Publish now" : "Submit for review"}</button>
        <p className="m-0 w-full text-[12.5px] text-muted">A draft is private: only you{admin ? "" : " and admins"} can see it. {admin ? "Publish it when it’s ready." : "Submit it when it’s ready and an admin reviews it."}</p>
      </div>
    ) : (
      <button type="submit" name="go" value="publish" className={`${btnPrimary} ${full}`}>{admin ? "Save changes (live now)" : l?.status === "approved" ? "Send changes for review" : "Save and resubmit"}</button>
    )}
  </form>
  );
}

