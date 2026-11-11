import { db, ensureDb } from "@/lib/db";
import { sameOrigin } from "@/lib/auth";
import { back, field, isBot } from "@/lib/forms";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  if (isBot(f)) return back(req, "/contact?sent=1");
  const name = field(f, "name", 120), email = field(f, "email", 200), topic = field(f, "topic", 80), body = field(f, "body", 4000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !body) return back(req, "/contact?error=1");
  await ensureDb();
  await db().prepare(`insert into messages (name, email, topic, body) values (?, ?, ?, ?)`).bind(name, email, topic || "General", body).run();
  return back(req, "/contact?sent=1");
}
