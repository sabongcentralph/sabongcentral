import { sameOrigin } from "@/lib/auth";
import { byId, ownerAction } from "@/lib/db";
import { back, field } from "@/lib/forms";
import { memberFromRequest, ownsListing } from "@/lib/members";

// Quick changes a member makes to their own listing: status, renew, unpublish.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const member = await memberFromRequest(req);
  if (!member) return back(req, "/portal");
  const f = await req.formData();
  const id = Number(field(f, "id", 12));
  const l = id ? await byId(id) : null;
  if (!l || !(await ownsListing(member.id, id))) return back(req, `/portal?error=${encodeURIComponent("Listing not found.")}`);
  if (member.status === "suspended" || member.status === "closed") return back(req, `/portal?error=${encodeURIComponent("Your account can’t make changes right now.")}`);
  const action = field(f, "action", 20);
  const err = await ownerAction(l, action, field(f, "state", 20), `${member.name || member.email} <${member.email}> (member #${member.id})`);
  return back(req, err ? `/portal?error=${encodeURIComponent(err)}` : `/portal?done=${action}#l${id}`);
}
