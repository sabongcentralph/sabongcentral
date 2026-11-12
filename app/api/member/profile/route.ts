import { sameOrigin } from "@/lib/auth";
import { back, field } from "@/lib/forms";
import { ROLES, memberFromRequest, saveProfile, type Role } from "@/lib/members";
import { isFacebook, toUrl } from "@/lib/links";

// Sign-up details (also used to edit them later).
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const m = await memberFromRequest(req);
  if (!m) return back(req, "/portal");
  const f = await req.formData();
  const fail = (msg: string) => back(req, `/portal?tab=account&error=${encodeURIComponent(msg)}`);
  const name = field(f, "name", 120), phone = field(f, "phone", 40);
  const roles = f.getAll("role").map(String).filter((r): r is Role => ROLES.some(([k]) => k === r));
  const facebook = toUrl(field(f, "facebook", 300)), org = field(f, "org_link", 300), orgUrl = toUrl(org);
  if (!name || name.length < 2) return fail("Please enter your name or business name.");
  if (!/^[+\d][\d\s-]{6,}$/.test(phone)) return fail("Please enter a valid mobile number.");
  if (!roles.length) return fail("Please pick at least one role.");
  if (!isFacebook(facebook)) return fail("Please add your Facebook page or profile link (facebook.com/…) so admins can verify you.");
  if (org && !orgUrl) return fail("The organization link doesn’t look like a web address.");
  if (m.status === "incomplete" && (field(f, "adult", 2) !== "1" || field(f, "terms", 2) !== "1")) return fail("Please confirm you are 18+ and agree to the Portal Rules.");
  await saveProfile(m.id, { name, phone, roles, facebook, org_link: orgUrl });
  return back(req, m.status === "incomplete" ? "/portal?welcome=1" : "/portal?tab=account&saved=1");
}
