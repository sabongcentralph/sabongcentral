import { adminEdit, byId, memberEdit, review, submit, type Kind } from "@/lib/db";
import { adminFromRequest, sameOrigin } from "@/lib/auth";
import { back, field, isBot } from "@/lib/forms";
import { toEmbed } from "@/lib/embed";
import { isFacebook, toUrl } from "@/lib/links";
import { canSubmit, linkListing, memberFromRequest, ownsListing } from "@/lib/members";
import { badPhoto, photoFiles, savePhotos } from "@/lib/media";
import { hasValidDoc } from "@/lib/docs";
import { ARTICLE_TOPICS, EVENT_CATS, GOODS_CATS, REEL_TOPICS } from "@/lib/sample";
import { AVAILABILITY } from "@/lib/db";
import { AREAS } from "@/lib/locations";

const validPlace = (p: string, c: string) => !!AREAS.find((a) => a.p === p)?.c.includes(c);
const pesos = (v: string) => (v ? (/^\d[\d,]*(\.\d+)?$/.test(v) ? `₱${v}` : v) : "₱ quote");

function longDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
function time12(t: string) {
  if (!/^\d\d:\d\d$/.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const kind = field(f, "kind", 20) as Kind;
  // Articles, reels and announcements come from the public form; farms, events
  // and Market items only through the Portal.
  // Admin "+ Add listing" (Em, 2026-11-12): admins post farms, derbies, items and reels
  // themselves while the site fills up; their listings go live at once.
  const asAdmin = field(f, "admin", 2) === "1";
  const admin = asAdmin ? await adminFromRequest(req) : null;
  if (asAdmin && !admin) return new Response("Forbidden", { status: 403 });
  const isPublic = !admin && (kind === "article" || kind === "reel" || kind === "notice");
  const page = admin ? "/admin/add" : isPublic ? "/submit" : "/portal";
  if (isBot(f)) return back(req, `${page}?tab=${kind}&sent=1`);
  // A member editing one of their own listings.
  const editId = Number(field(f, "edit", 12)) || 0;
  const fail = (msg: string) => back(req, `${page}?tab=${editId ? `edit&id=${editId}` : kind}&error=${encodeURIComponent(msg)}`);
  const name = field(f, "contactName", 120), email = field(f, "email", 200);
  // Farms, events and Market items need a signed-in Portal member.
  const member = isPublic || admin ? null : await memberFromRequest(req);
  if (admin) {
    if (!["farm", "event", "good", "reel"].includes(kind)) return fail("Admins add farms, events, Market items and reels here.");
  } else if (isPublic) {
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter your name and a valid email.");
    if (field(f, "confirm", 2) !== "1") return fail("Please tick the confirmation box.");
  } else if (!member) {
    return back(req, "/portal");
  } else if (!canSubmit(member)) {
    return fail("Your account can’t submit listings right now. Please contact us.");
  } else if (field(f, "confirm", 2) !== "1") {
    return fail("Please confirm that the information is accurate.");
  }
  // Verification links (Em, 2026-11-12): a Facebook page is required from every
  // submitter; farms give their farm page. Admin-only, except the farm page.
  const vfb = member && kind !== "farm" ? member.facebook : admin ? toUrl(field(f, "vfb", 300)) || toUrl(field(f, "facebook", 300)) : toUrl(field(f, kind === "farm" ? "facebook" : "vfb", 300));
  const vlink = member && !field(f, "vlink", 300) ? member.org_link : toUrl(field(f, "vlink", 300));
  if (!admin && !isFacebook(vfb)) return fail("Please add a Facebook page or profile link (facebook.com/…) so admins can verify you.");
  if (field(f, "vlink", 300) && !vlink) return fail("The organization link doesn’t look like a web address.");
  const old = editId ? await byId(editId) : null;
  if (editId && !admin && (!member || !old || old.kind !== kind || !(await ownsListing(member.id, editId)))) return fail("You can only edit your own listings.");
  if (editId && admin && (!old || old.kind !== kind)) return fail("Listing not found.");
  const by = admin ? "Sabong Central (added by admin)" : isPublic ? `${name} <${email}> (public form)` : `${member!.name || member!.email} <${member!.email}> (member #${member!.id})`;
  const province = field(f, "province", 80), city = field(f, "city", 80);
  let data: object;

  if (kind === "farm") {
    const name = field(f, "name", 120);
    if (!name || !validPlace(province, city) || (!admin && !field(f, "phone", 40))) return fail("Farm name, location and contact number are required.");
    data = {
      name, province, city, est: field(f, "est", 4), ownerName: field(f, "ownerName", 120), phone: field(f, "phone", 40),
      facebook: field(f, "facebook", 200), about: field(f, "about", 2000), verified: false,
      bloodlines: f.getAll("line").map(String).slice(0, 12).map((n) => ({ name: n.slice(0, 40) })),
      docs: field(f, "docs", 10) === "yes", visit: field(f, "visit", 300), address: field(f, "address", 300),
    };
  } else if (kind === "event") {
    const title = field(f, "title", 160), sub = field(f, "sub", 60), date = field(f, "date", 10), online = field(f, "online", 5) === "1";
    const cat = EVENT_CATS.find((c) => c[3].includes(sub));
    if (!title || !cat || !/^\d{4}-\d\d-\d\d$/.test(date) || (!online && !validPlace(province, city))) return fail("Title, event type, date and location are required.");
    const end = field(f, "endDate", 10);
    const [, , d1] = date.split("-");
    const mon = new Date(date + "T00:00:00Z").toLocaleString("en", { month: "short", timeZone: "UTC" });
    data = {
      title, cat: cat[0], sub, group: cat[2], derby: cat[2] === "Derbies & Events", date,
      days: end && end > date ? `${mon} ${Number(d1)}–${Number(end.slice(8))}` : `${mon} ${Number(d1)}`,
      longDate: end && end > date ? `${longDate(date)} – ${longDate(end)}` : longDate(date),
      time: [time12(field(f, "start", 5)), time12(field(f, "end", 5))].filter(Boolean).join(" – "),
      province: online ? "Online" : province, city: online ? "Online" : city, online, venue: field(f, "venue", 200) || (online ? "Online" : ""),
      desc: field(f, "desc", 2000), topics: field(f, "topics", 300), speakers: field(f, "speakers", 300),
      fee: field(f, "fee", 80) || "Free", reg: field(f, "reg", 200), permits: field(f, "permits", 300), org: field(f, "org", 120) || member?.name || name || "Organizer",
      link: online ? field(f, "link", 300) : "", status: "Upcoming",
      endDate: end && end > date ? end : "", startTime: field(f, "start", 5), endTime: field(f, "end", 5),
    };
  } else if (kind === "good") {
    const name = field(f, "name", 120), sub = field(f, "sub", 60);
    const cat = Object.entries(GOODS_CATS).find(([, subs]) => subs.includes(sub))?.[0];
    if (!name || !cat || !validPlace(province, city) || !field(f, "seller", 120) || (!admin && !field(f, "phone", 40))) return fail("Product name, subcategory, seller name, contact number and location are required.");
    data = {
      name, cat, sub, price: pesos(field(f, "price", 20)), seller: field(f, "seller", 120), phone: field(f, "phone", 40),
      province, city, sold: false, sellerVerified: false, desc: field(f, "desc", 2000),
      avail: (AVAILABILITY as readonly string[]).includes(field(f, "avail", 20)) ? field(f, "avail", 20) : "Available",
      condition: field(f, "condition", 40), pickup: field(f, "pickup", 300),
    };
  } else if (kind === "reel") {
    const title = field(f, "title", 160), url = field(f, "url", 500);
    const embed = toEmbed(url);
    if (!title || !embed) return fail("A title and a Facebook, YouTube or TikTok link are required.");
    const topic = field(f, "topic", 60);
    data = { title, topic: REEL_TOPICS.includes(topic) ? topic : "Farm Management", farm: field(f, "farm", 120) || name, platform: embed.platform, url, desc: field(f, "desc", 600) };
  } else if (kind === "article") {
    const title = field(f, "title", 160), topic = field(f, "topic", 60), body = field(f, "body", 20000);
    if (!title || !ARTICLE_TOPICS.includes(topic) || body.length < 40) return fail("A title, topic and article text are required.");
    const paras = body.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 80);
    const words = body.split(/\s+/).length;
    data = {
      title, topic, body: paras, summary: field(f, "summary", 300), org: field(f, "org", 120), by: name,
      refs: field(f, "refs", 2000).split("\n").map((r) => r.trim()).filter(Boolean).slice(0, 15),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" }),
      read: `${Math.max(1, Math.round(words / 200))} min read`,
    };
  } else if (kind === "notice") {
    const title = field(f, "title", 160), text = field(f, "text", 1500), farm = field(f, "farm", 120);
    if (!title || !text) return fail("Title and details are required.");
    data = { kind: "Farm Announcements", title: farm ? `${farm}: ${title}` : title, meta: "Approved · " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), text, source: "" };
  } else {
    return fail("Unknown listing type.");
  }

  // Photos (only Portal listings): checked before saving anything.
  const groups = kind === "farm" ? { profile: photoFiles(f, "profile", 1), cover: photoFiles(f, "cover", 1), gallery: photoFiles(f, "gallery", 6) }
    : kind === "event" ? { poster: photoFiles(f, "poster", 1) } : kind === "good" ? { photos: photoFiles(f, "photos", 3) } : {};
  const bad = badPhoto(Object.values(groups).flat());
  if (bad) return fail(bad);
  const pics: Record<string, string | string[]> = {};
  for (const [k, files] of Object.entries(groups)) {
    const paths = await savePhotos(files);
    if (paths.length) pics[k] = k === "gallery" || k === "photos" ? paths : paths[0];
  }
  if (old) {
    // Keep photos that weren't replaced, and fields only admins or quick actions change.
    const o = old.data as unknown as Record<string, unknown>;
    const kept = Object.fromEntries(["profile", "cover", "gallery", "poster", "photos", "verified", "sellerVerified", "status", "renewed", "listedBy"].filter((k) => k in o && !(k in pics)).map((k) => [k, o[k]]));
    if (admin) {
      await adminEdit(old, { ...data, ...kept, ...pics, verifyFacebook: vfb, verifyLink: vlink }, admin);
      return back(req, `/admin/item/${old.id}?done=edited`);
    }
    const out = await memberEdit(old, { ...data, ...kept, ...pics, verifyFacebook: vfb, verifyLink: vlink }, by);
    return back(req, `/portal?edited=${out}`);
  }
  data = { ...data, ...pics, verifyFacebook: vfb, verifyLink: vlink };
  // An approved, unexpired business document means new farms and Market items start Business Verified.
  if (member && (kind === "farm" || kind === "good") && (await hasValidDoc(member.id))) data = { ...data, [kind === "farm" ? "verified" : "sellerVerified"]: true };
  if (admin) data = { ...data, listedBy: "admin" };
  const id = await submit(kind, data, by);
  if (admin && id) {
    await review(id, "Approved", admin, "Added by Sabong Central");
    return back(req, `/admin/item/${id}?done=published`);
  }
  if (member && id) await linkListing(id, member.id);
  return back(req, `${page}?tab=${kind}&sent=1`);
}
