import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { siteStats, type Count } from "@/lib/stats";
import { Page } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Site stats" };

const fmt = (n: number) => n.toLocaleString("en-US");
const dayLabel = (day: string, opt: Intl.DateTimeFormatOptions) => new Date(day + "T00:00:00Z").toLocaleDateString("en-US", { ...opt, timeZone: "UTC" });

// "+25%" against last week up to the same day, so a half-finished week isn't compared with a full one.
function Change({ now, before }: { now: number; before: number }) {
  if (!before) return <span className="text-[12.5px] text-muted">{now ? "New this week" : "No visits yet"}</span>;
  const p = Math.round(((now - before) / before) * 100);
  return <span className={`text-[12.5px] font-semibold ${p >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>{p >= 0 ? "▲" : "▼"} {Math.abs(p)}% vs last week*</span>;
}

function Big({ label, n, now, before, sub }: { label: string; n: number; now: number; before: number; sub: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-line bg-cream p-3.5 md:p-4">
      <span className="text-[13px] font-semibold text-ink-soft">{label}</span>
      <span className="text-[28px] font-bold leading-tight md:text-[34px]">{fmt(n)}</span>
      <Change now={now} before={before} />
      <span className="text-[12px] text-muted">{sub}</span>
    </div>
  );
}

function Bars({ title, rows, unit, empty, note }: { title: string; rows: Count[]; unit: string; empty: string; note?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-line bg-cream">
      <div className="border-b border-line px-4 py-3">
        <h2 className="m-0 text-[16.5px] font-bold">{title}</h2>
        {note && <p className="m-0 mt-0.5 text-[12px] text-muted">{note}</p>}
      </div>
      {rows.length === 0 ? <p className="m-0 px-4 py-6 text-center text-[14px] text-muted">{empty}</p> : (
        <ol className="m-0 flex list-none flex-col gap-2.5 p-4">
          {rows.map((r, i) => (
            <li key={`${r.label}-${i}`} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2 text-[13.5px]">
                {r.href ? <a href={r.href} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-semibold text-ink no-underline hover:underline">{r.label}</a>
                  : <span className="min-w-0 flex-1 truncate font-semibold">{r.label}</span>}
                <span className="flex-none font-bold">{fmt(r.n)}</span>
                <span className="w-[74px] flex-none text-right text-[11.5px] text-muted">{r.extra ? `${fmt(r.extra)} ${r.extra === 1 ? "person" : "people"}` : unit}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-crimson" style={{ width: `${Math.max(3, (r.n / max) * 100)}%` }} /></div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

const COUNTRY: Record<string, string> = { PH: "Philippines", US: "United States", SA: "Saudi Arabia", AE: "UAE", JP: "Japan", HK: "Hong Kong", SG: "Singapore", CA: "Canada", AU: "Australia", KW: "Kuwait", QA: "Qatar", GB: "United Kingdom" };

export default async function StatsPage() {
  await requireAdmin();
  const s = await siteStats();
  const max = Math.max(1, ...s.daily.map((d) => d.visitors));
  return (
    <Page>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-serif text-[28px] font-semibold md:text-[32px]">Site stats</h1>
        <p className="m-0 text-[14px] text-muted">Weeks run Monday to Sunday, Philippine time. Bots and your own visits while signed in to Admin are not counted. No cookies, no personal data. *Compared with last week up to the same day.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Big label="Visitors this week" n={s.week.visitors} now={s.week.visitors} before={s.lastWeekSoFar.visitors} sub="Different people (phone or computer)" />
        <Big label="Page views this week" n={s.week.views} now={s.week.views} before={s.lastWeekSoFar.views} sub="Every page opened" />
        <div className="flex flex-col gap-0.5 rounded-2xl border border-line bg-cream p-4">
          <span className="text-[13px] font-semibold text-ink-soft">Last week (full)</span>
          <span className="text-[28px] font-bold leading-tight md:text-[34px]">{fmt(s.lastWeek.visitors)}</span>
          <span className="text-[12.5px] text-muted">visitors · {fmt(s.lastWeek.views)} page views</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-2xl border border-line bg-cream p-4">
          <span className="text-[13px] font-semibold text-ink-soft">Pages per visitor</span>
          <span className="text-[28px] font-bold leading-tight md:text-[34px]">{s.week.visitors ? (s.week.views / s.week.visitors).toFixed(1) : "0"}</span>
          <span className="text-[12.5px] text-muted">This week. Higher = people look around more.</span>
        </div>
      </div>

      <section className="flex flex-col overflow-hidden rounded-2xl border border-line bg-cream">
        <div className="border-b border-line px-4 py-3"><h2 className="m-0 text-[16.5px] font-bold">Visitors per day, last 14 days</h2></div>
        <div className="flex h-[170px] items-end gap-1 px-3 pb-2 pt-4 sm:gap-2 sm:px-4">
          {s.daily.map((d) => (
            <div key={d.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${dayLabel(d.day, { weekday: "short", month: "short", day: "numeric" })}: ${d.visitors} visitors, ${d.views} page views`}>
              <span className="text-[10.5px] font-semibold text-ink-soft">{d.visitors || ""}</span>
              <div className={`w-full rounded-t-md ${d.day === s.today ? "bg-gold" : "bg-crimson"}`} style={{ height: `${d.visitors ? Math.max(4, (d.visitors / max) * 100) : 1}%` }} />
            </div>
          ))}
        </div>
        <div className="flex gap-1 px-3 pb-3 sm:gap-2 sm:px-4">
          {s.daily.map((d) => (
            <span key={d.day} className={`min-w-0 flex-1 text-center text-[10px] leading-tight ${d.day === s.today ? "font-bold text-gold-light" : "text-muted"}`}>
              {dayLabel(d.day, { weekday: "narrow" })}<br />{dayLabel(d.day, { day: "numeric" })}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Bars title="Top 10 listings (last 30 days)" rows={s.listings} unit="views" empty="No listing views yet." note="Farms, derbies, seminars, market items, reels, articles and venues. Number = times opened." />
        <Bars title="Top pages this week" rows={s.pages} unit="views" empty="No visits yet this week." />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Bars title="Where visitors come from" rows={s.sources} unit="people" empty="No visits yet this week." note="This week. “Direct” = typed the address, saved app, or a link in a chat app." />
        <Bars title="Phone or computer" rows={s.devices} unit="people" empty="No visits yet this week." />
        <Bars title="Countries" rows={s.countries.map((c) => ({ ...c, label: COUNTRY[c.label] ?? c.label }))} unit="people" empty="No visits yet this week." />
      </div>
      <Bars title="Most viewed listings, all time" rows={s.allTime} unit="views" empty="No listing views yet." note="Counted since stats started (Nov 2026)." />
    </Page>
  );
}
