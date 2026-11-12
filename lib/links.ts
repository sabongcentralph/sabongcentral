export function telHref(phone: string) {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}
export function smsHref(phone: string) {
  return "sms:" + phone.replace(/[^\d+]/g, "");
}

// Only Facebook / Messenger links are allowed for "Message" buttons.
export function messengerHref(fb: string): string | null {
  try {
    const u = new URL(fb.startsWith("http") ? fb : `https://${fb}`);
    if (!/(^|\.)(facebook\.com|fb\.com|m\.me|messenger\.com)$/.test(u.hostname)) return null;
    if (/(^|\.)(m\.me|messenger\.com)$/.test(u.hostname)) return u.toString();
    const parts = u.pathname.split("/").filter(Boolean);
    // facebook.com/profile.php?id=123 (new-style pages and profiles) → m.me/123
    if (parts[0] === "profile.php") { const id = u.searchParams.get("id"); return id && /^\d+$/.test(id) ? `https://m.me/${id}` : null; }
    // facebook.com/people/Name/123 and facebook.com/pages/Name/123 → m.me/123
    if ((parts[0] === "people" || parts[0] === "pages") && /^\d+$/.test(parts[2] ?? "")) return `https://m.me/${parts[2]}`;
    // Share links can't be turned into a Messenger link: open the page itself.
    if (parts[0] === "share" || parts[0] === "groups") return null;
    const page = parts[0];
    return page && /^[\w.-]+$/.test(page) ? `https://m.me/${encodeURIComponent(page)}` : null;
  } catch {
    return null;
  }
}
export function toUrl(v: string): string {
  const t = v.trim();
  if (!t) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    return u.hostname.includes(".") ? u.toString() : "";
  } catch { return ""; }
}
export const isFacebook = (u: string) => { try { return /(^|\.)(facebook\.com|fb\.com|fb\.me)$/i.test(new URL(u).hostname); } catch { return false; } };


// A link the farm gave for Messenger: m.me/…, messenger.com/…, or a Facebook page (turned into m.me).
export const isMessenger = (v: string) => !!messengerHref(v);
