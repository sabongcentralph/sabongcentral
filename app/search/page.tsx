import type { Metadata } from "next";
import { approved } from "@/lib/db";
import { matches, one, publicEvents, type Search } from "@/lib/content";
import { ArticleCard, EventCard, FarmCard, GoodCard, ReelCard, SupplierCard } from "@/components/cards";
import { LocationFields } from "@/components/LocationFields";
import { Empty, Page, PageHead, SectionHead, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = one(sp.q), province = one(sp.province), city = one(sp.city);
  const at = (p: string, c: string) => (!province || p === province) && (!city || c === city);
  const [farms, events, goods, reels, articles, suppliers] = await Promise.all([
    approved("farm"), publicEvents(), approved("good"), approved("reel"), approved("article"), approved("supplier"),
  ]);
  const f = farms.filter((x) => at(x.data.province, x.data.city) && matches(`${x.data.name} ${x.data.city} ${x.data.bloodlines.map((b) => b.name).join(" ")}`, q));
  const e = events.filter((x) => (x.data.online || at(x.data.province, x.data.city)) && matches(`${x.data.title} ${x.data.venue} ${x.data.sub}`, q));
  const g = goods.filter((x) => at(x.data.province, x.data.city) && matches(`${x.data.name} ${x.data.seller} ${x.data.sub}`, q));
  const r = province || city ? [] : reels.filter((x) => matches(`${x.data.title} ${x.data.topic} ${x.data.farm}`, q));
  const a = province || city ? [] : articles.filter((x) => matches(`${x.data.title} ${x.data.topic} ${x.data.body.join(" ")}`, q));
  const s = suppliers.filter((x) => (!province || x.data.place.endsWith(province)) && (!city || x.data.place.startsWith(city)) && matches(`${x.data.name} ${x.data.about}`, q));
  const total = f.length + e.length + g.length + r.length + a.length + s.length;
  const place = [city, province].filter(Boolean).join(", ");

  return (
    <Page>
      <PageHead title={q ? `“${q}”` : place ? `Near ${place}` : "Search"} sub={`${total} results${place && q ? ` in ${place}` : ""}`} />
      <form action="/search" method="get" className="grid gap-3 rounded-2xl border border-line bg-cream p-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <label className={labelCls}>Search<input name="q" type="search" defaultValue={q} placeholder="Farms, goods, events, articles…" className={input} /></label>
        <LocationFields province={province} city={city} idPrefix="sf" />
        <button type="submit" className="lift min-h-11 cursor-pointer rounded-full border-0 bg-crimson px-6 text-[15px] font-semibold text-white">Search</button>
      </form>
      {place && (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[["Farms", f.length], ["Events", e.length], ["Goods", g.length], ["Suppliers", s.length]].map(([k, n]) => (
            <div key={k} className="rounded-xl border border-line bg-cream py-3"><div className="font-serif text-[22px] font-semibold text-crimson">{n}</div><div className="text-[12px] text-muted">{k}</div></div>
          ))}
        </div>
      )}
      {total === 0 && (
        <Empty>Nothing found. Try another word, like “Kelso”, “feeds” or “seminar”, or browse <a href="/farms" className="text-wine">all farms</a>.</Empty>
      )}
      {f.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Farms (${f.length})`} href="/farms" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{f.slice(0, 6).map((x) => <FarmCard key={x.id} f={x} />)}</div></section>}
      {e.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Events (${e.length})`} href="/events" /><div className="grid gap-3 md:grid-cols-2">{e.slice(0, 6).map((x) => <EventCard key={x.id} e={x} />)}</div></section>}
      {g.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Goods (${g.length})`} href="/goods" /><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{g.slice(0, 8).map((x) => <GoodCard key={x.id} g={x} />)}</div></section>}
      {s.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Suppliers (${s.length})`} href="/suppliers" /><div className="grid gap-3 md:grid-cols-2">{s.map((x) => <SupplierCard key={x.id} s={x} />)}</div></section>}
      {r.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Reels (${r.length})`} href="/reels" /><div className="grid grid-cols-2 gap-3 md:grid-cols-5">{r.map((x) => <ReelCard key={x.id} r={x} />)}</div></section>}
      {a.length > 0 && <section className="flex flex-col gap-3"><SectionHead title={`Articles (${a.length})`} href="/learn" /><div className="grid gap-3 md:grid-cols-2">{a.map((x) => <ArticleCard key={x.id} a={x} />)}</div></section>}
    </Page>
  );
}
