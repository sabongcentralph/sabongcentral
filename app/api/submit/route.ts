import { submit, type Kind } from "@/lib/db";
import { sameOrigin } from "@/lib/auth";
import { back, field, isBot } from "@/lib/forms";
import { toEmbed } from "@/lib/embed";
import { EVENT_CATS, GOODS_CATS } from "@/lib/sample";
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
  if (isBot(f)) return back(req, `/portal?tab=${kind}&sent=1`);
  const fail = (msg: string) => back(req, `/portal?tab=${kind}&error=${encodeURIComponent(msg)}`);
  const by = field(f, "contactName", 120) || "Portal (test)";
  const province = field(f, "province", 80), city = field(f, "city", 80);
  let data: object;

  if (kind === "farm") {
    const name = field(f, "name", 120);
    if (!name || !validPlace(province, city) || !field(f, "phone", 40)) return fail("Kailangan ang farm name, location at contact number.");
    data = {
      name, province, city, est: field(f, "est", 4), ownerName: field(f, "ownerName", 120), phone: field(f, "phone", 40),
      facebook: field(f, "facebook", 200), about: field(f, "about", 2000), verified: false,
      bloodlines: f.getAll("line").map(String).slice(0, 12).map((n) => ({ name: n.slice(0, 40) })),
      docs: field(f, "docs", 10) === "yes",
    };
  } else if (kind === "event") {
    const title = field(f, "title", 160), sub = field(f, "sub", 60), date = field(f, "date", 10), online = field(f, "online", 5) === "1";
    const cat = EVENT_CATS.find((c) => c[3].includes(sub));
    if (!title || !cat || !/^\d{4}-\d\d-\d\d$/.test(date) || (!online && !validPlace(province, city))) return fail("Kailangan ang title, type, petsa at location.");
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
      fee: field(f, "fee", 80) || "Free", reg: field(f, "reg", 200), permits: field(f, "permits", 300), org: field(f, "org", 120) || by,
    };
  } else if (kind === "good") {
    const name = field(f, "name", 120), sub = field(f, "sub", 60);
    const cat = Object.entries(GOODS_CATS).find(([, subs]) => subs.includes(sub))?.[0];
    if (!name || !cat || !validPlace(province, city) || !field(f, "seller", 120) || !field(f, "phone", 40)) return fail("Kailangan ang product name, subcategory, seller name, contact number at location.");
    data = {
      name, cat, sub, price: pesos(field(f, "price", 20)), seller: field(f, "seller", 120), phone: field(f, "phone", 40),
      province, city, sold: false, sellerVerified: false, desc: field(f, "desc", 2000),
    };
  } else if (kind === "reel") {
    const title = field(f, "title", 160), url = field(f, "url", 500);
    const embed = toEmbed(url);
    if (!title || !embed) return fail("Kailangan ang title at link mula sa Facebook, YouTube o TikTok.");
    data = { title, topic: field(f, "topic", 60) || "Farm Management", farm: field(f, "farm", 120) || by, platform: embed.platform, url };
  } else if (kind === "notice") {
    const title = field(f, "title", 160), text = field(f, "text", 1500), farm = field(f, "farm", 120);
    if (!title || !text) return fail("Kailangan ang title at detalye.");
    data = { kind: "Farm Announcements", title: farm ? `${farm}: ${title}` : title, meta: "Approved · " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), text, source: "" };
  } else {
    return fail("Hindi kilalang uri ng listing.");
  }

  await submit(kind, data, by);
  return back(req, `/portal?tab=${kind}&sent=1`);
}
