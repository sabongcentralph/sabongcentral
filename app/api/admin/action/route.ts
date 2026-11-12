import { adminFromRequest, sameOrigin } from "@/lib/auth";
import { setState, setStatus, setVerified } from "@/lib/db";
import { back, field } from "@/lib/forms";

export async function POST(req: Request) {
  const admin = await adminFromRequest(req);
  if (!admin || !sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const id = Number(field(f, "id", 12));
  const action = field(f, "action", 30);
  const reason = field(f, "reason", 500);
  if (!id) return back(req, "/admin");
  if (action === "approve") await setStatus(id, "approved", admin, reason);
  else if (action === "approve_verified") { await setVerified(id, true, admin); await setStatus(id, "approved", admin, reason); }
  else if (action === "verify") await setVerified(id, true, admin);
  else if (action === "unverify") await setVerified(id, false, admin);
  else if (action === "reject") {
    if (!reason) return back(req, `/admin/item/${id}?error=reason`);
    await setStatus(id, "rejected", admin, reason);
  } else if (action === "hide") await setStatus(id, "hidden", admin, reason);
  else if (action === "restore") await setStatus(id, "approved", admin, reason);
  else if (action === "set_state") await setState(id, field(f, "state", 20), admin);
  else if (action === "pending") await setStatus(id, "pending", admin, reason);
  const next = field(f, "next", 200);
  return back(req, next.startsWith("/admin") ? next : `/admin/item/${id}?done=${action}`);
}
