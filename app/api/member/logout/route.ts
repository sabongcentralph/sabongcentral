import { sameOrigin } from "@/lib/auth";
import { clearMemberCookie, signOut } from "@/lib/members";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  await signOut(req);
  return new Response(null, { status: 303, headers: { Location: new URL("/portal", req.url).toString(), "Set-Cookie": clearMemberCookie } });
}
