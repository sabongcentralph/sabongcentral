import { login, sameOrigin, sessionCookie } from "@/lib/auth";
import { field } from "@/lib/forms";
import { logAction } from "@/lib/db";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const email = field(f, "email", 200).toLowerCase();
  const token = await login(email, field(f, "password", 200));
  const to = (p: string, extra: Record<string, string> = {}) =>
    new Response(null, { status: 303, headers: { Location: new URL(p, req.url).toString(), ...extra } });
  if (token === "locked") return to("/admin/login?error=locked");
  if (!token) return to("/admin/login?error=1");
  await logAction(email, "login", "admin");
  return to("/admin", { "Set-Cookie": sessionCookie(token) });
}
