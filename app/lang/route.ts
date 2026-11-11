import { LANG_COOKIE } from "@/lib/i18n";

// /lang?to=en or /lang?to=tl sets the language and returns to the page the
// visitor came from (same site only), or the home page.
export function GET(request: Request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("to") === "en" ? "en" : "tl";
  let back = "/";
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const r = new URL(referer);
      if (r.origin === url.origin && !r.pathname.startsWith("/lang")) back = r.pathname + r.search;
    } catch {
      // ignore a malformed referer
    }
  }
  return new Response(null, {
    status: 303,
    headers: {
      Location: back,
      "Set-Cookie": `${LANG_COOKIE}=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`,
    },
  });
}
