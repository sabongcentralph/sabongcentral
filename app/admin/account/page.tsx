import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { cookies } from "next/headers";
import { one, type Search } from "@/lib/content";
import { backupLeft, qrSvg, twoFactorOf } from "@/lib/totp";
import { Note, Page, btnGhost, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin account" };

export default async function AdminAccount({ searchParams }: { searchParams: Promise<Search> }) {
  const email = await requireAdmin();
  const sp = await searchParams;
  const err = one(sp.error), done = one(sp.done);
  const tf = await twoFactorOf(email);
  const backup = done === "2fa" ? (await cookies()).get("sc_backup")?.value : undefined;
  return (
    <Page>
      <div className="flex w-full max-w-[440px] flex-wrap items-center gap-3 rounded-2xl border border-line bg-cream p-5">
        <div className="flex-1"><div className="text-[15px] font-bold">Signed in</div><div className="text-[13px] text-muted">{email} · Super Admin</div></div>
        <form action="/api/admin/logout" method="post"><button type="submit" className={btnGhost}>Sign out</button></form>
      </div>
      <section id="twostep" className="flex w-full max-w-[440px] flex-col gap-3 rounded-2xl border border-line bg-cream p-5">
        <h2 className="m-0 font-serif text-[22px] font-semibold">Two-step login</h2>
        {tf?.enabled ? (
          <>
            <Note tone="green"><strong>On.</strong> Signing in needs your password and a code from your authenticator app. {backupLeft(tf)} backup code{backupLeft(tf) === 1 ? "" : "s"} left.</Note>
            {backup && (
              <div className="flex flex-col gap-2 rounded-xl border-2 border-gold p-3">
                <strong className="text-[14px]">Your backup codes (shown once)</strong>
                <span className="text-[12.5px] text-muted">Write these down or screenshot them and keep them somewhere safe. Each one works once if you lose your phone.</span>
                <pre className="m-0 grid grid-cols-2 gap-1 font-mono text-[15px] select-all">{decodeURIComponent(backup).split(" ").map((c) => <span key={c}>{c}</span>)}</pre>
              </div>
            )}
            <details className="text-[13.5px]">
              <summary className="cursor-pointer font-semibold text-wine">Turn off two-step login</summary>
              <form action="/api/admin/2fa" method="post" className="mt-3 flex flex-col gap-3">
                <input type="hidden" name="action" value="disable" />
                {err === "disable" && <Note tone="red">Password or code is not right.</Note>}
                <label className={labelCls}>Password<input name="password" type="password" required autoComplete="current-password" className={input} /></label>
                <label className={labelCls}>Code from the app<input name="code" required autoComplete="one-time-code" className={input} /></label>
                <button type="submit" className={btnGhost}>Turn off</button>
              </form>
            </details>
          </>
        ) : tf && one(sp.setup) === "1" ? (
          <>
            <ol className="m-0 flex flex-col gap-1.5 pl-5 text-[14px] text-ink-soft">
              <li>Install <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong> on your phone (free).</li>
              <li>In the app, tap <strong>+</strong> and scan this QR code.</li>
              <li>Type the 6-digit code the app shows.</li>
            </ol>
            <div className="w-[220px] self-center rounded-xl bg-white p-2" dangerouslySetInnerHTML={{ __html: qrSvg(email, tf.secret) }} />
            <span className="break-all text-center text-[12px] text-muted">Can’t scan? Enter this key: <strong className="font-mono">{tf.secret.match(/.{1,4}/g)?.join(" ")}</strong></span>
            {err === "code" && <Note tone="red">That code is not right. Use the newest code in the app.</Note>}
            <form action="/api/admin/2fa" method="post" className="flex flex-col gap-3">
              <input type="hidden" name="action" value="enable" />
              <label className={labelCls}>6-digit code<input name="code" required inputMode="numeric" autoComplete="one-time-code" maxLength={7} className={`${input} text-center text-[20px] tracking-[0.3em]`} /></label>
              <button type="submit" className={btnPrimary}>Turn on two-step login</button>
            </form>
          </>
        ) : (
          <>
            {done === "off" ? <Note>Two-step login is off.</Note> : <Note tone="red"><strong>Off.</strong> Anyone with your password can get in. Turn this on before launch.</Note>}
            <form action="/api/admin/2fa" method="post"><input type="hidden" name="action" value="begin" /><button type="submit" className={btnPrimary}>Set up two-step login</button></form>
          </>
        )}
        <p className="m-0 text-[12px] text-muted">Lost your phone and backup codes? Use <a href="/admin/setup" className="font-semibold text-wine">Admin setup</a> with your setup code: it resets your password and turns two-step login off so you can set it up again.</p>
      </section>
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
