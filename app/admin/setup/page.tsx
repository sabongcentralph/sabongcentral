import type { Metadata } from "next";
import { SUPER_ADMIN } from "@/lib/auth";
import { one, type Search } from "@/lib/content";
import { Note, Page, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin setup" };

export default async function AdminSetup({ searchParams }: { searchParams: Promise<Search> }) {
  const err = one((await searchParams).error);
  return (
    <Page>
      <form action="/api/admin/setup" method="post" className="mx-auto flex w-full max-w-[420px] flex-col gap-4 rounded-2xl border border-line bg-cream p-5">
        <h1 className="m-0 font-serif text-[26px] font-semibold">Admin setup</h1>
        <p className="m-0 text-[13px] text-muted">Set or reset the Super Admin password using the setup code saved in Cloudflare (ADMIN_SETUP_CODE).</p>
        {err === "off" && <Note tone="red">Setup is off: there is no ADMIN_SETUP_CODE secret (12+ characters) in Cloudflare yet.</Note>}
        {err === "bad" && <Note tone="red">Wrong setup code or email, or too many attempts. Wait 15 minutes.</Note>}
        {err === "weak" && <Note tone="red">Use 12+ characters, and make sure both passwords match.</Note>}
        <label className={labelCls}>Email<input name="email" type="email" required defaultValue={SUPER_ADMIN} className={input} /></label>
        <label className={labelCls}>Setup code<input name="code" type="password" required autoComplete="off" className={input} /></label>
        <label className={labelCls}>New password (12+ characters)<input name="next" type="password" required minLength={12} autoComplete="new-password" className={input} /></label>
        <label className={labelCls}>Repeat password<input name="confirm" type="password" required minLength={12} autoComplete="new-password" className={input} /></label>
        <button type="submit" className={btnPrimary}>Save password</button>
      </form>
    </Page>
  );
}
