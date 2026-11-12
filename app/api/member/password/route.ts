import { sameOrigin, verifyPassword } from "@/lib/auth";
import { back, field } from "@/lib/forms";
import { db } from "@/lib/db";
import { PW_MIN, memberFromRequest, passwordState, setOwnPassword } from "@/lib/members";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const m = await memberFromRequest(req);
  if (!m) return back(req, "/portal");
  const f = await req.formData();
  const st = await passwordState(m.id);
  const page = st.mustChange ? "/portal" : "/portal?tab=account";
  const fail = (msg: string) => back(req, `${page}${page.includes("?") ? "&" : "?"}error=${encodeURIComponent(msg)}`);
  const next = field(f, "next", 200), again = field(f, "again", 200);
  if (st.has && !st.mustChange) {
    const row = await db().prepare(`select pw_hash from member_passwords where member_id = ?`).bind(m.id).first<{ pw_hash: string }>();
    if (!row || !(await verifyPassword(field(f, "current", 200), row.pw_hash))) return fail("Your current password is not right.");
  }
  if (next.length < PW_MIN) return fail(`Please use at least ${PW_MIN} characters.`);
  if (next !== again) return fail("The two new passwords don’t match.");
  if (!st.terms && (field(f, "adult", 2) !== "1" || field(f, "terms", 2) !== "1")) return fail("Please confirm you are 18+ and agree to the Portal Rules.");
  await setOwnPassword(m.id, next, true);
  return back(req, st.mustChange ? "/portal?welcome=1" : "/portal?tab=account&saved=pw");
}
