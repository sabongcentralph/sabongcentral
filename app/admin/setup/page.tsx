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
        <p className="m-0 text-[13px] text-muted">Para itakda o i-reset ang Super Admin password gamit ang setup code na naka-save sa Cloudflare (ADMIN_SETUP_CODE).</p>
        {err === "off" && <Note tone="red">Naka-off ang setup: wala pang ADMIN_SETUP_CODE secret (12+ characters) sa Cloudflare.</Note>}
        {err === "bad" && <Note tone="red">Mali ang setup code o email, o masyadong maraming subok. Maghintay ng 15 minuto.</Note>}
        {err === "weak" && <Note tone="red">Dapat 12+ characters at magkapareho ang dalawang password.</Note>}
        <label className={labelCls}>Email<input name="email" type="email" required defaultValue={SUPER_ADMIN} className={input} /></label>
        <label className={labelCls}>Setup code<input name="code" type="password" required autoComplete="off" className={input} /></label>
        <label className={labelCls}>Bagong password (12+ characters)<input name="next" type="password" required minLength={12} autoComplete="new-password" className={input} /></label>
        <label className={labelCls}>Ulitin ang password<input name="confirm" type="password" required minLength={12} autoComplete="new-password" className={input} /></label>
        <button type="submit" className={btnPrimary}>I-save ang password</button>
      </form>
    </Page>
  );
}
