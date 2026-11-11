import { db, ensureDb } from "@/lib/db";
import { sameOrigin } from "@/lib/auth";
import { back, field, isBot } from "@/lib/forms";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  if (isBot(f)) return back(req, "/report?sent=1");
  const target = field(f, "target", 200), reason = field(f, "reason", 80), details = field(f, "details", 2000), contact = field(f, "contact", 200);
  if (!target || !reason) return back(req, `/report?target=${encodeURIComponent(target)}&error=1`);
  await ensureDb();
  await db().prepare(`insert into reports (target, reason, details, contact) values (?, ?, ?, ?)`).bind(target, reason, details || null, contact || null).run();
  return back(req, "/report?sent=1");
}
