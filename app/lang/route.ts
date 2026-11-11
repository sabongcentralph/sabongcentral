import { LANG_COOKIE } from "@/lib/i18n";

// /lang?to=en or /lang?to=tl sets the language and returns to the home page.
export function GET(request: Request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("to") === "en" ? "en" : "tl";
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/",
      "Set-Cookie": `${LANG_COOKIE}=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`,
    },
  });
}
