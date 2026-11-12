import { field } from "@/lib/forms";

// Age check (21+, PAGCOR responsible gaming rules). "Yes" is remembered for a year on this device.
export async function POST(req: Request) {
  const f = await req.formData();
  let back = "/";
  try {
    const r = new URL(req.headers.get("referer") ?? "", req.url);
    if (r.origin === new URL(req.url).origin) back = r.pathname + r.search;
  } catch { /* keep "/" */ }
  const ok = field(f, "ok", 2) === "1";
  return new Response(null, {
    status: 303,
    headers: { Location: new URL(back, req.url).toString(), "Set-Cookie": `sc_21=${ok ? "1" : "no"}; Path=/; Secure; SameSite=Lax${ok ? "; Max-Age=31536000" : ""}` },
  });
}
