import { sameOrigin, setupWithCode } from "@/lib/auth";
import { back, field } from "@/lib/forms";
import { logAction } from "@/lib/db";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const next = field(f, "next", 200);
  if (next.length < 12 || next !== field(f, "confirm", 200)) return back(req, "/admin/setup?error=weak");
  const r = await setupWithCode(field(f, "code", 200), field(f, "email", 200), next);
  if (r !== "ok") return back(req, `/admin/setup?error=${r}`);
  await logAction(field(f, "email", 200).toLowerCase(), "password set with setup code", "admin");
  return back(req, "/admin/login?error=changed");
}
