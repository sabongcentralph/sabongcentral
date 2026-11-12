import { checkAdminPassword, sameOrigin, sessionCookie, startAdminSession } from "@/lib/auth";
import { field } from "@/lib/forms";
import { logAction } from "@/lib/db";
import { startPending, twoFactorOf } from "@/lib/totp";


export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const email = field(f, "email", 200).toLowerCase();
  const to = (p: string, extra: Record<string, string> = {}) =>
    new Response(null, { status: 303, headers: { Location: new URL(p, req.url).toString(), ...extra } });
  const r = await checkAdminPassword(email, field(f, "password", 200));
  if (r === "locked") return to("/admin/login?error=locked");
  if (r === "bad") return to("/admin/login?error=1");
  // Two-step login on: ask for the authenticator code before starting a session.
  if ((await twoFactorOf(email))?.enabled) {
    const pending = await startPending(email);
    return to("/admin/login?step=code", { "Set-Cookie": `sc_admin_2fa=${encodeURIComponent(pending)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=300` });
  }
  await logAction(email, "login", "admin");
  return to("/admin", { "Set-Cookie": sessionCookie(await startAdminSession(email)) });
}
