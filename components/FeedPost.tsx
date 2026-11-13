import type { ArticleData, EventData, FarmData, GoodData, Listing, NoticeData, ReelData } from "@/lib/db";
import type { FeedItem } from "@/lib/feed";
import { AvailBadge } from "./cards";
import { BizBadge, Chip, Photo, SampleTag } from "./ui";
import { BagIcon, BookIcon, CalendarIcon, FarmIcon, GradIcon, MegaphoneIcon, Pin, Play, ReelIcon } from "./icons";

// One post in the Home feed, laid out like a social post: who/what and when,
// the main text, a big photo, then a link to the full page.

function ago(createdAt: string): string {
  const t = Date.parse(createdAt.includes("T") ? createdAt : createdAt.replace(" ", "T") + "Z");
  if (!t) return "";
  const m = Math.max(0, Math.round((Date.now() - t) / 60_000));
  if (m < 60) return m <= 1 ? "Just now" : `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(t).toLocaleDateString("en-PH", { month: "short", day: "numeric", timeZone: "Asia/Manila" });
}

type Shape = {
  href: string; type: string; who: string; place?: string; avatar?: string;
  Icon: (p: { size?: number; className?: string }) => React.ReactNode; tone: string; cta: string;
  body: React.ReactNode; media?: React.ReactNode; flags?: React.ReactNode;
};

const place = (city?: string, province?: string) => [city, province].filter(Boolean).join(", ");

function shape(l: Listing): Shape {
  switch (l.kind) {
    case "farm": {
      const d = l.data as FarmData;
      return {
        href: `/farms/${l.slug}`, type: "Gamefarm", who: d.name, place: place(d.city, d.province), avatar: d.profile,
        Icon: FarmIcon, tone: "bg-noir text-gold-light", cta: "View farm",
        flags: d.verified ? <BizBadge small /> : null,
        body: <>
          {d.about && <p className="m-0 line-clamp-3 text-[14.5px] leading-relaxed text-ink-soft">{d.about}</p>}
          {d.bloodlines?.length > 0 && <div className="flex flex-wrap gap-1">{d.bloodlines.slice(0, 4).map((b) => <Chip key={b.name}>{b.name}</Chip>)}</div>}
        </>,
        media: (d.cover ?? d.gallery?.[0]) ? <Photo className="aspect-[16/9]" label="Farm photo" src={d.cover ?? d.gallery?.[0]} /> : undefined,
      };
    }
    case "event": {
      const d = l.data as EventData;
      return {
        href: `/${d.derby ? "events" : "education"}/${l.slug}`, type: d.derby ? "Derby" : d.cat || "Seminar", who: d.org || d.venue,
        place: d.online ? "Online" : place(d.city, d.province), Icon: d.derby ? CalendarIcon : GradIcon,
        tone: d.derby ? "bg-crimson text-white" : "bg-[#2f5b3a] text-white", cta: "See details",
        flags: <>{d.derby && d.sub && <Chip>{d.sub}</Chip>}{d.status && d.status !== "Upcoming" && <Chip tone={d.status === "Completed" ? "plain" : "red"}>{d.status}</Chip>}</>,
        body: <>
          <h3 className="m-0 text-[17px] font-bold leading-snug">{d.title}</h3>
          <p className="m-0 text-[14px] font-semibold text-crimson">📅 {d.longDate || d.days}{d.time ? ` · ${d.time}` : ""}</p>
          {!d.online && d.venue && <p className="m-0 text-[13.5px] text-ink-soft">📍 {d.venue}</p>}
        </>,
        media: d.poster ? <Photo className="max-h-[520px] bg-noir" contain label="Event poster" src={d.poster} /> : undefined,
      };
    }
    case "good": {
      const d = l.data as GoodData;
      return {
        href: `/market/${l.slug}`, type: "Market", who: d.seller, place: place(d.city, d.province), Icon: BagIcon,
        tone: "bg-gold text-noir", cta: "View item",
        flags: <><AvailBadge d={d} className="px-2 py-0.5 text-[11px]" />{d.sellerVerified && <BizBadge small />}</>,
        body: <>
          <span className="text-[12px] font-semibold text-gold-dark">{d.cat}{d.sub ? ` · ${d.sub}` : ""}</span>
          <h3 className="m-0 text-[17px] font-bold leading-snug">{d.name}</h3>
          <span className="text-[18px] font-bold text-crimson">{d.price}</span>
        </>,
        media: d.photos?.[0] ? <Photo className="aspect-[4/3]" label="Product photo" src={d.photos[0]} /> : undefined,
      };
    }
    case "reel": {
      const d = l.data as ReelData;
      return {
        href: `/reels/${l.slug}`, type: "Reel", who: d.farm || "Educational reel", Icon: ReelIcon,
        tone: "bg-noir text-white", cta: "Watch reel",
        body: <>
          <h3 className="m-0 text-[17px] font-bold leading-snug">{d.title}</h3>
          {d.desc && <p className="m-0 line-clamp-2 text-[14px] text-ink-soft">{d.desc}</p>}
        </>,
        media: (
          <div className="relative flex aspect-[16/9] items-center justify-center bg-noir">
            <span className="flex size-14 items-center justify-center rounded-full bg-crimson text-white"><Play size={26} /></span>
            <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white">{d.platform}{d.dur ? ` · ${d.dur}` : ""}</span>
          </div>
        ),
      };
    }
    case "article": {
      const d = l.data as ArticleData;
      return {
        href: `/learn/${l.slug}`, type: "Article", who: d.by || d.org || "Learning Hub", Icon: BookIcon,
        tone: "bg-[#2f5b3a] text-white", cta: `Read article${d.read ? ` · ${d.read}` : ""}`,
        flags: d.topic ? <Chip tone="green">{d.topic}</Chip> : null,
        body: <>
          <h3 className="m-0 text-[17px] font-bold leading-snug">{d.title}</h3>
          <p className="m-0 line-clamp-3 text-[14.5px] leading-relaxed text-ink-soft">{d.summary || d.body?.[0]}</p>
        </>,
      };
    }
    default: {
      const d = l.data as NoticeData;
      return {
        href: "/notices", type: d.kind?.replace(/s$/, "") || "Notice", who: d.issuer || "Sabong Sentral", Icon: MegaphoneIcon,
        tone: d.kind === "Official Advisories" ? "bg-crimson text-white" : "bg-gold text-noir", cta: "See notices",
        body: <>
          <h3 className="m-0 text-[17px] font-bold leading-snug">{d.title}</h3>
          <p className="m-0 line-clamp-4 text-[14.5px] leading-relaxed text-ink-soft">{d.text}</p>
          {d.scope && <p className="m-0 text-[12.5px] text-muted">Applies to: {d.scope}</p>}
        </>,
      };
    }
  }
}

export function FeedPost({ item, later = false }: { item: FeedItem; later?: boolean }) {
  const { l, promo } = item;
  const s = shape(l);
  return (
    <article data-kind={l.kind} data-promo={promo ?? undefined} className={`feed-post card overflow-hidden rounded-2xl border bg-cream ${promo === "Sponsored" ? "border-gold" : "border-line"} ${later ? "feed-later hidden" : ""}`}>
      <a href={s.href} className="flex flex-col text-ink no-underline">
        <header className="flex items-center gap-3 px-4 pt-3.5">
          {s.avatar ? <Photo className="size-10 flex-none rounded-full" label="" src={s.avatar} />
            : <span className={`flex size-10 flex-none items-center justify-center rounded-full ${s.tone}`}><s.Icon size={19} /></span>}
          <span className="flex min-w-0 flex-1 flex-col">
            <strong className="truncate text-[15px] leading-tight">{s.who}</strong>
            <span className="flex min-w-0 items-center gap-1 truncate text-[12.5px] text-muted">
              <span className="font-semibold text-ink-soft">{s.type}</span>
              {s.place && <><span aria-hidden="true">·</span><Pin size={11} className="flex-none" /><span className="truncate">{s.place}</span></>}
              <span aria-hidden="true">·</span><span className="flex-none">{ago(l.createdAt)}</span>
            </span>
          </span>
          {promo && <span className={`flex-none rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold tracking-[1px] ${promo === "Sponsored" ? "bg-gold text-noir" : "bg-blush text-wine"}`}>{promo.toUpperCase()}</span>}
        </header>
        <div className="flex flex-col gap-1.5 px-4 pb-3 pt-2.5">
          {(s.flags || l.isSample) && <div className="flex flex-wrap items-center gap-1.5 empty:hidden">{s.flags}{l.isSample && <SampleTag />}</div>}
          {s.body}
        </div>
        {s.media && <div className="overflow-hidden border-y border-line">{s.media}</div>}
        <span className="flex items-center justify-between px-4 py-3 text-[14px] font-semibold text-crimson">{s.cta} <span aria-hidden="true">→</span></span>
      </a>
      {promo === "Sponsored" && <p className="m-0 border-t border-line px-4 py-2 text-[11.5px] text-muted">Sponsored placement. Sabong Sentral does not endorse any farm, seller or sale.</p>}
    </article>
  );
}
