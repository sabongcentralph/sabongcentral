import { sameOrigin } from "@/lib/auth";
import { back, field, isBot } from "@/lib/forms";
import { newCode, testMode, validEmail } from "@/lib/members";

// Step 1 of sign-in: send a 6-digit code to the email.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const email = field(f, "email", 200).toLowerCase();
  if (isBot(f)) return back(req, "/portal");
  if (!validEmail(email)) return back(req, `/portal?error=${encodeURIComponent("Please enter a valid email address.")}`);
  const code = await newCode(email);
  if (code === "limit") return back(req, `/portal?error=${encodeURIComponent("Too many codes requested. Please wait an hour and try again.")}`);
  const q = new URLSearchParams({ step: "code", email });
  // Test site only: no email service yet, so the code is shown on screen.
  if (await testMode()) q.set("test", code);
  return back(req, `/portal?${q}`);
}
