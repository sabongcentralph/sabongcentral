import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  const facts: [string, string][] = [
    ["Petsa", d.longDate], ["Oras", d.time], ["Venue", d.venue], ["Lugar", d.online ? "Online" : `${d.city}, ${d.province}`],
    ["Organizer", d.org], ["Fee", d.fee], ["Registration", d.reg], ["Topics", d.topics], ["Speakers", d.speakers], ["Permits", d.permits],
  ];
  return (
    <Page>
      <div className="-mx-4 -mt-5 md:mx-0 md:mt-0"><Photo className="h-[190px] md:h-[320px] md:rounded-2xl" label="Event poster" /></div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip tone={d.derby ? "red" : d.group === "Education & Training" ? "green" : "gold"}>{d.group}</Chip>
          <Chip tone="plain">{d.derby ? d.sub : `${d.cat} · ${d.sub}`}</Chip>
          {ev.isSample && <SampleTag />}
        </div>
        <h1 className="m-0 font-serif text-[28px] font-semibold leading-tight md:text-[38px]">{d.title}</h1>
        <p className="m-0 flex items-center gap-1.5 text-[14px] text-ink-soft"><CalendarIcon size={16} /> {d.longDate} · {d.time}</p>
        <p className="m-0 flex items-center gap-1.5 text-[14px] text-ink-soft"><Pin size={16} /> {d.venue}</p>
      </div>
      {ev.isSample && <Note tone="red">Sample event ito para makita ang itsura ng site. Hindi ito totoong event.</Note>}
      <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[22px] font-semibold">Event Overview</h2>
          <p className="m-0 text-[15px] leading-relaxed text-ink-soft">{d.desc}</p>
          <dl className="m-0 flex flex-col divide-y divide-line rounded-2xl border border-line bg-cream px-4 text-[14px]">
            {facts.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="flex-none text-muted">{k}</dt><dd className="m-0 text-right font-semibold">{v}</dd></div>
            ))}
          </dl>
        </section>
        <aside className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-line bg-cream p-4">
            <h2 className="m-0 text-[16px] font-bold">About the Organizer</h2>
            <span className="text-[15px] font-semibold">{d.org}</span>
            <BizBadge small />
            <span className="text-[12px] text-muted">Na-review ng admin ang proof of legitimacy ng organizer.</span>
          </div>
          {d.derby ? (
            <Note tone="red">Information lang ito. Hindi nag-o-organize, tumatanggap ng taya, o nagla-livestream ng laban ang Sabong Central.</Note>
          ) : (
            <Note>Ang fee ay bayad sa organizer para sa seminar/workshop. Hindi dumadaan sa Sabong Central ang bayad.</Note>
          )}
          <a href={`/report?target=${encodeURIComponent("Event: " + d.title)}`} className="flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-wine no-underline"><Flag size={15} /> Report this event</a>
        </aside>
      </div>
    </Page>
  );
}
