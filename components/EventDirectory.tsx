import { derbyEnabled } from "@/lib/health";
import { matches, one, publicEvents, todayPH, type Search } from "@/lib/content";
import { EVENT_CATS } from "@/lib/sample";
import { EventCard } from "@/components/cards";
import { FilterPanel } from "@/components/FilterPanel";
import { LocationFields } from "@/components/LocationFields";
import { Empty, Note, Page, PageHead, input, labelCls } from "@/components/ui";
import { LearnSwitch } from "@/components/LearnSwitch";
import { EventsSwitch } from "@/components/EventsSwitch";


const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export type DirMode = "derby" | "education";

// One directory, two tabs: Events lists derbies only, Education lists seminars, training and expos.
export async function EventDirectory({ sp, mode }: { sp: Search; mode: DirMode }) {
  const derby = derbyEnabled();
  const base = mode === "derby" ? "/events" : "/education";
  const groups = mode === "derby" ? [] : ["All", "Education & Training", "Expos & Community"];
  const group = groups.includes(one(sp.group)) ? one(sp.group) : "All";
  const type = one(sp.type), month = one(sp.month), year = one(sp.year), province = one(sp.province), city = one(sp.city), venue = one(sp.venue);
  const past = mode === "education" && one(sp.when) === "past";
  const today = todayPH();
  const all = past
    ? (await publicEvents({ includePast: true })).filter((e) => !e.data.derby && (e.data.date < today || e.data.status === "Completed")).reverse()
    : (await publicEvents()).filter((e) => (mode === "derby" ? e.data.derby : !e.data.derby) && e.data.status !== "Completed");
  const types = EVENT_CATS.filter((c) => (mode === "derby") === (c[2] === "Derbies & Events")).flatMap((c) => c[3]);
  const shown = all.filter((e) => {
    const d = e.data;
    return (group === "All" || d.group === group) && (!type || d.sub === type) &&
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
  const qs = (g: string, when = past ? "past" : "") => {
    const p = new URLSearchParams();
    if (g !== "All") p.set("group", g);
    if (when) p.set("when", when);
    const q = p.toString();
    return q ? `${base}?${q}` : base;
  };

  return (
    <Page>
      {mode === "derby"
        ? <PageHead kicker="Derby Schedule" title="Events" sub="Derby schedules with verified permits: date, venue and organizer." />
        : <PageHead kicker="Learn & Grow" title="Learn" sub="Seminars, workshops, training, webinars and expos, plus articles and guides from breeders and veterinarians." />}
      {mode === "education" && <LearnSwitch at="events" />}
      {mode === "derby" && <EventsSwitch at="derbies" />}
      {groups.length > 0 && <nav aria-label="Event groups" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {groups.map((g) => (
          <a key={g} href={qs(g)} aria-current={g === group ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${g === group ? "bg-crimson text-white shadow-[inset_0_-2px_0_#c8a44d]" : "border border-line bg-cream text-ink-soft"}`}>
            {g}
          </a>
        ))}
      </nav>}
      {mode === "education" && (
        <div className="flex gap-1 self-start rounded-full border border-line bg-cream p-1 text-[13px] font-semibold">
          {[["", "Upcoming"], ["past", "Past"]].map(([w, label]) => (
            <a key={label} href={qs(group, w)} aria-current={(w === "past") === past ? "page" : undefined}
              className={`rounded-full px-3.5 py-1.5 no-underline ${(w === "past") === past ? "bg-ink text-cream" : "text-ink-soft"}`}>{label}</a>
          ))}
        </div>
      )}
      <FilterPanel action={base} reset={qs(group)} active={active}>
        {group !== "All" && <input type="hidden" name="group" value={group} />}
        {past && <input type="hidden" name="when" value="past" />}
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
      {mode === "derby" && !derby && <Note tone="gold">Derby listings are switched off for now.</Note>}
      {mode === "derby" && derby && (
        <Note tone="red">Derby listings are information only (date, venue, organizer). Each needs a verified cockpit license and LGU permit before it is published. No betting, odds or live streaming on Sabong Central.</Note>
      )}
      {shown.length === 0 ? <Empty>{mode === "derby" ? "No derbies match your filters." : past ? "No past seminars or events yet." : "No seminars or events match your filters. Try another month or province."}</Empty> : [...byMonth].map(([m, list]) => (
        <section key={m} className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[20px] font-semibold text-gold-dark">{m}</h2>
          <div className="grid gap-3 md:grid-cols-2">{list.map((e) => <EventCard key={e.id} e={e} />)}</div>
        </section>
      ))}
    </Page>
  );
}
