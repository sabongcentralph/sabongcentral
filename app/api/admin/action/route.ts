import { adminFromRequest, sameOrigin } from "@/lib/auth";
import { addNote, review, setState, setVerified } from "@/lib/db";
import { back, field } from "@/lib/forms";

export async function POST(req: Request) {
  const admin = await adminFromRequest(req);
  if (!admin || !sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const id = Number(field(f, "id", 12));
  const action = field(f, "action", 30);
  const reason = field(f, "reason", 500);
  if (!id) return back(req, "/admin");
  const needsReason = action === "reject" || action === "request_changes";
  if (needsReason && !reason) return back(req, `/admin/item/${id}?error=reason`);

  if (action === "approve" || action === "restore") await review(id, "Approved", admin, reason);
  else if (action === "approve_verified") { await setVerified(id, true, admin); await review(id, "Approved", admin, reason); }
  else if (action === "verify") await setVerified(id, true, admin);
  else if (action === "unverify") await setVerified(id, false, admin);
  else if (action === "in_review") await review(id, "In Review", admin, reason);
  else if (action === "request_changes") await review(id, "Needs Changes", admin, reason);
  else if (action === "reject") await review(id, "Rejected", admin, reason);
  else if (action === "hide") await review(id, "Hidden", admin, reason);
  else if (action === "archive") await review(id, "Archived", admin, reason);
  else if (action === "pending") await review(id, "New", admin, reason);
  else if (action === "set_state") await setState(id, field(f, "state", 20), admin);
  else if (action === "note") {
    const body = field(f, "note", 2000);
    if (body) await addNote(id, admin, body);
  }
  const next = field(f, "next", 200);
  return back(req, next.startsWith("/admin") ? next : `/admin/item/${id}?done=${action}`);
}
