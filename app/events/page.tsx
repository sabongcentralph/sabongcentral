import type { Metadata } from "next";
import { derbyEnabled } from "@/lib/health";
import { matches, one, publicEvents, type Search } from "@/lib/content";
import { EVENT_CATS } from "@/lib/sample";
import { EventCard } from "@/components/cards";
import { FilterPanel } from "@/components/FilterPanel";
import { LocationFields } from "@/components/LocationFields";
import { Empty, Note, Page, PageHead, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Events" };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default async function EventsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const derby = derbyEnabled();
  const groups = ["All Events", ...(derby ? ["Derbies & Events"] : []), "Education & Training", "Expos & Community"];
  const group = groups.includes(one(sp.group)) ? one(sp.group) : "All Events";
  const type = one(sp.type), month = one(sp.month), year = one(sp.year), province = one(sp.province), city = one(sp.city), venue = one(sp.venue);
  const all = await publicEvents();
  const types = EVENT_CATS.filter((c) => derby || c[2] !== "Derbies & Events").flatMap((c) => c[3]);
  const shown = all.filter((e) => {
    const d = e.data;
    return (group === "All Events" || d.group === group) && (!type || d.sub === type) &&
      (!month || Number(d.date.slice(5, 7)) === MONTHS.indexOf(month) + 1) && (!year || d.date.startsWith(year)) &&
      (!province || d.province === province || d.online) && (!city || d.city === city) && matches(`${d.title} ${d.venue} ${d.city}`, venue);
  });
  const years = [...new Set(all.map((e) => e.data.date.slice(0, 4)))];
  const active = [type, month, year, province, city, venue].filter(Boolean).length;
  const byMonth = new Map<string, typeof shown>();
  for (const e of shown) {
    const k = `${MONTHS[Number(e.data.date.slice(5, 7)) - 1]} ${e.data.date.slice(0, 4)}`;
    byMonth.set(k, [...(byMonth.get(k) ?? []), e]);
  }
  const qs = (g: string) => (g === "All Events" ? "/events" : `/events?group=${encodeURIComponent(g)}`);

  return (
    <Page>
      <PageHead kicker="Events Directory" title="Events" sub="Seminars, workshops, expos, community events at derbies na may verified permits." />
      <nav aria-label="Event groups" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {groups.map((g) => (
          <a key={g} href={qs(g)} aria-current={g === group ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${g === group ? "bg-crimson text-white shadow-[inset_0_-2px_0_#c9a24a]" : "border border-line bg-cream text-ink-soft"}`}>
            {g}
          </a>
        ))}
      </nav>
      <FilterPanel action="/events" reset={qs(group)} active={active}>
        {group !== "All Events" && <input type="hidden" name="group" value={group} />}
        <label className={labelCls}>Event Type
          <select name="type" defaultValue={type} className={input}><option value="">All Types</option>{types.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className={labelCls}>Month
          <select name="month" defaultValue={month} className={input}><option value="">All</option>{MONTHS.map((m) => <option key={m}>{m}</option>)}</select>
        </label>
        <label className={labelCls}>Year
          <select name="year" defaultValue={year} className={input}><option value="">All</option>{years.map((y) => <option key={y}>{y}</option>)}</select>
        </label>
        <label className={labelCls}>Venue<input name="venue" type="search" defaultValue={venue} placeholder="Cockpit, arena, hall…" className={input} /></label>
        <LocationFields province={province} city={city} idPrefix="ef" />
      </FilterPanel>
      {(group === "Derbies & Events" || group === "All Events") && derby && (
        <Note tone="red">Ang derby listings ay information lang (petsa, venue, organizer). Kailangan ng verified cockpit license at LGU permit bago ma-publish. Walang betting, odds o live streaming sa Sabong Central.</Note>
      )}
      {shown.length === 0 ? <Empty>Walang event na tugma sa filter.</Empty> : [...byMonth].map(([m, list]) => (
        <section key={m} className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[20px] font-semibold text-gold-dark">{m}</h2>
          <div className="grid gap-3 md:grid-cols-2">{list.map((e) => <EventCard key={e.id} e={e} />)}</div>
        </section>
      ))}
    </Page>
  );
}
