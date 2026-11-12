import { adminFromRequest, sameOrigin } from "@/lib/auth";
import { back, field } from "@/lib/forms";
import { ROLES, createMember, resetPassword, setMemberStatus, validEmail, type MemberStatus, type Role } from "@/lib/members";
import { isFacebook, toUrl } from "@/lib/links";

// The temporary password is shown once to the admin through a short-lived cookie, never in a URL.
const flash = (temp: string) => `sc_temp=${encodeURIComponent(temp)}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=300`;
const go = (req: Request, path: string, temp?: string) => new Response(null, { status: 303, headers: { Location: new URL(path, req.url).toString(), ...(temp ? { "Set-Cookie": flash(temp) } : {}) } });

const ACTIONS: Record<string, MemberStatus> = { approve: "active", restrict: "restricted", suspend: "suspended", close: "closed", reactivate: "active", pending: "pending" };

export async function POST(req: Request) {
  const admin = await adminFromRequest(req);
  if (!admin || !sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const id = Number(field(f, "id", 12)), action = field(f, "action", 20), reason = field(f, "reason", 500);
  if (action === "create") {
    const fail = (msg: string) => back(req, `/admin/members/new?error=${encodeURIComponent(msg)}`);
    const email = field(f, "email", 200).toLowerCase(), name = field(f, "name", 120), phone = field(f, "phone", 40);
    const roles = f.getAll("role").map(String).filter((r): r is Role => ROLES.some(([k]) => k === r));
    const facebook = toUrl(field(f, "facebook", 300)), org = field(f, "org_link", 300), orgUrl = toUrl(org);
    if (!validEmail(email)) return fail("Please enter a valid email.");
    if (name.length < 2) return fail("Please enter their name or business name.");
    if (!/^[+\d][\d\s-]{6,}$/.test(phone)) return fail("Please enter a valid mobile number.");
    if (!roles.length) return fail("Please pick at least one role.");
    if (!isFacebook(facebook)) return fail("Please add their Facebook page or profile link (facebook.com/…).");
    if (org && !orgUrl) return fail("The organization link doesn’t look like a web address.");
    const r = await createMember({ email, name, phone, roles, facebook, org_link: orgUrl }, admin);
    if (r === "exists") return fail("An account with that email already exists.");
    return go(req, `/admin/members/${r.id}?done=created`, r.temp);
  }
  if (action === "reset_password") {
    const temp = await resetPassword(id, admin);
    return go(req, `/admin/members/${id}?done=reset`, temp ?? undefined);
  }
  const to = ACTIONS[action];
  if (!id || !to) return back(req, "/admin/members");
  if ((to === "restricted" || to === "suspended" || to === "closed") && !reason) return back(req, `/admin/members/${id}?error=reason`);
  await setMemberStatus(id, to, admin, reason);
  return back(req, `/admin/members/${id}?done=${action}`);
}
