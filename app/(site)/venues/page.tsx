import type { Metadata } from "next";
import { shuffled } from "@/lib/feed";
import { approved } from "@/lib/db";
import { matches, one, type Search } from "@/lib/content";
import { VenueCard } from "@/components/cards";
import { EventsSwitch } from "@/components/EventsSwitch";
import { Empty, Note, Page, PageHead, input, labelCls, btnGhost } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Venues & Organizers" };

const ROLE_TABS = [["", "All"], ["Venue", "Venues"], ["Organizer", "Organizers"]] as const;

export default async function VenuesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const role = one(sp.role), province = one(sp.province), q = one(sp.q);
  const all = await approved("venue");
  const provinces = [...new Set(all.map((v) => v.data.province))].sort();
  // Shuffled on every visit unless the viewer filters (Em, 2026-11-13); filtered lists stay A to Z.
  const shown = !(role || province || q) ? shuffled(all) : all
    .filter((v) => (!role || v.data.roles.includes(role)) && (!province || v.data.province === province) && matches(`${v.data.name} ${v.data.city} ${v.data.province}`, q))
    .sort((a, b) => a.data.province.localeCompare(b.data.province) || a.data.name.localeCompare(b.data.name));
  const link = (r: string) => {
    const p = new URLSearchParams();
    if (r) p.set("role", r);
    if (province) p.set("province", province);
    if (q) p.set("q", q);
    const s = p.toString();
    return s ? `/venues?${s}` : "/venues";
  };
  return (
    <Page>
      <PageHead kicker="Derby Schedule" title="Events" sub="Cockpit arenas and the organizers who run derbies. One profile can be both." />
      <EventsSwitch at="venues" />
      <nav aria-label="Venue or organizer" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {ROLE_TABS.map(([r, label]) => (
          <a key={label} href={link(r)} aria-current={r === role ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${r === role ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {label}
          </a>
        ))}
      </nav>
      <form method="get" action="/venues" className="grid gap-2 rounded-2xl border border-line bg-cream p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        {role && <input type="hidden" name="role" value={role} />}
        <label className={labelCls}>Province
          <select name="province" defaultValue={province} className={input}><option value="">All provinces</option>{provinces.map((p) => <option key={p}>{p}</option>)}</select>
        </label>
        <label className={labelCls}>Name or city<input name="q" type="search" defaultValue={q} className={input} /></label>
        <button type="submit" className={btnGhost}>Filter</button>
      </form>
      <Note>Information only. Sabong Sentral does not run arenas, take bets or sell tickets. “Permit not yet verified” means we haven’t checked the venue’s current permit; always confirm with the venue and the LGU. 21+ only.</Note>
      {shown.length === 0 ? <Empty>No venues or organizers {province ? `in ${province} ` : ""}yet.</Empty> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{shown.map((v) => <VenueCard key={v.id} v={v} />)}</div>
      )}
      <p className="m-0 text-[13px] text-muted">Run an arena or organize derbies? Get a <a href="/contact?topic=Request%20a%20Portal%20account" className="font-semibold text-wine">Portal account</a> to manage your own profile and post your derbies.</p>
    </Page>
  );
}
