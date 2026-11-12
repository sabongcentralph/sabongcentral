import { adminFromRequest, sameOrigin } from "@/lib/auth";
import { back, field } from "@/lib/forms";
import { setMemberStatus, type MemberStatus } from "@/lib/members";

const ACTIONS: Record<string, MemberStatus> = { approve: "active", restrict: "restricted", suspend: "suspended", close: "closed", reactivate: "active", pending: "pending" };

export async function POST(req: Request) {
  const admin = await adminFromRequest(req);
  if (!admin || !sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const id = Number(field(f, "id", 12)), action = field(f, "action", 20), reason = field(f, "reason", 500);
  const to = ACTIONS[action];
  if (!id || !to) return back(req, "/admin/members");
  if ((to === "restricted" || to === "suspended" || to === "closed") && !reason) return back(req, `/admin/members/${id}?error=reason`);
  await setMemberStatus(id, to, admin, reason);
  return back(req, `/admin/members/${id}?done=${action}`);
}
