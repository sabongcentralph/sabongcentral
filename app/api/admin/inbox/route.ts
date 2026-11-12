import { adminFromRequest, sameOrigin } from "@/lib/auth";
import { REPORT_STATUSES, db, setReport, type ReportStatus } from "@/lib/db";
import { back, field } from "@/lib/forms";

// Close a report or mark a contact message as read.
export async function POST(req: Request) {
  const admin = await adminFromRequest(req);
  if (!admin || !sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const id = Number(field(f, "id", 12));
  const what = field(f, "what", 10);
  if (what === "report") {
    const s = field(f, "status", 20);
    const status = REPORT_STATUSES.some(([k]) => k === s) ? (s as ReportStatus) : null;
    const note = field(f, "note", 500);
    const cur = await db().prepare(`select status from reports where id = ?`).bind(id).first<{ status: string }>();
    const closing = status && status !== cur?.status && ["resolved", "no_action", "escalated"].includes(status);
    if (closing && !note) return back(req, `/admin/reports?error=note#r${id}`);
    await setReport(id, status, admin, note);
    return back(req, `/admin/reports?done=1#r${id}`);
  }
  await db().prepare(`update messages set status = 'read' where id = ?`).bind(id).run();
  return back(req, "/admin/messages");
}
