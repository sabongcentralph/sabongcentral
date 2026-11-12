import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListedBy } from "@/components/ListedBy";
import { approvedOne } from "@/lib/db";
import { derbyEnabled } from "@/lib/health";
import { BizBadge, Chip, Note, Page, Photo, SampleTag } from "@/components/ui";
import { CalendarIcon, Flag, Pin } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await approvedOne("event", (await params).slug);
  return { title: e?.data.title ?? "Event" };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const ev = await approvedOne("event", (await params).slug);
  if (!ev || (ev.data.derby && !derbyEnabled())) notFound();
  const d = ev.data;
  const status = d.status ?? "Upcoming";
  // Permit numbers and documents stay private; the public only sees whether they were checked.
  const permit = d.derby ? "Cockpit license and LGU event permit verified by admin" : d.permits ? "Permits reviewed by admin" : "Organizer's proof of legitimacy reviewed by admin";
  const facts: [string, string][] = [
    ["Status", status], ["Date", d.longDate], ["Time", d.time], ["Venue", d.venue], ["Location", d.online ? "Online" : `${d.city}, ${d.province}`],
    ["Organizer", d.org], ["Fee", d.fee ? `${d.fee}${/\d/.test(d.fee) ? " (paid directly to the organizer)" : ""}` : ""], ["Registration", d.reg],
    ["Topics / program", d.topics], ["Speakers", d.speakers], ["Permits", permit],
  ];
  return (
    <Page>
      <div className="-mx-4 -mt-5 md:mx-0 md:mt-0"><Photo className={d.poster ? "max-h-[560px] md:rounded-2xl" : "h-[190px] md:h-[320px] md:rounded-2xl"} contain={!!d.poster} label="Event poster" src={d.poster} /></div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip tone={d.derby ? "red" : d.group === "Education & Training" ? "green" : "gold"}>{d.group}</Chip>
          <Chip tone="plain">{d.derby ? d.sub : `${d.cat} · ${d.sub}`}</Chip>
          {status !== "Upcoming" && <Chip tone={status === "Completed" ? "plain" : "red"}>{status}</Chip>}
          {ev.isSample && <SampleTag />}
        </div>
        <h1 className="m-0 font-serif text-[28px] font-semibold leading-tight md:text-[38px]">{d.title}</h1>
        <p className="m-0 flex items-center gap-1.5 text-[14px] text-ink-soft"><CalendarIcon size={16} /> {d.longDate} · {d.time}</p>
        <p className="m-0 flex items-center gap-1.5 text-[14px] text-ink-soft"><Pin size={16} /> {d.venue}</p>
      </div>
      {(status === "Cancelled" || status === "Postponed") && <Note tone="red">This event is <strong>{status.toLowerCase()}</strong>. Check with the organizer for updates.</Note>}
      {ev.isSample && <Note tone="red">This is a sample event to show how the site looks. It is not a real event.</Note>}
      <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[22px] font-semibold">Event Overview</h2>
          <p className="m-0 text-[15px] leading-relaxed text-ink-soft">{d.desc}</p>
          <dl className="m-0 flex flex-col divide-y divide-line rounded-2xl border border-line bg-cream px-4 text-[14px]">
            {facts.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="flex-none text-muted">{k}</dt><dd className="m-0 text-right font-semibold">{v}</dd></div>
            ))}
          </dl>
          {d.online && d.link && <a href={d.link} target="_blank" rel="noopener noreferrer nofollow" className="text-[14px] font-semibold text-wine">Online link ↗</a>}
        </section>
        <aside className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-line bg-cream p-4">
            <h2 className="m-0 text-[16px] font-bold">About the Organizer</h2>
            <span className="text-[15px] font-semibold">{d.org}</span>
            <BizBadge small />
            <span className="text-[12px] text-muted">An admin reviewed this organizer's business registration or proof of legitimacy. This is not a guarantee of the event or any transaction.</span>
          </div>
          <Note tone={d.derby ? "red" : "gold"}>Information only. Sabong Central does not organize events, accept bets, livestream fights, or receive event payments. Any fee is paid directly to the organizer.</Note>
          <ListedBy data={d} title={d.title} />
          <a href={`/report?target=${encodeURIComponent("Event: " + d.title)}`} className="flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-wine no-underline"><Flag size={15} /> Report this event</a>
        </aside>
      </div>
    </Page>
  );
}
