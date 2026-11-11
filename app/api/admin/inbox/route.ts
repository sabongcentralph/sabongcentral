import { adminFromRequest, sameOrigin } from "@/lib/auth";
import { db, logAction } from "@/lib/db";
import { back, field } from "@/lib/forms";

// Close a report or mark a contact message as read.
export async function POST(req: Request) {
  const admin = await adminFromRequest(req);
  if (!admin || !sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const id = Number(field(f, "id", 12));
  const what = field(f, "what", 10);
  if (what === "report") {
    const status = field(f, "status", 20) === "open" ? "open" : "resolved";
    await db().prepare(`update reports set status = ? where id = ?`).bind(status, id).run();
    await logAction(admin, `report ${status}`, `report #${id}`, field(f, "note", 300));
    return back(req, "/admin/reports");
  }
  await db().prepare(`update messages set status = 'read' where id = ?`).bind(id).run();
  return back(req, "/admin/messages");
}
