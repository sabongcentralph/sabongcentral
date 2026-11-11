import { adminFromRequest, changePassword, clearCookie, sameOrigin } from "@/lib/auth";
import { back, field } from "@/lib/forms";
import { logAction } from "@/lib/db";

export async function POST(req: Request) {
  const admin = await adminFromRequest(req);
  if (!admin || !sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const next = field(f, "next", 200);
  if (next.length < 12 || next !== field(f, "confirm", 200)) return back(req, "/admin/account?error=weak");
  if (!(await changePassword(admin, field(f, "current", 200), next))) return back(req, "/admin/account?error=current");
  await logAction(admin, "password changed", "admin");
  return new Response(null, { status: 303, headers: { Location: new URL("/admin/login?error=changed", req.url).toString(), "Set-Cookie": clearCookie } });
}
