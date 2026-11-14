import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { twoFactorOf } from "@/lib/totp";
import { adminSummary, type Row } from "@/lib/adminData";
import { siteStats } from "@/lib/stats";
import { titleOf, type QueueStatus } from "@/lib/db";
import { AlertIcon, CalendarIcon, ChevronRight, UserIcon, MailIcon, Pin, ShieldIcon } from "@/components/icons";
import { Chip, Page } from "@/components/ui";
import { PosterThumb } from "@/components/admin/PosterThumb";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin dashboard" };

const tone = (q: QueueStatus) => (q === "Approved" ? "green" : q === "Rejected" || q === "Hidden" ? "red" : q === "Needs Changes" || q === "In Review" ? "gold" : "plain") as "green" | "red" | "gold" | "plain";
const label = (q: QueueStatus) => (q === "New" ? "For review" : q);
const short = (iso: string) => {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return isNaN(+d) ? iso.slice(0, 10) : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" });
};

function Tile({ href, icon, label, n, sub, hot = false }: { href: string; icon: React.ReactNode; label: string; n: number; sub: string; hot?: boolean }) {
  return (
    <a href={href} className={`lift flex items-center gap-3.5 rounded-2xl border p-4 text-ink no-underline ${hot && n > 0 ? "border-crimson/60 bg-gradient-to-br from-[#3a1517] to-cream" : "border-line bg-cream"}`}>
      <span className={`flex size-12 flex-none items-center justify-center rounded-xl ${hot && n > 0 ? "bg-crimson text-white" : "bg-[#26262c] text-wine"}`}>{icon}</span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[13px] font-semibold text-ink-soft">{label}</span>
        <span className="text-[30px] font-bold leading-tight">{n}</span>
        <span className="truncate text-[12px] text-muted">{sub}</span>
      </span>
    </a>
  );
}

function ReviewRow({ r }: { r: Row }) {
  const d = r.l.data as { province?: string; city?: string; group?: string; poster?: string };
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3">
      {r.l.kind === "event" && <PosterThumb title={titleOf(r.l)} group={d.group} poster={d.poster} />}
      <div className="flex min-w-0 flex-1 basis-[220px] flex-col">
        <a href={`/admin/item/${r.l.id}`} className="truncate text-[14.5px] font-semibold text-ink no-underline">{titleOf(r.l)}</a>
        <span className="truncate text-[12px] text-muted">{[[d.city, d.province].filter(Boolean).join(", "), r.l.submittedBy?.replace(/<.*>/, "").trim()].filter(Boolean).join(" · ") || "—"}</span>
      </div>
      <Chip tone="plain">{r.type}</Chip>
      {r.flags.slice(0, 1).map((f) => <Chip key={f} tone="red">{f}</Chip>)}
      <span className="w-[92px] text-[12.5px] text-muted">{short(r.l.createdAt)}</span>
      <a href={`/admin/item/${r.l.id}`} className="inline-flex min-h-9 items-center rounded-lg bg-crimson px-3.5 text-[13px] font-semibold text-white no-underline">Review</a>
    </li>
  );
}

function Card({ title, href, more, children }: { title: string; href?: string; more?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-line bg-cream">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <h2 className="m-0 flex-1 text-[16.5px] font-bold">{title}</h2>
        {href && <a href={href} className="inline-flex items-center gap-1 text-[13px] font-semibold text-wine no-underline">{more ?? "View all"}<ChevronRight size={15} /></a>}
      </div>
      {children}
    </section>
  );
}

export default async function AdminDashboard() {
  const email = await requireAdmin();
  const [s, tf, st] = await Promise.all([adminSummary(), twoFactorOf(email), siteStats().catch(() => null)]);
  const review = s.waiting.slice(0, 6);
  return (
    <Page>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-serif text-[28px] font-semibold md:text-[32px]">Admin Dashboard</h1>
        <p className="m-0 text-[14px] text-muted">Review listings, permits, reports and community content before they go public.</p>
      </div>
      {!tf?.enabled && <a href="/admin/account#twostep" className="rounded-2xl border border-wine bg-cream p-3 text-[14px] font-semibold text-wine no-underline">⚠ Two-step login is off. Turn it on in Account (takes 1 minute) ›</a>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile hot href="/admin/queue" icon={<ShieldIcon size={24} />} label="Waiting for review" n={s.waiting.length} sub={s.needsChanges ? `${s.needsChanges} waiting on submitter changes` : "New and in-review submissions"} />
        <Tile hot href="/admin/members" icon={<UserIcon size={24} />} label="Member applications" n={s.applications} sub="New Portal accounts to check" />
        <Tile hot href="/admin/queue?q=All&risk=Permit+needed" icon={<CalendarIcon size={24} />} label="Derby permits to check" n={s.permits.length} sub="Cockpit license and LGU permit" />
        <Tile hot href="/admin/reports" icon={<AlertIcon size={24} />} label="Reports to handle" n={s.reports} sub="New, investigating or escalated" />

      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title={`Needs your review${s.waiting.length ? ` (${s.waiting.length})` : ""}`} href="/admin/queue">
          {review.length === 0 ? <p className="m-0 px-4 py-8 text-center text-[14px] text-muted">All caught up. Nothing waiting. 🎉</p> : (
            <ul className="m-0 flex list-none flex-col divide-y divide-line p-0">{review.map((r) => <ReviewRow key={r.l.id} r={r} />)}</ul>
          )}
        </Card>

        <div className="flex flex-col gap-5">
          {st && (
            <Card title="Site visitors" href="/admin/stats" more="All stats">
              <div className="grid grid-cols-2 divide-x divide-line pt-4 text-center">
                {([[st.week.visitors, st.lastWeekSoFar.visitors, "Visitors this week"], [st.week.views, st.lastWeekSoFar.views, "Page views this week"]] as const).map(([n, b, l]) => (
                  <div key={l} className="flex flex-col px-2">
                    <span className="text-[26px] font-bold">{n.toLocaleString("en-US")}</span>
                    <span className="text-[12px] text-muted">{l}</span>
                    <span className={`text-[11.5px] font-semibold ${!b ? "text-muted" : n >= b ? "text-[#4ade80]" : "text-[#f87171]"}`}>{b ? `${n >= b ? "▲" : "▼"} ${Math.abs(Math.round(((n - b) / b) * 100))}% vs last week` : "—"}</span>
                  </div>
                ))}
              </div>
              <p className="m-0 px-4 pb-1 pt-3 text-[12px] font-semibold text-ink-soft">Top listings (30 days)</p>
              {st.listings.length === 0 ? <p className="m-0 px-4 pb-4 text-[13px] text-muted">No listing views yet.</p> : (
                <ol className="m-0 flex list-decimal flex-col gap-1 pb-4 pl-9 pr-4 text-[13px]">
                  {st.listings.slice(0, 3).map((l, i) => <li key={i}><span className="flex gap-2"><span className="min-w-0 flex-1 truncate">{l.label}</span><strong>{l.n}</strong></span></li>)}
                </ol>
              )}
            </Card>
          )}
          <Card title="Quick actions">
            <div className="grid grid-cols-2 gap-2.5 p-3">
              {([
                ["/admin/queue", "Review queue", <ShieldIcon key="a" size={22} />],
                ["/admin/queue?type=Event&q=All", "Derbies & events", <CalendarIcon key="b" size={22} />],
                ["/admin/messages", `Messages${s.messages ? ` (${s.messages})` : ""}`, <MailIcon key="c" size={22} />],
                ["/", "View public site", <Pin key="d" size={22} />],
              ] as const).map(([href, l, icon]) => (
                <a key={href} href={href} className="lift flex min-h-[84px] flex-col items-center justify-center gap-1.5 rounded-xl border border-line bg-[#121215] px-2 text-center text-[13px] font-semibold text-ink no-underline">
                  <span className="text-wine">{icon}</span>{l}
                </a>
              ))}
            </div>
          </Card>
          <Card title="Philippines coverage">
            <div className="grid grid-cols-3 divide-x divide-line py-4 text-center">
              {([[s.live.length, "Live listings"], [s.provinces, "Provinces"], [s.cities, "Cities / Mun."]] as const).map(([n, l]) => (
                <div key={l} className="flex flex-col"><span className="text-[24px] font-bold">{n}</span><span className="text-[12px] text-muted">{l}</span></div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Recent derbies & events" href="/admin/queue?type=Event&q=All">
          {s.events.length === 0 ? <p className="m-0 px-4 py-6 text-[14px] text-muted">No events yet.</p> : (
            <ul className="m-0 flex list-none flex-col divide-y divide-line p-0">
              {s.events.map((r) => {
                const d = r.l.data as { date?: string; days?: string; city?: string; province?: string; org?: string; group?: string; poster?: string; longDate?: string };
                return (
                  <li key={r.l.id}>
                    <a href={`/admin/item/${r.l.id}`} className="flex items-center gap-3 px-4 py-3 text-ink no-underline hover:bg-white/[0.03]">
                      <PosterThumb title={titleOf(r.l)} group={d.group} poster={d.poster} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[14.5px] font-semibold">{titleOf(r.l)}</span>
                        <span className="truncate text-[12.5px] text-muted">{[d.city, d.province].filter(Boolean).join(", ")}{d.org ? ` · ${d.org}` : ""}</span>
                        <span className="truncate text-[12.5px] text-ink-soft">{d.longDate ?? d.days ?? ""}</span>
                      </span>
                      <Chip tone={tone(r.qs)}>{label(r.qs)}</Chip>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card title="Recent activity">
          {s.log.length === 0 ? <p className="m-0 px-4 py-6 text-[14px] text-muted">No actions yet.</p> : (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-4 text-[13px]">
              {s.log.map((a) => (
                <li key={a.id} className="flex flex-col"><span><strong>{a.action}</strong> · <span className="text-ink-soft">{a.target}</span></span><span className="text-[11.5px] text-muted">{short(a.created_at)}{a.reason ? ` · “${a.reason}”` : ""}</span></li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Page>
  );
}
