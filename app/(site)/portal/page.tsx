import type { Metadata } from "next";
import { one, type Search } from "@/lib/content";
import { ListingForm } from "@/components/ListingForm";
import { PhotoPicker } from "@/components/PhotoPicker";
import { uploadsOn } from "@/lib/media";
import { Chip, Note, Page, PageHead, btnGhost, btnPrimary, input, labelCls } from "@/components/ui";
import { DOC_TYPES, MAX_DOC_PAGES, docLabel, docsOf, daysToExpiry, isValid, type Doc } from "@/lib/docs";
import { ROLES, STATUS_LABEL, canSubmit, currentMember, listingsOf, passwordState, testMode, type Member } from "@/lib/members";
import { AVAILABILITY, EVENT_STATUSES, MARKET_DAYS, UNPUBLISHED_BY_OWNER, availOf, byId, daysLeft, editIds, titleOf, type GoodData, type Listing, type QueueStatus } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Portal" };

const TABS = [["home", "My listings"], ["farm", "+ Farm"], ["event", "+ Event or seminar"], ["good", "+ Market item"], ["docs", "Documents"], ["account", "Account"]] as const;
type Tab = (typeof TABS)[number][0];

const Honeypot = () => <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />;


const box = "flex flex-col gap-4 rounded-2xl border border-line bg-cream p-4 md:grid md:grid-cols-2";
const full = "md:col-span-2";
const tone = (q: QueueStatus) => (q === "Approved" ? "green" : q === "Rejected" || q === "Hidden" ? "red" : q === "Needs Changes" || q === "In Review" ? "gold" : "plain") as "green" | "red" | "gold" | "plain";
const PATH = { farm: "farms", event: "events", good: "market", reel: "reels", article: "learn", notice: "notices", supplier: "suppliers" } as const;

// Sign in with email and password. Accounts are created by Sabong Central for now;
// email codes come back once email sending is set up (EMAIL_ENABLED).
async function SignIn({ sp }: { sp: Search }) {
  const step = one(sp.step), email = one(sp.email), error = one(sp.error);
  const codes = !(await testMode());
  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[460px] flex-col gap-5">
        <PageHead kicker="Member Portal" title={step === "code" ? "Enter your code" : "Sign in"} sub="For farm owners, event and seminar organizers, venues, Market sellers and suppliers." />
        {error && <Note tone="red">{error}</Note>}
        {step === "code" && email && codes ? (
          <form action="/api/member/verify" method="post" className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-5">
            <input type="hidden" name="email" value={email} />
            <p className="m-0 text-[14px] text-ink-soft">We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.</p>
            <label className={labelCls}>6-digit code<input name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} autoFocus className={`${input} text-center text-[22px] tracking-[0.35em]`} /></label>
            <button type="submit" className={btnPrimary}>Continue</button>
            <a href="/portal" className="text-center text-[13.5px] font-semibold text-wine">Use a different email or get a new code</a>
          </form>
        ) : (
          <form action="/api/member/login" method="post" className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-5">
            <Honeypot />
            <label className={labelCls}>Email<input name="email" type="email" required autoComplete="email" defaultValue={email} className={input} /></label>
            <label className={labelCls}>Password<input name="password" type="password" required autoComplete="current-password" className={input} /></label>
            <button type="submit" className={btnPrimary}>Sign in</button>
            <p className="m-0 text-[12.5px] text-muted">Forgot your password? <a href="/contact" className="font-semibold text-wine">Contact us</a> and we’ll send you a new temporary one.</p>
          </form>
        )}
        {codes && step !== "code" && (
          <form action="/api/member/code" method="post" className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-5">
            <Honeypot />
            <span className="text-[14px] font-semibold">New here, or prefer a code?</span>
            <label className={labelCls}>Email<input name="email" type="email" required autoComplete="email" className={input} /></label>
            <button type="submit" className={btnGhost}>Email me a sign-in code</button>
          </form>
        )}
        {!codes && (
          <div className="flex flex-col gap-1.5 rounded-2xl border border-dashed border-sand p-4 text-[13.5px] text-ink-soft">
            <strong className="text-ink">No account yet?</strong>
            <span>Portal accounts are created by Sabong Central after a quick check. Send us your name, mobile number, Facebook page and what you do (farm, organizer, seller…) through <a href="/contact" className="font-semibold text-wine">Contact Us</a>, and we’ll send you a temporary password.</span>
          </div>
        )}
        <p className="m-0 text-[13.5px] text-ink-soft">Just sharing an article, an educational reel or a community announcement? Use the <a href="/submit" className="font-semibold text-wine">public submission form</a>; no account needed.</p>
      </div>
    </Page>
  );
}

// First sign-in with a temporary password (and the Account tab): choose a password.
function PasswordForm({ first, needTerms }: { first: boolean; needTerms: boolean }) {
  return (
    <form action="/api/member/password" method="post" className={box}>
      {!first && <label className={`${labelCls} ${full}`}>Current password<input name="current" type="password" required autoComplete="current-password" className={input} /></label>}
      <label className={labelCls}>New password (10+ characters)<input name="next" type="password" required minLength={10} autoComplete="new-password" className={input} /></label>
      <label className={labelCls}>New password again<input name="again" type="password" required minLength={10} autoComplete="new-password" className={input} /></label>
      {needTerms && (
        <>
          <label className={`${full} flex items-start gap-2 text-[13.5px] text-ink-soft`}><input type="checkbox" name="adult" value="1" required className="mt-0.5 size-[17px] flex-none accent-crimson" /> I am 21 years old or older.</label>
          <label className={`${full} flex items-start gap-2 text-[13.5px] text-ink-soft`}><input type="checkbox" name="terms" value="1" required className="mt-0.5 size-[17px] flex-none accent-crimson" /> <span>I agree to the <a href="/legal/rules" className="font-semibold text-wine">Portal Rules</a>, <a href="/legal/terms" className="font-semibold text-wine">Terms of Use</a> and <a href="/legal/privacy" className="font-semibold text-wine">Privacy Notice</a>.</span></label>
        </>
      )}
      <button type="submit" className={`${btnPrimary} ${full}`}>{first ? "Save my password" : "Change password"}</button>
    </form>
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
          <label className={`${full} flex items-start gap-2 text-[13.5px] text-ink-soft`}><input type="checkbox" name="adult" value="1" required className="mt-0.5 size-[17px] flex-none accent-crimson" /> I am 21 years old or older.</label>
          <label className={`${full} flex items-start gap-2 text-[13.5px] text-ink-soft`}><input type="checkbox" name="terms" value="1" required className="mt-0.5 size-[17px] flex-none accent-crimson" /> <span>I agree to the <a href="/legal/rules" className="font-semibold text-wine">Portal Rules</a>, <a href="/legal/terms" className="font-semibold text-wine">Terms of Use</a> and <a href="/legal/privacy" className="font-semibold text-wine">Privacy Notice</a>. Sabong Central never asks for government IDs.</span></label>
        </>
      )}
      <button type="submit" className={`${btnPrimary} ${full}`}>{first ? "Create my account" : "Save changes"}</button>
    </form>
  );
}

const DONE: Record<string, string> = {
  state: "Status updated.", renew: `Renewed. It stays listed for another ${MARKET_DAYS} days.`, unpublish: "Unpublished. It is no longer on the public site.",
  uploaded: "Document received. An admin will check it.", deleted: "Document deleted.",
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

const docTone = (s: string) => (s === "approved" ? "green" : s === "rejected" ? "red" : "gold") as "green" | "red" | "gold";

// Business papers for the Business Verified badge: photos only, private to admins.
function Docs({ docs, up, blocked }: { docs: Doc[]; up: boolean; blocked: boolean }) {
  const verified = docs.some(isValid);
  return (
    <>
      <div className="flex flex-col gap-1">
        <h2 className="m-0 font-serif text-[22px] font-semibold">Business documents</h2>
        <p className="m-0 text-[14px] text-ink-soft">Upload a clear photo of your DTI, SEC, Mayor’s permit or other business paper. Once an admin approves it, your farm and Market listings get the <strong>Business Verified</strong> badge. Optional for sellers.</p>
        <p className="m-0 text-[12.5px] text-muted">Private: only Sabong Central admins can see these, and every view is logged. Photos only (no PDF). Never upload government IDs.</p>
      </div>
      {verified && <Note tone="green"><strong>Business Verified.</strong> You have an approved document on file.</Note>}
      {docs.length > 0 && (
        <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-2xl border border-line bg-cream p-0">
          {docs.map((d) => {
            const left = daysToExpiry(d);
            return (
              <li key={d.id} className="flex flex-col gap-1.5 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2"><span className="flex-1 text-[14.5px] font-semibold">{d.type}</span><Chip tone={docTone(d.status)}>{docLabel(d.status)}</Chip></div>
                <span className={`text-[12.5px] ${left !== null && left <= 30 ? "font-semibold text-wine" : "text-muted"}`}>
                  Uploaded {d.created_at.slice(0, 10)} · {left === null ? "no expiry date" : left <= 0 ? `expired ${d.expires}` : `expires ${d.expires}${left <= 30 ? ` (${left} days left)` : ""}`}
                </span>
                {d.status === "rejected" && d.note && <p className="m-0 text-[13px] text-wine">Admin note: “{d.note}”</p>}
                <form action="/api/member/doc" method="post"><input type="hidden" name="id" value={d.id} /><button name="action" value="delete" className={`${small} text-muted`}>Delete</button></form>
              </li>
            );
          })}
        </ul>
      )}
      {!blocked && (up ? (
        <form action="/api/member/doc" method="post" encType="multipart/form-data" className={box}>
          <label className={labelCls}>Document type *
            <select name="type" required defaultValue="" className={input}><option value="">Select</option>{DOC_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label className={labelCls}>Expiry date (if it has one)<input name="expires" type="date" className={input} /></label>
          <div className={full}><PhotoPicker name="doc" label="Photo of the document *" max={MAX_DOC_PAGES} doc required hint={`Up to ${MAX_DOC_PAGES} photos (e.g. front and back). Make sure the name and number are readable.`} /></div>
          <button type="submit" className={`${btnPrimary} ${full}`}>Upload for review</button>
        </form>
      ) : <Note>Document upload isn’t available right now.</Note>)}
    </>
  );
}

export default async function PortalPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const m = await currentMember();
  if (!m) return <SignIn sp={sp} />;
  const error = one(sp.error);
  const pw = await passwordState(m.id);
  if (pw.mustChange) {
    return (
      <Page>
        <div className="mx-auto flex w-full max-w-[560px] flex-col gap-5">
          <PageHead kicker="Member Portal" title={`Welcome, ${m.name.split(" ")[0] || "there"}`} sub="Please choose your own password to replace the temporary one." />
          {error && <Note tone="red">{error}</Note>}
          <PasswordForm first needTerms={!pw.terms} />
          <form action="/api/member/logout" method="post"><button type="submit" className={btnGhost}>Sign out</button></form>
        </div>
      </Page>
    );
  }
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
  const docs = await docsOf(m.id);
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
        {one(sp.welcome) === "1" && <Note tone="green"><strong>Welcome!</strong> {m.status === "active" ? "Your password is saved. You can now submit listings; they go live after review." : "Your account is waiting for admin approval. You can already submit listings; they go live after review."}</Note>}
        {m.status === "pending" && one(sp.welcome) !== "1" && <Note>Your account is waiting for admin approval. Listings you submit are reviewed before they go public.</Note>}
        {blocked && <Note tone="red">Your account is {STATUS_LABEL[m.status].toLowerCase()}, so you can’t submit listings. Please <a href="/contact" className="font-semibold">contact us</a>.</Note>}
        {sent && <Note tone="green"><strong>Received!</strong> Your listing is pending review. You can follow it under My listings.</Note>}
        {edited === "waiting" && <Note tone="green"><strong>Changes sent.</strong> Your listing stays live as it was until an admin approves the edit.</Note>}
        {edited === "resubmitted" && <Note tone="green"><strong>Saved.</strong> Your listing is back in the review queue.</Note>}
        {tab !== "docs" && docs.some((d) => d.status === "approved" && (daysToExpiry(d) ?? 999) <= 30) && <Note tone="red">A business document is expiring or has expired. <a href="/portal?tab=docs" className="font-semibold">Upload the renewed one</a> to keep your Business Verified badge.</Note>}
        {done && <Note tone="green">{DONE[done] ?? "Done."}</Note>}
        {error && <Note tone="red">{error}</Note>}

        <nav aria-label="Portal" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {TABS.filter(([k]) => !blocked || k === "home" || k === "docs" || k === "account").map(([k, label]) => (
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

        {(tab === "farm" || tab === "event" || tab === "good") && !blocked && <ListingForm tab={tab} up={up} who={m} />}

        {tab === "edit" && (editing && (editing.kind === "farm" || editing.kind === "event" || editing.kind === "good") && !blocked ? (
          <>
            <div className="flex flex-col gap-1">
              <a href="/portal" className="text-[13.5px] font-semibold text-wine">← My listings</a>
              <h2 className="m-0 font-serif text-[22px] font-semibold">Edit: {titleOf(editing)}</h2>
              <p className="m-0 text-[13.5px] text-ink-soft">{editing.status === "approved" ? "Your listing stays live as it is now. The changes go public after an admin checks them." : "Saving sends this listing back to the review queue."}</p>
            </div>
            <ListingForm tab={editing.kind} up={up} who={m} l={editing} />
          </>
        ) : <Note tone="red">{blocked ? "Your account can’t edit listings right now." : "Listing not found."}</Note>)}

        {tab === "docs" && <Docs docs={docs} up={up} blocked={m.status === "suspended" || m.status === "closed"} />}

        {tab === "account" && (
          <>
            {one(sp.saved) && <Note tone="green">{one(sp.saved) === "pw" ? "Password changed." : "Saved."}</Note>}
            <ProfileForm m={m} first={false} />
            <h2 className="m-0 mt-2 text-[17px] font-bold">{pw.has ? "Change password" : "Set a password"}</h2>
            <PasswordForm first={!pw.has} needTerms={false} />
            <form action="/api/member/logout" method="post"><button type="submit" className={btnGhost}>Sign out</button></form>
          </>
        )}
      </div>
    </Page>
  );
}
