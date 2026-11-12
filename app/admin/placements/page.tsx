import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { approved } from "@/lib/db";
import { one, todayPH, type Search } from "@/lib/content";
import { featuredOf, spotlightOf } from "@/lib/placements";
import { Chip, Note, Page, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Placements" };

export default async function Placements({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const farms = (await approved("farm")).filter((f) => !f.isSample).sort((a, b) => a.data.name.localeCompare(b.data.name));
  const today = todayPH();
  // Show every farm that has a slot, including ones whose end date passed (so they can be renewed or removed).
  const slotted = farms.filter((f) => f.data.featured).sort((a, b) => (a.data.featuredRank ?? 999) - (b.data.featuredRank ?? 999));
  const showing = featuredOf(farms, today).slice(0, 4).map((f) => f.id);
  const spotNow = spotlightOf(farms, today);
  const pinned = farms.find((f) => f.data.spotlight);
  const free = farms.filter((f) => !f.data.featured);
  return (
    <Page>
      <h1 className="m-0 font-serif text-[26px] font-semibold">Placements</h1>
      <p className="m-0 text-[13.5px] text-muted">Choose which farms appear first on the home page and at the top of the Farms page. Mark a slot <strong>Sponsored</strong> when it is a paid ad; it then shows “Sponsored” instead of “Featured” and drops off by itself after its end date. Payments are arranged outside the site.</p>
      {one(sp.saved) && <Note tone="green">Saved. Recorded in the activity log.</Note>}
      <form action="/api/admin/placements" method="post" className="flex flex-col gap-5">
        <section className="flex flex-col gap-2 rounded-2xl border border-line bg-cream p-4">
          <h2 className="m-0 text-[17px] font-bold">Farm Spotlight (the big box on the home page)</h2>
          <label className={labelCls}>Farm
            <select name="spotlight" defaultValue={pinned?.id ?? ""} className={input}>
              <option value="">Automatic (first featured farm)</option>
              {farms.map((f) => <option key={f.id} value={f.id}>{f.data.name} · {f.data.city}</option>)}
            </select>
          </label>
          <span className="text-[12.5px] text-muted">Showing now: <strong>{spotNow?.data.name ?? "—"}</strong>. It uses that farm’s Sponsored setting and end date below.</span>
        </section>
        <section className="flex flex-col gap-2 rounded-2xl border border-line bg-cream p-4">
          <h2 className="m-0 text-[17px] font-bold">Featured slots</h2>
          <p className="m-0 text-[12.5px] text-muted">Slot 1 shows first. The home page shows the first 4; the Farms page lists all of them at the top.</p>
          {slotted.length === 0 ? <p className="m-0 text-[14px]">No featured farms yet. Add one below.</p> : (
            <ul className="m-0 flex list-none flex-col divide-y divide-line p-0">
              {slotted.map((f) => {
                const ended = !!f.data.promoUntil && f.data.promoUntil < today;
                return (
                  <li key={f.id} className="flex flex-wrap items-end gap-3 py-3">
                    <input type="hidden" name="id" value={f.id} />
                    <label className={`${labelCls} w-20`}>Slot<input name={`rank_${f.id}`} type="number" min={1} max={99} defaultValue={f.data.featuredRank ?? ""} className={input} /></label>
                    <div className="flex min-w-[180px] flex-1 flex-col gap-1">
                      <a href={`/farms/${f.slug}`} target="_blank" rel="noopener" className="text-[15px] font-semibold text-ink">{f.data.name} ↗</a>
                      <span className="flex flex-wrap gap-1.5 text-[12px] text-muted">{f.data.city}, {f.data.province}
                        {showing.includes(f.id) && <Chip tone="green">On home page</Chip>}{ended && <Chip tone="red">Ended</Chip>}</span>
                    </div>
                    <label className="flex min-h-11 items-center gap-2 text-[14px]"><input type="checkbox" name={`sp_${f.id}`} value="1" defaultChecked={!!f.data.sponsored} className="size-[17px] accent-crimson" /> Sponsored</label>
                    <label className={labelCls}>End date (optional)<input name={`until_${f.id}`} type="date" defaultValue={f.data.promoUntil ?? ""} className={input} /></label>
                    <label className="flex min-h-11 items-center gap-2 text-[14px] text-wine"><input type="checkbox" name={`remove_${f.id}`} value="1" className="size-[17px] accent-crimson" /> Remove</label>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-sand p-3">
            <label className={`${labelCls} min-w-[200px] flex-1`}>Add a farm
              <select name="add_id" defaultValue="" className={input}><option value="">—</option>{free.map((f) => <option key={f.id} value={f.id}>{f.data.name} · {f.data.city}</option>)}</select>
            </label>
            <label className={`${labelCls} w-20`}>Slot<input name="add_rank" type="number" min={1} max={99} defaultValue={slotted.length + 1} className={input} /></label>
            <label className="flex min-h-11 items-center gap-2 text-[14px]"><input type="checkbox" name="add_sp" value="1" className="size-[17px] accent-crimson" /> Sponsored</label>
            <label className={labelCls}>End date (optional)<input name="add_until" type="date" className={input} /></label>
          </div>
        </section>
        <button type="submit" className={`${btnPrimary} self-start`}>Save placements</button>
      </form>
    </Page>
  );
}
