import type { ArticleData, EventData, FarmData, GoodData, Listing, NoticeData, ReelData, SupplierData } from "@/lib/db";
import { availOf } from "@/lib/db";
import { BizBadge, Chip, Photo, SampleTag } from "./ui";
import { Pin, Play } from "./icons";

const cardCls = "card flex flex-col overflow-hidden rounded-2xl border border-line bg-cream text-ink no-underline";

export function FarmCard({ f, compact = false }: { f: Listing<"farm">; compact?: boolean }) {
  const d: FarmData = f.data;
  return (
    <a href={`/farms/${f.slug}`} className={`${cardCls} ${compact ? "w-[220px] flex-none snap-start md:w-auto" : ""}`}>
      <div className="overflow-hidden"><Photo className={compact ? "h-[120px]" : "h-[160px]"} label="Farm photo" /></div>
      <div className="flex flex-col gap-1.5 p-3.5">
        <div className="flex items-start gap-2">
          <h3 className="m-0 flex-1 text-[16px] font-bold leading-snug">{d.name}</h3>
          {f.isSample && <SampleTag />}
        </div>
        {d.verified && <BizBadge small />}
        <p className="m-0 flex items-center gap-1 text-[13px] text-muted"><Pin size={13} />{d.city}, {d.province}</p>
        <div className="flex flex-wrap gap-1">
          {d.bloodlines.slice(0, 3).map((b) => <Chip key={b.name}>{b.name}</Chip>)}
        </div>
      </div>
    </a>
  );
}

const groupTone = (g: string) => (g === "Derbies & Events" ? "red" : g === "Education & Training" ? "green" : "gold") as "red" | "green" | "gold";

export function EventCard({ e, compact = false }: { e: Listing<"event">; compact?: boolean }) {
  const d: EventData = e.data;
  const [y, m, day] = d.date.split("-");
  const mon = new Date(Number(y), Number(m) - 1, 1).toLocaleString("en", { month: "short" }).toUpperCase();
  return (
    <a href={`/${d.derby ? "events" : "education"}/${e.slug}`} className={`${cardCls} flex-row gap-3 p-3 ${compact ? "w-[290px] flex-none snap-start md:w-auto" : ""}`}>
      <div className="flex w-14 flex-none flex-col items-center justify-center rounded-xl bg-crimson py-2 text-white">
        <span className="text-[11px] font-bold tracking-wider text-gold-light">{mon}</span>
        <span className="font-serif text-[24px] font-semibold leading-none">{day}</span>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5"><Chip tone={groupTone(d.group)}>{d.derby ? d.sub : d.cat}</Chip>{d.status && d.status !== "Upcoming" && <Chip tone={d.status === "Completed" ? "plain" : "red"}>{d.status}</Chip>}{e.isSample && <SampleTag />}</div>
        <h3 className="m-0 text-[15px] font-bold leading-snug">{d.title}</h3>
        <p className="m-0 flex items-center gap-1 text-[12.5px] text-muted"><Pin size={12} />{d.online ? "Online" : `${d.city}, ${d.province}`} · {d.days}</p>
        <p className="m-0 truncate text-[12.5px] text-muted">By {d.org}</p>
        <p className="m-0 text-[12.5px] font-semibold text-ink-soft">{/^free/i.test(d.fee) ? "Free" : /\d/.test(d.fee) ? `Fee: ${d.fee} (paid to organizer)` : d.fee}</p>
      </div>
    </a>
  );
}

export function AvailBadge({ d, className }: { d: GoodData; className: string }) {
  const a = availOf(d);
  const bg = a === "Available" ? "bg-[#2f5b3a]" : a === "Reserved" ? "bg-[#a07a2c]" : "bg-ink-soft";
  return <span className={`rounded-md font-bold text-white ${bg} ${className}`}>{a}</span>;
}

export function GoodCard({ g, compact = false }: { g: Listing<"good">; compact?: boolean }) {
  const d: GoodData = g.data;
  return (
    <a href={`/market/${g.slug}`} className={`${cardCls} ${compact ? "w-[170px] flex-none snap-start md:w-auto" : ""}`}>
      <div className="relative overflow-hidden">
        <Photo className="aspect-square" label="Product photo" />
        <AvailBadge d={d} className="absolute left-2 top-2 px-2 py-0.5 text-[10.5px]" />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="text-[11px] font-semibold text-gold-dark">{d.cat} · {d.sub}</span>
        <h3 className="m-0 text-[14px] font-bold leading-snug">{d.name}</h3>
        <span className="text-[16px] font-bold text-crimson">{d.price}</span>
        <span className="truncate text-[12px] text-muted">{d.seller} · {d.city}</span>
        {g.isSample && <SampleTag />}
      </div>
    </a>
  );
}

export function ReelCard({ r, compact = false }: { r: Listing<"reel">; compact?: boolean }) {
  const d: ReelData = r.data;
  return (
    <a href={`/reels/${r.slug}`} className={`${cardCls} ${compact ? "w-[150px] flex-none snap-start md:w-auto" : ""}`}>
      <div className="relative overflow-hidden">
        <Photo className="aspect-[9/14]" label="Reel thumbnail" />
        <span className="absolute inset-0 flex items-center justify-center"><span className="flex size-11 items-center justify-center rounded-full bg-black/45 text-white"><Play size={20} /></span></span>
        <span className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10.5px] font-bold text-white">{d.platform}</span>
      </div>
      <div className="flex flex-col gap-0.5 p-2.5">
        <h3 className="m-0 line-clamp-2 text-[13px] font-bold leading-snug">{d.title}</h3>
        <span className="truncate text-[11.5px] text-muted">{d.farm}</span>
      </div>
    </a>
  );
}

export function ArticleCard({ a }: { a: Listing<"article"> }) {
  const d: ArticleData = a.data;
  return (
    <a href={`/learn/${a.slug}`} className={`${cardCls} flex-row gap-3 p-3`}>
      <Photo className="h-[78px] w-[92px] flex-none rounded-xl" label="Article photo" />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-1.5"><Chip tone="green">{d.topic}</Chip>{a.isSample && <SampleTag />}</div>
        <h3 className="m-0 text-[15px] font-bold leading-snug">{d.title}</h3>
        <span className="text-[12px] text-muted">{d.date} · {d.read}</span>
      </div>
    </a>
  );
}

export function NoticeCard({ n }: { n: Listing<"notice"> }) {
  const d: NoticeData = n.data;
  const tone = d.kind === "Official Advisories" ? "red" : d.kind === "Safety Warnings" ? "gold" : "green";
  return (
    <article className="flex flex-col gap-1.5 rounded-2xl border border-line bg-cream p-4">
      <div className="flex items-center gap-1.5"><Chip tone={tone}>{d.kind}</Chip>{n.isSample && <SampleTag />}</div>
      <h3 className="m-0 text-[15px] font-bold leading-snug">{d.title}</h3>
      <span className="text-[12px] text-muted">{d.meta}</span>
      <p className="m-0 text-[14px] leading-relaxed text-ink-soft">{d.text}</p>
      {(d.issuer || d.scope || d.expires) && (
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[12.5px]">
          {d.issuer && <><dt className="text-muted">Issued by</dt><dd className="m-0 font-semibold">{d.issuer}</dd></>}
          {d.scope && <><dt className="text-muted">Applies to</dt><dd className="m-0 font-semibold">{d.scope}</dd></>}
          {d.expires && <><dt className="text-muted">Valid until</dt><dd className="m-0 font-semibold">{d.expires}</dd></>}
        </dl>
      )}
      {d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-[12px] font-semibold text-wine">Official source ↗</a> : d.source && <span className="text-[12px] font-semibold text-wine">{d.source}</span>}
      <a href={`/report?target=${encodeURIComponent("Notice: " + d.title)}`} className="self-start text-[12px] font-semibold text-muted">Report</a>
    </article>
  );
}

export function SupplierCard({ s }: { s: Listing<"supplier"> }) {
  const d: SupplierData = s.data;
  return (
    <article className="flex gap-3 rounded-2xl border border-line bg-cream p-3.5">
      <Photo className="size-16 flex-none rounded-xl" label="Supplier logo" />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5"><Chip tone="blue">{d.kind}</Chip><BizBadge small />{s.isSample && <SampleTag />}</div>
        <h3 className="m-0 text-[15px] font-bold">{d.name}</h3>
        <span className="text-[12.5px] text-muted">{d.place}</span>
        <span className="text-[13px] text-ink-soft">{d.about}</span>
        <span className="text-[13px] font-semibold">📞 {d.phone}</span>
        <a href={`/report?target=${encodeURIComponent("Supplier: " + d.name)}`} className="self-start text-[12px] font-semibold text-muted">Report</a>
      </div>
    </article>
  );
}
