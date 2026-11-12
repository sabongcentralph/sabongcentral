import type { Metadata } from "next";
import { approved } from "@/lib/db";
import { matches, one, publicEvents, type Search } from "@/lib/content";
import { ArticleCard, EventCard, FarmCard, GoodCard, NoticeCard, ReelCard, SupplierCard, VenueCard } from "@/components/cards";
import { LocationFields } from "@/components/LocationFields";
import { Empty, Page, PageHead, SectionHead, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };

const TYPES = ["Farms", "Events", "Venues & Organizers", "Seminars & Training", "Market", "Suppliers", "Articles", "Reels", "Notices"];

export default async function SearchPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = one(sp.q), province = one(sp.province), city = one(sp.city), type = one(sp.type), topic = one(sp.topic);
  const want = (t: string) => !type || type === t;
  const at = (p: string, c: string) => (!province || p === province) && (!city || c === city);
  const [farms, events, goods, reels, articles, suppliers, notices, venues] = await Promise.all([
    approved("farm"), publicEvents(), approved("good"), approved("reel"), approved("article"), approved("supplier"), approved("notice"), approved("venue"),
  ]);
  const tq = (t: string) => !topic || t.toLowerCase().includes(topic.toLowerCase());
  const f = !want("Farms") ? [] : farms.filter((x) => at(x.data.province, x.data.city) && matches(`${x.data.name} ${x.data.city} ${x.data.bloodlines.map((b) => b.name).join(" ")}`, q));
  const evs = events.filter((x) => (x.data.online || at(x.data.province, x.data.city)) && matches(`${x.data.title} ${x.data.venue} ${x.data.sub} ${x.data.topics}`, q) && tq(`${x.data.sub} ${x.data.cat} ${x.data.topics}`));
  const e = want("Events") ? evs.filter((x) => x.data.derby) : [];
  const sem = want("Seminars & Training") ? evs.filter((x) => !x.data.derby) : [];
  const g = !want("Market") ? [] : goods.filter((x) => at(x.data.province, x.data.city) && matches(`${x.data.name} ${x.data.seller} ${x.data.sub}`, q) && tq(`${x.data.cat} ${x.data.sub}`));
  const r = province || city || !want("Reels") ? [] : reels.filter((x) => matches(`${x.data.title} ${x.data.topic} ${x.data.farm}`, q) && tq(x.data.topic));
  const a = province || city || !want("Articles") ? [] : articles.filter((x) => matches(`${x.data.title} ${x.data.topic} ${x.data.body.join(" ")}`, q) && tq(x.data.topic));
  const n = province || city || !want("Notices") ? [] : notices.filter((x) => matches(`${x.data.title} ${x.data.text} ${x.data.kind}`, q) && tq(x.data.kind));
  const s = !want("Suppliers") ? [] : suppliers.filter((x) => (!province || x.data.place.endsWith(province)) && (!city || x.data.place.startsWith(city)) && matches(`${x.data.name} ${x.data.about}`, q));
  const vn = !want("Venues & Organizers") ? [] : venues.filter((x) => at(x.data.province, x.data.city) && matches(`${x.data.name} ${x.data.city} ${x.data.province} ${x.data.roles.join(" ")}`, q));
  const total = vn.length + f.length + e.length + sem.length + g.length + r.length + a.length + s.length + n.length;
  const place = [city, province].filter(Boolean).join(", ");

  return (
    <Page>
      <PageHead title={q ? `“${q}”` : place ? `Near ${place}` : "Search"} sub={`${total} results${place && q ? ` in ${place}` : ""}`} />
      <form action="/search" method="get" className="grid gap-3 rounded-2xl border border-line bg-cream p-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
        <label className={labelCls}>Keyword<input name="q" type="search" defaultValue={q} placeholder="Farms, Market, events, articles…" className={input} /></label>
        <label className={labelCls}>Content type
          <select name="type" defaultValue={type} className={input}><option value="">Everything</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className={labelCls}>Topic or category<input name="topic" defaultValue={topic} placeholder="e.g. Nutrition, Feeds, Seminar" className={input} /></label>
        <LocationFields province={province} city={city} idPrefix="sf" />
        <button type="submit" className="lift min-h-11 cursor-pointer rounded-full border-0 bg-crimson px-6 text-[15px] font-semibold text-white">Search</button>
      </form>
      {place && (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[["Farms", f.length], ["Events", e.length + sem.length], ["Market", g.length], ["Suppliers", s.length]].map(([k, n]) => (
            <div key={k} className="rounded-xl border border-line bg-cream py-3"><div className="font-serif text-[22px] font-semibold text-crimson">{n}</div><div className="text-[12px] text-muted">{k}</div></div>
          ))}
        </div>
      )}
      {total === 0 && (
        <Empty>Nothing found. Try a shorter word (like “Kelso”, “feeds” or “seminar”), pick “Everything” as the content type, or clear the location. You can also browse <a href="/farms" className="text-wine">farms</a>, <a href="/market" className="text-wine">the Market</a> or <a href="/education" className="text-wine">Learn</a>.</Empty>
      )}
      {f.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Farms (${f.length})`} href="/farms" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{f.slice(0, 6).map((x) => <FarmCard key={x.id} f={x} />)}</div></section>}
      {e.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Events (${e.length})`} href="/events" /><div className="grid gap-3 md:grid-cols-2">{e.slice(0, 6).map((x) => <EventCard key={x.id} e={x} />)}</div></section>}
      {vn.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Venues & Organizers (${vn.length})`} href="/venues" /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{vn.slice(0, 6).map((x) => <VenueCard key={x.id} v={x} />)}</div></section>}
      {sem.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Seminars & Training (${sem.length})`} href="/education" /><div className="grid gap-3 md:grid-cols-2">{sem.slice(0, 6).map((x) => <EventCard key={x.id} e={x} />)}</div></section>}
      {g.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Market (${g.length})`} href="/market" /><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{g.slice(0, 8).map((x) => <GoodCard key={x.id} g={x} />)}</div></section>}
      {s.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Suppliers (${s.length})`} href="/suppliers" /><div className="grid gap-3 md:grid-cols-2">{s.map((x) => <SupplierCard key={x.id} s={x} />)}</div></section>}
      {r.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Reels (${r.length})`} href="/reels" /><div className="grid grid-cols-2 gap-3 md:grid-cols-5">{r.map((x) => <ReelCard key={x.id} r={x} />)}</div></section>}
      {a.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Articles (${a.length})`} href="/learn" /><div className="grid gap-3 md:grid-cols-2">{a.map((x) => <ArticleCard key={x.id} a={x} />)}</div></section>}
      {n.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Notices (${n.length})`} href="/notices" /><div className="grid gap-3 md:grid-cols-2">{n.map((x) => <NoticeCard key={x.id} n={x} />)}</div></section>}
    </Page>
  );
}
