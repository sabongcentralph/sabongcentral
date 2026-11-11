import type { Metadata } from "next";
import { approved } from "@/lib/db";
import { matches, one, type Search } from "@/lib/content";
import { GOODS_CATS } from "@/lib/sample";
import { GoodCard } from "@/components/cards";
import { FilterPanel } from "@/components/FilterPanel";
import { LocationFields } from "@/components/LocationFields";
import { Empty, Note, Page, PageHead, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Goods" };

const peso = (p: string) => Number(p.replace(/[^\d.]/g, "")) || null;

export default async function GoodsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = one(sp.q), cat = one(sp.cat), sub = one(sp.sub), province = one(sp.province), city = one(sp.city);
  const min = Number(one(sp.min)) || 0, max = Number(one(sp.max)) || 0, avail = one(sp.avail) || "Available";
  const all = await approved("good");
  const shown = all.filter((g) => {
    const d = g.data, p = peso(d.price);
    return matches(`${d.name} ${d.seller} ${d.sub}`, q) && (!cat || d.cat === cat) && (!sub || d.sub === sub) &&
      (!province || d.province === province) && (!city || d.city === city) &&
      (!min || (p !== null && p >= min)) && (!max || (p !== null && p <= max)) &&
      (avail === "All" || (avail === "Sold" ? d.sold : !d.sold));
  });
  const active = [q, cat, sub, province, city, min ? "1" : "", max ? "1" : "", avail !== "Available" ? "1" : ""].filter(Boolean).length;

  return (
    <Page>
      <PageHead kicker="Community Market" title="Goods" sub="Feeds, supplements, equipment, housing at farm services mula sa independent sellers." />
      <nav aria-label="Categories" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {["", ...Object.keys(GOODS_CATS)].map((c) => (
          <a key={c || "all"} href={c ? `/goods?cat=${encodeURIComponent(c)}` : "/goods"} aria-current={c === cat ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${c === cat ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {c || "Lahat"}
          </a>
        ))}
      </nav>
      <FilterPanel action="/goods" reset="/goods" active={active}>
        <label className={labelCls}>Search<input name="q" type="search" defaultValue={q} placeholder="Produkto o seller" className={input} /></label>
        <label className={labelCls}>Category
          <select name="cat" defaultValue={cat} className={input}><option value="">Lahat</option>{Object.keys(GOODS_CATS).map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className={labelCls}>Subcategory
          <select name="sub" defaultValue={sub} className={input}><option value="">Lahat</option>
            {Object.entries(GOODS_CATS).filter(([c]) => !cat || c === cat).map(([c, subs]) => (
              <optgroup key={c} label={c}>{subs.map((s) => <option key={s}>{s}</option>)}</optgroup>
            ))}
          </select>
        </label>
        <label className={labelCls}>Availability
          <select name="avail" defaultValue={avail} className={input}>{["Available", "Sold", "All"].map((a) => <option key={a}>{a}</option>)}</select>
        </label>
        <LocationFields province={province} city={city} idPrefix="gf" />
        <label className={labelCls}>Min price (₱)<input name="min" type="number" min="0" inputMode="numeric" defaultValue={min || ""} className={input} /></label>
        <label className={labelCls}>Max price (₱)<input name="max" type="number" min="0" inputMode="numeric" defaultValue={max || ""} className={input} /></label>
      </FilterPanel>
      <Note tone="red"><strong>Beware of scams.</strong> I-verify muna ang seller at item bago magbayad. Hindi dumadaan sa Sabong Central ang bayad. <a href="/legal/market" className="font-semibold text-wine">Basahin pa</a></Note>
      <p className="m-0 text-[14px] text-ink-soft"><strong>{shown.length}</strong> listings</p>
      {shown.length === 0 ? <Empty>Walang listing na tugma.</Empty> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{shown.map((g) => <GoodCard key={g.id} g={g} />)}</div>
      )}
      <p className="m-0 text-[12px] text-muted">Hindi pa pinapayagan: live birds, fighting weapons at regulated veterinary medicines.</p>
    </Page>
  );
}
