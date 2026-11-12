import { adminFromRequest, checkAdminPassword, failedAttempt, sameOrigin, sessionCookie, startAdminSession } from "@/lib/auth";
import { field } from "@/lib/forms";
import { logAction } from "@/lib/db";
import { beginSetup, disable, enable, pendingEmail, pendingTry, verifySecond } from "@/lib/totp";

const PENDING = "sc_admin_2fa";
const clearPending = `${PENDING}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const action = field(f, "action", 20);
  const go = (p: string, cookies: string[] = []) => {
    const h = new Headers({ Location: new URL(p, req.url).toString() });
    for (const c of cookies) h.append("Set-Cookie", c);
    return new Response(null, { status: 303, headers: h });
  };

  // Second step of sign-in.
  if (action === "verify") {
    const m = (req.headers.get("cookie") ?? "").match(/(?:^|; )sc_admin_2fa=([^;]+)/);
    const p = await pendingEmail(m ? decodeURIComponent(m[1]) : null);
    if (!p || p.tries >= 5) return go("/admin/login?error=expired", [clearPending]);
    const ok = await verifySecond(p.email, field(f, "code", 20));
    await pendingTry(p.hash, ok);
    if (!ok) { await failedAttempt(p.email); return go("/admin/login?step=code&error=code"); }
    await logAction(p.email, "login (two-step)", "admin");
    return go("/admin", [clearPending, sessionCookie(await startAdminSession(p.email))]);
  }

  const admin = await adminFromRequest(req);
  if (!admin) return new Response("Forbidden", { status: 403 });
  if (action === "begin") {
    await beginSetup(admin);
    return go("/admin/account?setup=1#twostep");
  }
  if (action === "enable") {
    const codes = await enable(admin, field(f, "code", 10));
    if (!codes) return go("/admin/account?setup=1&error=code#twostep");
    await logAction(admin, "two-step login turned on", "admin");
    // Backup codes are shown once, through a short-lived cookie (never in a URL).
    return go("/admin/account?done=2fa#twostep", [`sc_backup=${encodeURIComponent(codes.join(" "))}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=300`]);
  }
  if (action === "disable") {
    const pw = await checkAdminPassword(admin, field(f, "password", 200));
    if (pw !== "ok" || !(await verifySecond(admin, field(f, "code", 20)))) return go("/admin/account?error=disable#twostep");
    await disable(admin);
    await logAction(admin, "two-step login turned off", "admin");
    return go("/admin/account?done=off#twostep");
  }
  return go("/admin/account");
}
