import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAdmin, SUPER_ADMIN } from "@/lib/auth";
import { one, type Search } from "@/lib/content";
import { Note, Page, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin login" };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<Search> }) {
  if (await currentAdmin()) redirect("/admin");
  const sp = await searchParams;
  const err = one(sp.error);
  if (one(sp.step) === "code") {
    return (
      <Page>
        <form action="/api/admin/2fa" method="post" className="mx-auto flex w-full max-w-[400px] flex-col gap-4 rounded-2xl border border-line bg-cream p-5">
          <input type="hidden" name="action" value="verify" />
          <h1 className="m-0 font-serif text-[26px] font-semibold">Enter your code</h1>
          {err === "code" && <Note tone="red">That code is not right. Use the newest code in your authenticator app.</Note>}
          <p className="m-0 text-[14px] text-ink-soft">Open your authenticator app and type the 6-digit code for Sabong Sentral. Lost your phone? Type one of your backup codes instead.</p>
          <label className={labelCls}>Code<input name="code" required autoFocus autoComplete="one-time-code" inputMode="text" maxLength={12} className={`${input} text-center text-[22px] tracking-[0.3em]`} /></label>
          <button type="submit" className={btnPrimary}>Continue</button>
          <a href="/admin/login" className="text-center text-[13px] font-semibold text-wine">Start over</a>
        </form>
      </Page>
    );
  }
  return (
    <Page>
      <form action="/api/admin/login" method="post" className="mx-auto flex w-full max-w-[400px] flex-col gap-4 rounded-2xl border border-line bg-cream p-5">
        <h1 className="m-0 font-serif text-[26px] font-semibold">Admin login</h1>
        {err === "locked" && <Note tone="red">Too many failed attempts. Try again in 15 minutes.</Note>}
        {err === "1" && <Note tone="red">Incorrect email or password.</Note>}
        {err === "changed" && <Note tone="green">Password updated. Please log in again.</Note>}
        {err === "expired" && <Note tone="red">That sign-in took too long or had too many wrong codes. Please start again.</Note>}
        <label className={labelCls}>Email<input name="email" type="email" required autoComplete="username" defaultValue={SUPER_ADMIN} className={input} /></label>
        <label className={labelCls}>Password<input name="password" type="password" required autoComplete="current-password" className={input} /></label>
        <button type="submit" className={btnPrimary}>Login</button>
        <p className="m-0 text-[12px] text-muted">Admins only. Every login and action is logged. First time, or forgot your password? <a href="/admin/setup" className="font-semibold text-wine">Admin setup</a></p>
      </form>
    </Page>
  );
}
