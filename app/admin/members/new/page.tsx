import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { one, type Search } from "@/lib/content";
import { ROLES } from "@/lib/members";
import { Note, Page, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create account" };

export default async function NewMember({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const error = one((await searchParams).error);
  return (
    <Page>
      <a href="/admin/members" className="text-[14px] font-semibold text-wine">← Members</a>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-serif text-[26px] font-semibold">Create a Portal account</h1>
        <p className="m-0 text-[13.5px] text-muted">For a farm, organizer, venue, seller or supplier you have checked. You get a temporary password to send them (for example on Messenger). They choose their own password the first time they sign in.</p>
      </div>
      {error && <Note tone="red">{error}</Note>}
      <form action="/api/admin/member" method="post" className="flex max-w-[720px] flex-col gap-4 rounded-2xl border border-line bg-cream p-4 md:grid md:grid-cols-2">
        <input type="hidden" name="action" value="create" />
        <label className={`${labelCls} md:col-span-2`}>Name or business name *<input name="name" required maxLength={120} className={input} /></label>
        <label className={labelCls}>Email *<input name="email" type="email" required className={input} /></label>
        <label className={labelCls}>Mobile number *<input name="phone" required inputMode="tel" placeholder="09XX XXX XXXX" className={input} /></label>
        <fieldset className="m-0 flex flex-col gap-1 border-0 p-0 md:col-span-2">
          <legend className="mb-1.5 text-[13px] font-semibold text-ink-soft">Roles *</legend>
          <div className="grid gap-x-3 sm:grid-cols-2">
            {ROLES.map(([k, label]) => <label key={k} className="flex min-h-10 items-center gap-2 text-[14px]"><input type="checkbox" name="role" value={k} className="size-[17px] accent-crimson" /> {label}</label>)}
          </div>
        </fieldset>
        <label className={`${labelCls} md:col-span-2`}>Facebook page or profile link *<input name="facebook" required maxLength={300} placeholder="https://www.facebook.com/theirpage" className={input} /></label>
        <label className={`${labelCls} md:col-span-2`}>Organization or business link (optional)<input name="org_link" maxLength={300} className={input} /></label>
        <button type="submit" className={`${btnPrimary} md:col-span-2`}>Create account</button>
      </form>
    </Page>
  );
}
