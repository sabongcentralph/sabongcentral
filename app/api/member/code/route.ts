import { sameOrigin } from "@/lib/auth";
import { back, field, isBot } from "@/lib/forms";
import { newCode, testMode, validEmail } from "@/lib/members";

// Email-code sign-in: only once EMAIL_ENABLED is "true" (needs the domain and an email service).
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const email = field(f, "email", 200).toLowerCase();
  if (isBot(f)) return back(req, "/portal");
  // Until email sending is set up, accounts are created by an admin with a temporary password.
  if (await testMode()) return back(req, `/portal?error=${encodeURIComponent("Sign-in codes by email aren’t available yet. Please sign in with the password Sabong Central sent you.")}`);
  if (!validEmail(email)) return back(req, `/portal?error=${encodeURIComponent("Please enter a valid email address.")}`);
  const code = await newCode(email);
  if (code === "limit") return back(req, `/portal?error=${encodeURIComponent("Too many codes requested. Please wait an hour and try again.")}`);
  // TODO: send the code by email once EMAIL_ENABLED is set.
  void code;
  return back(req, `/portal?${new URLSearchParams({ step: "code", email })}`);
}
