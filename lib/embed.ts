// Turns a Facebook, YouTube or TikTok link into a safe embed address.
// Only these three platforms are accepted; anything else returns null.
export type Embed = { platform: "YouTube" | "TikTok" | "Facebook"; src: string; vertical: boolean };

export function toEmbed(raw: string | undefined): Embed | null {
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw.trim().startsWith("http") ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.replace(/^(www|m|mobile|web)\./, "");
  const id = (s: string | undefined | null) => (s && /^[\w-]{6,40}$/.test(s) ? s : null);

  if (host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") {
    const parts = u.pathname.split("/").filter(Boolean);
    const v = host === "youtu.be" ? parts[0] : parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live" ? parts[1] : u.searchParams.get("v");
    const ok = id(v);
    return ok ? { platform: "YouTube", src: `https://www.youtube-nocookie.com/embed/${ok}`, vertical: parts[0] === "shorts" } : null;
  }
  if (host === "tiktok.com") {
    const m = u.pathname.match(/\/video\/(\d{8,25})/);
    return m ? { platform: "TikTok", src: `https://www.tiktok.com/player/v1/${m[1]}?rel=0`, vertical: true } : null;
  }
  if (host === "facebook.com" || host === "fb.watch") {
    const clean = `https://www.facebook.com${host === "fb.watch" ? "" : u.pathname}${u.searchParams.get("v") ? `?v=${u.searchParams.get("v")}` : ""}`;
    const href = host === "fb.watch" ? u.toString() : clean;
    const vertical = /\/reel\//.test(u.pathname);
    return { platform: "Facebook", src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false`, vertical };
  }
  return null;
}
