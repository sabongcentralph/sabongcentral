import { sameOrigin } from "@/lib/auth";
import { back, field, isBot } from "@/lib/forms";
import { memberCookie, passwordLogin } from "@/lib/members";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  if (isBot(f)) return back(req, "/portal");
  const email = field(f, "email", 200).toLowerCase();
  const r = await passwordLogin(email, field(f, "password", 200));
  if (typeof r === "string") {
    const msg = r === "locked" ? "Too many wrong tries. Please wait 15 minutes and try again."
      : r === "blocked" ? "This account can’t sign in. Please contact us."
      : "Email or password is not right.";
    return back(req, `/portal?${new URLSearchParams({ email, error: msg })}`);
  }
  return new Response(null, { status: 303, headers: { Location: new URL("/portal", req.url).toString(), "Set-Cookie": memberCookie(r.token) } });
}
