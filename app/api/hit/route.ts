import { isBotAgent, recordView } from "@/lib/stats";

// Page-view counter, called from the browser by <Track /> on every public page.
// Saves no cookies and no IP address (see lib/stats.ts).
export async function POST(req: Request) {
  const ok = new Response(null, { status: 204 });
  const origin = req.headers.get("origin");
  const self = new URL(req.url);
  if (origin && origin !== self.origin) return ok;
  const ua = req.headers.get("user-agent") ?? "";
  if (isBotAgent(ua)) return ok;
  // Skip the admin's own visits.
  if (/(?:^|;\s*)sc_admin=/.test(req.headers.get("cookie") ?? "")) return ok;
  let body: { p?: unknown; r?: unknown };
  try { body = JSON.parse((await req.text()).slice(0, 2000)); } catch { return ok; }
  const path = typeof body.p === "string" && body.p.startsWith("/") ? body.p : "";
  if (!path || /^\/(api|admin|portal|_next|media)(\/|$)/.test(path)) return ok;
  const cf = (req as Request & { cf?: { country?: string } }).cf;
  try {
    await recordView({
      path,
      referrer: typeof body.r === "string" ? body.r.slice(0, 300) : "",
      ip: req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "",
      ua: ua.slice(0, 300),
      country: cf?.country ?? req.headers.get("cf-ipcountry"),
      host: self.hostname,
    });
  } catch { /* stats must never break the site */ }
  return ok;
}
