import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { one, type Search } from "@/lib/content";
import { Note, Page, btnGhost, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin account" };

export default async function AdminAccount({ searchParams }: { searchParams: Promise<Search> }) {
  const email = await requireAdmin();
  const err = one((await searchParams).error);
  return (
    <Page>
      <div className="flex w-full max-w-[440px] flex-wrap items-center gap-3 rounded-2xl border border-line bg-cream p-5">
        <div className="flex-1"><div className="text-[15px] font-bold">Signed in</div><div className="text-[13px] text-muted">{email} · Super Admin</div></div>
        <form action="/api/admin/logout" method="post"><button type="submit" className={btnGhost}>Sign out</button></form>
      </div>
      <form action="/api/admin/password" method="post" className="flex w-full max-w-[440px] flex-col gap-4 rounded-2xl border border-line bg-cream p-5">
        <h1 className="m-0 font-serif text-[24px] font-semibold">Change password</h1>
        {err === "weak" && <Note tone="red">Use 12+ characters, and make sure both new passwords match.</Note>}
        {err === "current" && <Note tone="red">Your current password is incorrect.</Note>}
        <label className={labelCls}>Current password<input name="current" type="password" required autoComplete="current-password" className={input} /></label>
        <label className={labelCls}>New password (12+ characters)<input name="next" type="password" required minLength={12} autoComplete="new-password" className={input} /></label>
        <label className={labelCls}>Repeat new password<input name="confirm" type="password" required minLength={12} autoComplete="new-password" className={input} /></label>
        <button type="submit" className={btnPrimary}>Save</button>
        <p className="m-0 text-[12px] text-muted">You will be signed out on all devices afterwards.</p>
      </form>
    </Page>
  );
}
