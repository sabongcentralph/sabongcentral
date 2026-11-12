import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListedBy } from "@/components/ListedBy";
import { approvedOne } from "@/lib/db";
import { publicEvents, sameName } from "@/lib/content";
import { derbyEnabled } from "@/lib/health";
import { messengerHref, smsHref, telHref } from "@/lib/links";
import { EventCard } from "@/components/cards";
import { EventsSwitch } from "@/components/EventsSwitch";
import { BizBadge, Chip, Empty, Note, Page, Photo, btnGhost, btnPrimary } from "@/components/ui";
import { Chat, Flag, Phone, Pin } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const v = await approvedOne("venue", (await params).slug);
  return { title: v?.data.name ?? "Venue" };
}

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const v = await approvedOne("venue", (await params).slug);
  if (!v) notFound();
  const d = v.data;
  const events = (await publicEvents()).filter((e) => (!e.data.derby || derbyEnabled()) && e.data.status !== "Completed" &&
    ((d.roles.includes("Venue") && sameName(e.data.venue, d.name)) || (d.roles.includes("Organizer") && sameName(e.data.org, d.name))));
  const msg = (d.messenger && messengerHref(d.messenger)) || (d.facebook ? messengerHref(d.facebook) : null);
  const fbPage = d.facebook && /(^|\.|\/)(facebook\.com|fb\.com)/.test(d.facebook) ? (d.facebook.startsWith("http") ? d.facebook : `https://${d.facebook}`) : null;
  const where = [d.place, d.city, d.province].filter(Boolean).join(", ");
  return (
    <Page>
      <EventsSwitch at="venues" />
      <div className="-mx-4 md:mx-0"><Photo className="h-[170px] md:h-[280px] md:rounded-2xl" label="Venue photo" src={d.cover ?? d.profile} /></div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">{d.roles.map((r) => <Chip key={r} tone={r === "Venue" ? "red" : "gold"}>{r === "Venue" ? "Venue (cockpit arena)" : "Organizer"}</Chip>)}</div>
        <h1 className="m-0 font-serif text-[28px] font-semibold leading-tight md:text-[38px]">{d.name}</h1>
        <p className="m-0 flex items-center gap-1.5 text-[14px] text-muted"><Pin size={15} />{where}</p>
        {d.verified ? <BizBadge /> : <span className="w-fit rounded-full border border-sand px-3 py-1 text-[12.5px] font-semibold text-muted">Permit not yet verified by Sabong Central</span>}
        <div className="flex flex-wrap gap-2 pt-1">
          {msg && <a href={msg} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} gap-2`}><Chat size={17} /> Message</a>}
          {d.phone && <a href={telHref(d.phone)} className={`${btnGhost} gap-2`}><Phone size={16} /> {d.phone}</a>}
          {d.phone && <a href={smsHref(d.phone)} className={`${btnGhost} gap-2`}><Chat size={16} /> Text</a>}
          {fbPage && <a href={fbPage} target="_blank" rel="noopener noreferrer" className={`${btnGhost} gap-2`}>Facebook page ↗</a>}
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
        <section className="flex flex-col gap-3">
          {d.about && <p className="m-0 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{d.about}</p>}
          <h2 className="m-0 font-serif text-[22px] font-semibold">Upcoming events</h2>
          {events.length === 0 ? <Empty>No upcoming events listed yet.</Empty> : <div className="grid gap-3 sm:grid-cols-2">{events.map((e) => <EventCard key={e.id} e={e} />)}</div>}
        </section>
        <aside className="flex flex-col gap-3">
          <Note tone="red">Information only. Sabong Central does not run arenas, take bets, sell tickets or livestream fights. Always confirm a venue’s current permit with the venue and the LGU.</Note>
          <p className="m-0 rounded-xl bg-blush px-3 py-2 text-[13px] font-semibold text-wine">21+ only · Gamble responsibly. Need help? National Problem Gambling Helpline (02) 8248-9568. <a href="/legal/responsible-gaming" className="text-wine">Learn more</a></p>
          <ListedBy data={d} title={d.name} />
          <a href={`/report?target=${encodeURIComponent("Venue: " + d.name)}`} className="flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-wine no-underline"><Flag size={15} /> Report this listing</a>
        </aside>
      </div>
    </Page>
  );
}
