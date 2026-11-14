import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { requireAdmin } from "@/lib/adminGuard";
import { one, type Search } from "@/lib/content";
import { titleOf } from "@/lib/db";
import { ROLES, STATUS_LABEL, listingsOf, memberById, memberTone, passwordState } from "@/lib/members";
import { docsOf } from "@/lib/docs";
import { AdminDocCard } from "@/components/admin/DocCard";
import { Chip, Note, Page, btnGhost, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Member" };

const safe = (u: string) => (/^https?:\/\//.test(u) ? u : null);

export default async function AdminMember({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Search> }) {
  await requireAdmin();
  const m = await memberById(Number((await params).id));
  if (!m) notFound();
  const sp = await searchParams;
  const [mine, docs, pw] = await Promise.all([listingsOf(m.id), docsOf(m.id), passwordState(m.id)]);
  const done = one(sp.done);
  const temp = done === "created" || done === "reset" ? (await cookies()).get("sc_temp")?.value : undefined;
  const host = (await headers()).get("host") ?? "sabongsentral.ph";
  const open = Number(one(sp.open)) || 0;
  const act = (a: string, label: string, cls: string) => <button type="submit" name="action" value={a} className={cls}>{label}</button>;
  const fb = safe(m.facebook), org = safe(m.org_link);
  return (
    <Page>
      <a href="/admin/members" className="text-[14px] font-semibold text-wine">← Members</a>
      {one(sp.error) === "reason" && <Note tone="red">A reason is required to restrict, suspend or close an account.</Note>}
      {temp ? (
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-gold bg-cream p-4">
          <strong className="text-[15px]">{done === "created" ? "Account created." : "New temporary password."} Send this to {m.name || "them"}:</strong>
          <pre className="m-0 whitespace-pre-wrap rounded-xl bg-ivory p-3 font-sans text-[14px] select-all">{`Hi ${m.name.split(" ")[0] || ""}! Your Sabong Sentral Portal account is ready.
Sign in at https://${host}/portal
Email: ${m.email}
Temporary password: ${decodeURIComponent(temp)}
You will choose your own password the first time you sign in.`}</pre>
          <span className="text-[12.5px] text-muted">Shown for 5 minutes only. Send it privately (Messenger or text). If it’s lost, press “Reset password” for a new one.</span>
        </div>
      ) : done && <Note tone="green">Saved.</Note>}
      <div className="flex flex-wrap items-center gap-2"><Chip tone={memberTone(m.status)}>{STATUS_LABEL[m.status]}</Chip>{m.roles.map((r) => <Chip key={r} tone="plain">{ROLES.find(([k]) => k === r)?.[1] ?? r}</Chip>)}</div>
      <h1 className="m-0 font-serif text-[28px] font-semibold">{m.name || m.email}</h1>
      <div className="grid gap-5 md:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-4">
          <dl className="m-0 flex flex-col divide-y divide-line rounded-2xl border border-line bg-cream px-4 text-[14px]">
            {([["Email", m.email], ["Mobile", m.phone], ["Joined", m.created_at], ["Last sign-in", m.last_login ?? "—"]] as const).map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 py-2.5 md:flex-row md:justify-between"><dt className="text-muted">{k}</dt><dd className="m-0 font-semibold">{v || "—"}</dd></div>
            ))}
          </dl>
          <div className="flex flex-col gap-1.5 rounded-2xl border border-gold bg-cream p-4 text-[14px]">
            <strong>Verification links</strong>
            <span>Facebook: {fb ? <a href={fb} target="_blank" rel="noopener noreferrer nofollow" className="break-all font-semibold text-wine">{m.facebook}</a> : <span className="text-muted">none</span>}</span>
            <span>Organization link: {org ? <a href={org} target="_blank" rel="noopener noreferrer nofollow" className="break-all font-semibold text-wine">{m.org_link}</a> : <span className="text-muted">none</span>}</span>
            <span className="text-[12.5px] text-muted">Check that the page is real, active and matches the name.</span>
          </div>
          <section className="flex flex-col gap-2">
            <h2 className="m-0 text-[17px] font-bold">Business documents ({docs.length})</h2>
            {one(sp.error) === "note" && <Note tone="red">Please write a note so the member knows why it wasn’t accepted.</Note>}
            {docs.length === 0 ? <p className="m-0 text-[14px] text-muted">None uploaded.</p> : docs.map((d) => <AdminDocCard key={d.id} d={d} open={open === d.id} next={`/admin/members/${m.id}`} />)}
          </section>
          <section className="flex flex-col gap-2">
            <h2 className="m-0 text-[17px] font-bold">Listings ({mine.length})</h2>
            {mine.length === 0 ? <p className="m-0 text-[14px] text-muted">No listings yet.</p> : (
              <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-2xl border border-line bg-cream p-0">
                {mine.map(({ l, qs }) => <li key={l.id}><a href={`/admin/item/${l.id}`} className="flex items-center gap-3 px-4 py-2.5 text-ink no-underline"><span className="flex-1 text-[14px] font-semibold">{titleOf(l)}</span><Chip tone="plain">{qs}</Chip></a></li>)}
              </ul>
            )}
          </section>
        </div>
        <form action="/api/admin/member" method="post" className="flex h-fit flex-col gap-3 rounded-2xl border border-line bg-cream p-4">
          <input type="hidden" name="id" value={m.id} />
          <label className={labelCls}>Reason (logged; required to restrict, suspend or close)<textarea name="reason" rows={2} className={`${input} py-2`} /></label>
          <div className="flex flex-wrap gap-2">
            {m.status === "pending" && act("approve", "Approve account", btnPrimary)}
            {(m.status === "restricted" || m.status === "suspended" || m.status === "closed") && act("reactivate", "Reactivate", btnPrimary)}
            {(m.status === "active" || m.status === "pending") && act("restrict", "Restrict", btnGhost)}
            {m.status !== "suspended" && m.status !== "closed" && act("suspend", "Suspend", `${btnGhost} border-wine text-wine`)}
            {m.status !== "closed" && act("close", "Close account", `${btnGhost} border-wine text-wine`)}
          </div>
          <div className="flex flex-col gap-2 border-t border-line pt-3">
            <span className="text-[13px] text-muted">Password: {!pw.has ? "none yet (signed up with an email code)" : pw.mustChange ? "temporary, not changed yet" : "set by the member"}</span>
            {act("reset_password", pw.has ? "Reset password" : "Create a temporary password", `${btnGhost} w-fit`)}
          </div>
          <p className="m-0 text-[12px] text-muted">Approving an account does not approve its listings; each listing is still reviewed. Restricted members can sign in but can’t submit. Suspended or closed members are signed out.</p>
        </form>
      </div>
    </Page>
  );
}
