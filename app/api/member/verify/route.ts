import { sameOrigin } from "@/lib/auth";
import { back, field } from "@/lib/forms";
import { memberCookie, verifyCode } from "@/lib/members";

// Step 2 of sign-in: check the code and start a session.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const email = field(f, "email", 200).toLowerCase(), code = field(f, "code", 10).replace(/\D/g, "");
  const r = await verifyCode(email, code);
  if (r === "bad" || r === "expired") {
    const msg = r === "bad" ? "That code is not right. Please check and try again." : "That code has expired or was tried too many times. Please request a new code.";
    return back(req, `/portal?${new URLSearchParams(r === "bad" ? { step: "code", email, error: msg } : { error: msg })}`);
  }
  return new Response(null, { status: 303, headers: { Location: new URL("/portal", req.url).toString(), "Set-Cookie": memberCookie(r.token) } });
}
