import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { counts } from "@/lib/db";
import { one, type Search } from "@/lib/content";
import { AdminNav } from "@/components/AdminNav";
import { Note, Page, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin account" };

export default async function AdminAccount({ searchParams }: { searchParams: Promise<Search> }) {
  const email = await requireAdmin();
  const err = one((await searchParams).error);
  return (
    <Page>
      <AdminNav email={email} at="/admin/account" counts={await counts()} />
      <form action="/api/admin/password" method="post" className="flex w-full max-w-[440px] flex-col gap-4 rounded-2xl border border-line bg-cream p-5">
        <h1 className="m-0 font-serif text-[24px] font-semibold">Palitan ang password</h1>
        {err === "weak" && <Note tone="red">Dapat 12+ characters at magkapareho ang dalawang bagong password.</Note>}
        {err === "current" && <Note tone="red">Mali ang kasalukuyang password.</Note>}
        <label className={labelCls}>Kasalukuyang password<input name="current" type="password" required autoComplete="current-password" className={input} /></label>
        <label className={labelCls}>Bagong password (12+ characters)<input name="next" type="password" required minLength={12} autoComplete="new-password" className={input} /></label>
        <label className={labelCls}>Ulitin ang bagong password<input name="confirm" type="password" required minLength={12} autoComplete="new-password" className={input} /></label>
        <button type="submit" className={btnPrimary}>I-save</button>
        <p className="m-0 text-[12px] text-muted">Mala-logout ka sa lahat ng device pagkatapos.</p>
      </form>
    </Page>
  );
}
