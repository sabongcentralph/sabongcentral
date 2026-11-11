import type { Metadata } from "next";
import { approved } from "@/lib/db";
import { many, matches, one, type Search } from "@/lib/content";
import { BLOODLINES } from "@/lib/sample";
import { FarmCard } from "@/components/cards";
import { FilterPanel } from "@/components/FilterPanel";
import { LocationFields } from "@/components/LocationFields";
import { Empty, Note, Page, PageHead, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Farms" };

export default async function FarmsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = one(sp.q), province = one(sp.province), city = one(sp.city), lines = many(sp.line), ver = one(sp.verified) === "1";
  const all = await approved("farm");
  const farms = all.filter((f) => {
    const d = f.data;
    return (
      matches(d.name + " " + d.bloodlines.map((b) => b.name).join(" ") + " " + d.city, q) &&
      (!province || d.province === province) && (!city || d.city === city) &&
      (!lines.length || d.bloodlines.some((b) => lines.includes(b.name))) && (!ver || d.verified)
    );
  });
  const active = [q, province, city, ver ? "1" : ""].filter(Boolean).length + lines.length;

  return (
    <Page>
      <PageHead kicker="Gamefarm Directory" title="Farms" sub="Lahat ng farms dito ay ni-review ng admin bago lumabas." />
      <FilterPanel action="/farms" reset="/farms" active={active}>
        <label className={labelCls}>Search<input name="q" type="search" defaultValue={q} placeholder="Farm name o bloodline" className={input} /></label>
        <LocationFields province={province} city={city} idPrefix="ff" />
        <label className="flex min-h-11 items-center gap-2.5 self-end text-[14px] font-semibold text-ink-soft">
          <input type="checkbox" name="verified" value="1" defaultChecked={ver} className="size-[18px] accent-crimson" /> ✓ Business Verified lang
        </label>
        <fieldset className="m-0 border-0 p-0 sm:col-span-2 lg:col-span-4">
          <legend className="mb-1.5 text-[13px] font-semibold text-ink-soft">Bloodline</legend>
          <div className="grid grid-cols-2 gap-x-3 sm:grid-cols-3 lg:grid-cols-5">
            {BLOODLINES.map((b) => (
              <label key={b} className="flex min-h-9 cursor-pointer items-center gap-2 text-[14px]">
                <input type="checkbox" name="line" value={b} defaultChecked={lines.includes(b)} className="size-[17px] accent-crimson" /> {b}
              </label>
            ))}
          </div>
        </fieldset>
      </FilterPanel>
      <Note>Ang <strong>Business Verified</strong> ay ibig sabihing na-review ng admin ang business registration ng farm. Hindi ito garantiya ng bloodlines o transactions.</Note>
      <p className="m-0 text-[14px] text-ink-soft"><strong>{farms.length}</strong> farms</p>
      {farms.length === 0 ? <Empty>Walang farm na tugma. Subukan ang ibang filter.</Empty> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map((f) => <FarmCard key={f.id} f={f} />)}
        </div>
      )}
    </Page>
  );
}
