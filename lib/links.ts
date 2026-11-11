export function telHref(phone: string) {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

// Only Facebook / Messenger links are allowed for "Message" buttons.
export function messengerHref(fb: string): string | null {
  try {
    const u = new URL(fb.startsWith("http") ? fb : `https://${fb}`);
    if (!/(^|\.)(facebook\.com|fb\.com|m\.me)$/.test(u.hostname)) return null;
    if (u.hostname.endsWith("m.me")) return u.toString();
    const page = u.pathname.split("/").filter(Boolean)[0];
    return page ? `https://m.me/${encodeURIComponent(page)}` : null;
  } catch {
    return null;
  }
}
