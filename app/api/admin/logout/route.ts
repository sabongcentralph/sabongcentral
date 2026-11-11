import { clearCookie, logout } from "@/lib/auth";

export async function POST(req: Request) {
  await logout(req);
  return new Response(null, { status: 303, headers: { Location: new URL("/admin/login", req.url).toString(), "Set-Cookie": clearCookie } });
}
