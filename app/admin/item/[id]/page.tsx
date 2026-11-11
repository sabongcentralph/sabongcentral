import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/adminGuard";
import { byId, counts, titleOf } from "@/lib/db";
import { one, type Search } from "@/lib/content";
import { toEmbed } from "@/lib/embed";
import { AdminNav } from "@/components/AdminNav";
import { Chip, Note, Page, btnGhost, btnPrimary, input, labelCls, statusTone } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Review" };

const PATH = { farm: "farms", event: "events", good: "goods", reel: "reels", article: "learn", notice: "notices", supplier: "suppliers" } as const;

function show(v: unknown): string {
  if (Array.isArray(v)) return v.map((x) => (typeof x === "object" && x && "name" in x ? (x as { name: string }).name : String(x))).join(", ");
  if (typeof v === "boolean") return v ? "Oo" : "Hindi";
  return String(v ?? "");
}

export default async function ReviewItem({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Search> }) {
  const email = await requireAdmin();
  const l = await byId(Number((await params).id));
  if (!l) notFound();
  const sp = await searchParams;
  const done = one(sp.done), err = one(sp.error);
  const c = await counts();
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
      <AdminNav email={email} at="/admin" counts={c} />
      <a href="/admin" className="text-[14px] font-semibold text-wine">← Approvals</a>
      {done && <Note tone="green">Done: <strong>{done.replace("_", " + ")}</strong>. Naka-log sa activity log.</Note>}
      {err === "reason" && <Note tone="red">Kailangan ng dahilan para mag-reject.</Note>}
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="plain">{l.kind}</Chip><Chip tone={statusTone(l.status)}>{l.status}</Chip>{l.isSample && <Chip tone="plain">sample</Chip>}
      </div>
      <h1 className="m-0 font-serif text-[28px] font-semibold leading-tight">{titleOf(l)}</h1>
      <p className="m-0 text-[13px] text-muted">Submitted by {l.submittedBy ?? "—"} · {l.createdAt}{l.reason ? ` · Last note: “${l.reason}”` : ""}</p>
      {isDerby && <Note tone="red">Derby listing: i-verify muna ang cockpit license at LGU event permit bago i-approve. Permits na sinabi: <strong>{show(data.permits) || "wala"}</strong></Note>}
      {l.kind === "farm" && <Note>Business registration na sinabi ng submitter: <strong>{data.docs ? "Mayroon (hihingin ang copy)" : "Wala pa"}</strong>. Ang “Business Verified” badge ay ibigay lang kapag na-review ang papers.</Note>}

      <div className="grid gap-5 md:grid-cols-[3fr_2fr]">
        <dl className="m-0 flex flex-col divide-y divide-line rounded-2xl border border-line bg-cream px-4 text-[14px]">
          {Object.entries(data).filter(([, v]) => show(v) !== "").map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 py-2.5 md:flex-row md:justify-between md:gap-4">
              <dt className="flex-none text-muted">{k}</dt><dd className="m-0 font-semibold md:text-right">{show(v)}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-4">
          {embed && (
            <div className={`overflow-hidden rounded-2xl bg-black ${embed.vertical ? "mx-auto aspect-[9/16] w-full max-w-[300px]" : "aspect-video"}`}>
              <iframe src={embed.src} title="Preview" className="size-full border-0" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          )}
          {l.kind === "reel" && !embed && <Note>Walang video link (sample). Sa totoong submission, dito makikita ang preview.</Note>}
          <form action="/api/admin/action" method="post" className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-4">
            <input type="hidden" name="id" value={l.id} />
            <label className={labelCls}>Reason / note (naka-log; required sa Reject)<textarea name="reason" rows={2} className={`${input} py-2`} /></label>
            <div className="flex flex-wrap gap-2">
              {l.status !== "approved" && act("approve", "Approve", btnPrimary)}
              {l.status !== "approved" && canBadge && act("approve_verified", "Approve + Business Verified", btnPrimary)}
              {l.status === "approved" && canBadge && (badgeOn ? act("unverify", "Remove badge", btnGhost) : act("verify", "Give Business Verified", btnGhost))}
              {l.status === "pending" && act("reject", "Reject", `${btnGhost} border-wine text-wine`)}
              {l.status === "approved" && act("hide", "Hide from public", `${btnGhost} border-wine text-wine`)}
              {(l.status === "hidden" || l.status === "rejected") && act("restore", "Restore / approve", btnGhost)}
            </div>
            <p className="m-0 text-[12px] text-muted">Ang pag-approve ng account ay hindi nag-a-approve ng listings. Bawat action ay naka-log kasama ang pangalan mo.</p>
          </form>
          {l.status === "approved" && <a href={`/${PATH[l.kind]}/${l.slug}`} className="text-[14px] font-semibold text-wine">Tingnan sa public site ↗</a>}
        </div>
      </div>
    </Page>
  );
}
