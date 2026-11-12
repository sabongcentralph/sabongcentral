import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/adminGuard";
import { AVAILABILITY, EVENT_STATUSES, availOf, byId, counts, flagsOf, historyFor, notesFor, openReportTargets, queueStatus, reportsAbout, stages, titleOf, type GoodData } from "@/lib/db";
import { one, type Search } from "@/lib/content";
import { toEmbed } from "@/lib/embed";
import { PosterThumb } from "@/components/admin/PosterThumb";
import { Chip, Note, Page, btnGhost, btnPrimary, input, labelCls, statusTone } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Review" };

const PATH = { farm: "farms", event: "events", good: "market", reel: "reels", article: "learn", notice: "notices", supplier: "suppliers" } as const;

function safeHref(v: string): string | null {
  const t = v.trim();
  if (!t) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch { return null; }
}

// Facebook page and organization link the submitter gave for verification.
function VerifyLinks({ fb, link }: { fb: string; link: string }) {
  const a = safeHref(fb), b = safeHref(link);
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-gold bg-cream p-4 text-[14px]">
      <strong>Verification links</strong>
      <span>Facebook: {a ? <a href={a} target="_blank" rel="noopener noreferrer nofollow" className="break-all font-semibold text-wine">{fb}</a> : <span className="text-muted">none given (older or sample listing)</span>}</span>
      <span>Organization link: {b ? <a href={b} target="_blank" rel="noopener noreferrer nofollow" className="break-all font-semibold text-wine">{link}</a> : <span className="text-muted">none given</span>}</span>
      <span className="text-[12.5px] text-muted">Check that the page is real, active and matches the name on this submission. Private: never shown publicly.</span>
    </div>
  );
}

function show(v: unknown): string {
  if (Array.isArray(v)) return v.map((x) => (typeof x === "object" && x && "name" in x ? (x as { name: string }).name : String(x))).join(", ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v ?? "");
}

export default async function ReviewItem({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Search> }) {
  const email = await requireAdmin();
  const l = await byId(Number((await params).id));
  if (!l) notFound();
  const sp = await searchParams;
  const done = one(sp.done), err = one(sp.error);
  const [c, st, notes, history, reps, targets] = await Promise.all([counts(), stages(), notesFor(l.id), historyFor(l), reportsAbout(l), openReportTargets()]);
  const qs = queueStatus(l.status, st.get(l.id));
  const flags = flagsOf(l, targets);
  const data = l.data as unknown as Record<string, unknown>;
  const embed = l.kind === "reel" ? toEmbed(String(data.url ?? "")) : null;
  const canBadge = l.kind === "farm" || l.kind === "good";
  const badgeOn = l.kind === "farm" ? !!data.verified : !!data.sellerVerified;
  const isDerby = l.kind === "event" && !!data.derby;
  const act = (action: string, label: string, cls: string) => (
    <button type="submit" name="action" value={action} className={cls}>{label}</button>
  );

  return (
    <Page>
      <a href="/admin/queue" className="text-[14px] font-semibold text-wine">← Review queue</a>
      {done && <Note tone="green">Done: <strong>{done.replace("_", " + ")}</strong>. Recorded in the activity log.</Note>}
      {err === "reason" && <Note tone="red">A reason is required to reject or request changes. The submitter will see it.</Note>}
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="plain">{l.kind}</Chip><Chip tone={statusTone(l.status)}>{qs}</Chip>{flags.map((f) => <Chip key={f} tone="red">{f}</Chip>)}{l.isSample && <Chip tone="plain">sample</Chip>}
      </div>
      <h1 className="m-0 font-serif text-[28px] font-semibold leading-tight">{titleOf(l)}</h1>
      <p className="m-0 text-[13px] text-muted">Submitted by {l.submittedBy ?? "—"} · {l.createdAt}{l.reason ? ` · Last note: “${l.reason}”` : ""}</p>
      <VerifyLinks fb={String(data.verifyFacebook ?? (l.kind === "farm" ? data.facebook ?? "" : ""))} link={String(data.verifyLink ?? "")} />
      {isDerby && <Note tone="red">Derby listing: verify the cockpit license and LGU event permit before approving. Permits stated: <strong>{show(data.permits) || "none"}</strong></Note>}
      {l.kind === "farm" && <Note>Business registration stated by submitter: <strong>{data.docs ? "Yes (request a copy)" : "Not yet"}</strong>. Only give the “Business Verified” badge after reviewing the papers.</Note>}

      <div className="grid gap-5 md:grid-cols-[3fr_2fr]">
        <dl className="m-0 flex flex-col divide-y divide-line rounded-2xl border border-line bg-cream px-4 text-[14px]">
          {Object.entries(data).filter(([, v]) => show(v) !== "").map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 py-2.5 md:flex-row md:justify-between md:gap-4">
              <dt className="flex-none text-muted">{k}</dt><dd className="m-0 font-semibold md:text-right">{show(v)}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-4">
          {l.kind === "event" && <PosterThumb title={titleOf(l)} group={String(data.group ?? "")} poster={String(data.poster ?? "")} className="!h-auto !w-full aspect-[16/9] [&>span:nth-child(2)]:!text-[26px]" />}
          {embed && (
            <div className={`overflow-hidden rounded-2xl bg-black ${embed.vertical ? "mx-auto aspect-[9/16] w-full max-w-[300px]" : "aspect-video"}`}>
              <iframe src={embed.src} title="Preview" className="size-full border-0" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          )}
          {l.kind === "reel" && !embed && <Note>No video link (sample). Real submissions show a preview here.</Note>}
          <form action="/api/admin/action" method="post" className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-4">
            <input type="hidden" name="id" value={l.id} />
            <label className={labelCls}>Reason for the submitter (logged; required to reject or request changes)<textarea name="reason" rows={2} className={`${input} py-2`} /></label>
            <div className="flex flex-wrap gap-2">
              {l.status !== "approved" && act("approve", "Approve", btnPrimary)}
              {l.status !== "approved" && canBadge && act("approve_verified", "Approve + Business Verified", btnPrimary)}
              {l.status === "approved" && canBadge && (badgeOn ? act("unverify", "Remove badge", btnGhost) : act("verify", "Give Business Verified", btnGhost))}
              {qs === "New" && act("in_review", "Mark In Review", btnGhost)}
              {l.status === "pending" && act("request_changes", "Request changes", btnGhost)}
              {l.status === "pending" && act("reject", "Reject", `${btnGhost} border-wine text-wine`)}
              {l.status === "approved" && act("hide", "Hide / unpublish", `${btnGhost} border-wine text-wine`)}
              {qs !== "Archived" && act("archive", "Archive", btnGhost)}
              {(l.status === "hidden" || l.status === "rejected") && act("restore", "Restore / approve", btnGhost)}
            </div>
            <p className="m-0 text-[12px] text-muted">Approval means the item passed platform review; it is not an endorsement. Never approve betting, odds, livestreamed fights or gambling content. Every action is logged with your name.</p>
          </form>
          <form action="/api/admin/action" method="post" className="flex flex-col gap-2 rounded-2xl border border-line bg-cream p-4">
            <input type="hidden" name="id" value={l.id} />
            <input type="hidden" name="action" value="note" />
            <label className={labelCls}>Internal note (admins only, never public)<textarea name="note" rows={2} className={`${input} py-2`} /></label>
            <button type="submit" className={`${btnGhost} self-start`}>Add note</button>
            {notes.length > 0 && (
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px]">
                {notes.map((n) => <li key={n.id} className="rounded-xl bg-ivory px-3 py-2"><span className="text-muted">{n.created_at.slice(0, 16)} · {n.admin}</span><br />{n.body}</li>)}
              </ul>
            )}
          </form>
          <section className="flex flex-col gap-1.5 rounded-2xl border border-line bg-cream p-4 text-[13px]">
            <h2 className="m-0 text-[15px] font-bold">Review history</h2>
            {history.length === 0 ? <span className="text-muted">No admin actions yet.</span> : history.map((h) => (
              <span key={h.id}><span className="text-muted">{h.created_at.slice(0, 16)}</span> · <strong>{h.action}</strong>{h.reason ? ` · “${h.reason}”` : ""} · {h.admin}</span>
            ))}
            <h2 className="m-0 mt-2 text-[15px] font-bold">Reports about this item</h2>
            {reps.length === 0 ? <span className="text-muted">None.</span> : reps.map((r) => (
              <span key={r.id}><span className="text-muted">#{r.id} · {r.created_at.slice(0, 16)}</span> · <strong>{r.reason}</strong> · {r.status}{r.details ? ` · ${r.details.slice(0, 120)}` : ""}</span>
            ))}
          </section>
          {(l.kind === "event" || l.kind === "good") && (
            <form action="/api/admin/action" method="post" className="flex flex-wrap items-end gap-2 rounded-2xl border border-line bg-cream p-4">
              <input type="hidden" name="id" value={l.id} />
              <input type="hidden" name="action" value="set_state" />
              <label className={`${labelCls} flex-1`}>{l.kind === "event" ? "Event status" : "Availability"}
                <select name="state" defaultValue={l.kind === "event" ? String(data.status ?? "Upcoming") : availOf(l.data as GoodData)} className={input}>
                  {(l.kind === "event" ? EVENT_STATUSES : AVAILABILITY).map((v) => <option key={v}>{v}</option>)}
                </select>
              </label>
              <button type="submit" className={btnGhost}>Save</button>
            </form>
          )}
          {l.status === "approved" && <a href={`/${l.kind === "event" && !isDerby ? "education" : PATH[l.kind]}/${l.slug}`} className="text-[14px] font-semibold text-wine">View on public site ↗</a>}
        </div>
      </div>
    </Page>
  );
}
