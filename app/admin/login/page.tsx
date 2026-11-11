import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAdmin, SUPER_ADMIN } from "@/lib/auth";
import { one, type Search } from "@/lib/content";
import { Note, Page, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin login" };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<Search> }) {
  if (await currentAdmin()) redirect("/admin");
  const err = one((await searchParams).error);
  return (
    <Page>
      <form action="/api/admin/login" method="post" className="mx-auto flex w-full max-w-[400px] flex-col gap-4 rounded-2xl border border-line bg-cream p-5">
        <h1 className="m-0 font-serif text-[26px] font-semibold">Admin login</h1>
        {err === "locked" && <Note tone="red">Masyadong maraming maling subok. Subukan ulit pagkalipas ng 15 minuto.</Note>}
        {err === "1" && <Note tone="red">Mali ang email o password.</Note>}
        {err === "changed" && <Note tone="green">Napalitan na ang password. Mag-login ulit.</Note>}
        <label className={labelCls}>Email<input name="email" type="email" required autoComplete="username" defaultValue={SUPER_ADMIN} className={input} /></label>
        <label className={labelCls}>Password<input name="password" type="password" required autoComplete="current-password" className={input} /></label>
        <button type="submit" className={btnPrimary}>Login</button>
        <p className="m-0 text-[12px] text-muted">Para sa admins lang. Naka-log ang bawat login at action. 2FA (authenticator app) ay idadagdag bago ang launch. Unang beses o nakalimutan ang password? <a href="/admin/setup" className="font-semibold text-wine">Admin setup</a></p>
      </form>
    </Page>
  );
}
