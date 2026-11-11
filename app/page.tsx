import { getLang } from "@/lib/i18n";
import { approved, recent, titleOf } from "@/lib/db";
import { publicEvents } from "@/lib/content";
import { ArticleCard, EventCard, FarmCard, GoodCard, NoticeCard, ReelCard } from "@/components/cards";
import { BizBadge, Chip, Photo, Row, SampleTag, SectionHead, btnPrimary } from "@/components/ui";
import { LocationFields } from "@/components/LocationFields";
import {
  AlertIcon, BagIcon, BookIcon, CalendarIcon, DownloadIcon, FarmIcon, GradIcon, MegaphoneIcon, Pin, ReelIcon, SearchIcon, TruckIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

const TX = {
  tl: { kicker: "MABUHAY, KA-SABONG!", title: "Ang hub mo para sa Gamefarms, Events, Supplies at Poultry Education", ph: "Hanapin ang farms, goods, events, articles…" },
  en: { kicker: "WELCOME!", title: "Your Hub for Gamefarms, Events, Supplies, and Poultry Education", ph: "Search farms, goods, events, articles…" },
};

const kindPath = { farm: "farms", event: "events", good: "goods", reel: "reels", article: "learn", notice: "notices", supplier: "suppliers" } as const;
const kindLabel = { farm: "Farm", event: "Event", good: "Goods", reel: "Reel", article: "Article", notice: "Notice", supplier: "Supplier" } as const;

export default async function Home() {
  const lang = await getLang();
  const tx = TX[lang];
  const [farms, events, goods, reels, articles, notices, latest] = await Promise.all([
    approved("farm"), publicEvents(), approved("good"), approved("reel"), approved("article"), approved("notice"), recent(6),
  ]);
  const spot = farms.find((f) => f.data.verified) ?? farms[0];

  const hero = [
    { href: "/farms", label: "Farms", Icon: FarmIcon },
    { href: "/events", label: "Events", Icon: CalendarIcon },
    { href: "/reels", label: "Reels", Icon: ReelIcon },
    { href: "/goods", label: "Goods", Icon: BagIcon },
    { href: "/learn", label: "Learning Hub", Icon: BookIcon },
  ];
  const quick = [
    { href: "/learn", label: "Articles & Guides", Icon: BookIcon },
    { href: "/events?group=Education+%26+Training", label: "Classes & Training", Icon: GradIcon },
    { href: "/learn?topic=Downloads", label: "Breeder Resources", Icon: DownloadIcon },
    { href: "/suppliers", label: "Verified Suppliers", Icon: TruckIcon },
    { href: "/notices", label: "Community Notices", Icon: MegaphoneIcon },
    { href: "/report?target=Scam+report", label: "Report Scam", Icon: AlertIcon, warn: true },
  ];

  return (
    <main className="flex flex-col">
      <section className="relative overflow-hidden bg-crimson-dark px-4 pb-6 pt-6 text-white md:px-6 md:pb-10 md:pt-12">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(201,162,74,.28),rgba(67,10,16,0)_60%)]" />
        <div className="relative mx-auto flex max-w-[1200px] flex-col gap-4">
          <p className="rise m-0 text-[12px] font-bold tracking-[2px] text-gold-light">{tx.kicker}</p>
          <h1 className="rise rise-1 m-0 max-w-[760px] font-serif text-[26px] font-semibold leading-[1.15] md:text-[46px]">{tx.title}</h1>
          <form action="/search" method="get" role="search" className="rise rise-2 flex max-w-[640px] items-center gap-2 rounded-full bg-cream p-1.5 pl-4">
            <SearchIcon className="flex-none text-muted" />
            <label htmlFor="home-q" className="sr-only">Search</label>
            <input id="home-q" name="q" type="search" placeholder={tx.ph} className="min-h-10 min-w-0 flex-1 border-0 bg-transparent text-[15px] text-ink outline-none" />
            <button type="submit" className="min-h-10 cursor-pointer rounded-full border-0 bg-crimson px-4 text-sm font-semibold text-white">Search</button>
          </form>
          <nav aria-label="Sections" className="rise rise-3 grid max-w-[640px] grid-cols-5 gap-2 pt-1">
            {hero.map(({ href, label, Icon }) => (
              <a key={href} href={href} className="flex flex-col items-center gap-1.5 text-center text-[11.5px] font-semibold leading-tight text-white no-underline">
                <span className="lift flex size-12 items-center justify-center rounded-2xl border border-gold/60 bg-white/10 text-gold-light md:size-14"><Icon size={22} /></span>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 pb-10 pt-6 md:px-6">
        <section aria-label="Quick links" className="grid grid-cols-3 gap-2.5 md:grid-cols-6">
          {quick.map(({ href, label, Icon, warn }) => (
            <a key={label} href={href} className={`card flex min-h-[84px] flex-col items-center justify-center gap-1.5 rounded-2xl border p-2 text-center text-[12px] font-semibold leading-tight no-underline ${warn ? "border-[#e3b7b0] bg-blush text-wine" : "border-line bg-cream text-ink"}`}>
              <Icon size={22} className={warn ? "text-wine" : "text-crimson"} />
              {label}
            </a>
          ))}
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-4">
          <h2 className="m-0 flex items-center gap-2 font-serif text-[21px] font-semibold"><Pin size={18} className="text-crimson" /> Malapit sa&apos;yo</h2>
          <p className="m-0 text-[13px] text-muted">Pumili ng probinsya at lungsod para makita ang farms, events, goods at suppliers sa lugar mo.</p>
          <form action="/search" method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <LocationFields idPrefix="nb" />
            <button type="submit" className={btnPrimary}>Hanapin</button>
          </form>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="Upcoming Events" href="/events" />
          <Row>{events.slice(0, 4).map((e) => <EventCard key={e.id} e={e} compact />)}</Row>
        </section>

        {spot && (
          <section className="flex flex-col gap-3">
            <SectionHead title="Farm Spotlight" />
            <a href={`/farms/${spot.slug}`} className="card overflow-hidden rounded-2xl border-2 border-gold bg-cream text-ink no-underline md:flex">
              <div className="relative overflow-hidden md:w-1/2">
                <Photo className="h-[170px] md:h-full md:min-h-[220px]" label="Farm photo" />
                <span className="absolute left-3 top-3 rounded-md bg-[#e2b43a] px-2 py-1 text-[11px] font-extrabold tracking-[1.2px] text-[#3a0a0a]">FEATURED THIS WEEK</span>
              </div>
              <div className="flex flex-col gap-2 p-4 md:p-6">
                <div className="flex items-center gap-2"><h3 className="m-0 flex-1 font-serif text-[22px] font-semibold">{spot.data.name}</h3>{spot.isSample && <SampleTag />}</div>
                {spot.data.verified && <BizBadge />}
                <span className="text-[13px] text-ink-soft">📍 {spot.data.city}, {spot.data.province}{spot.data.est ? ` · Est. ${spot.data.est}` : ""}</span>
                <p className="m-0 text-[14px] leading-relaxed text-ink-soft">{spot.data.about}</p>
                <div className="flex flex-wrap gap-1">{spot.data.bloodlines.map((b) => <Chip key={b.name}>{b.name}</Chip>)}</div>
                <span className="text-[11px] text-muted">Featured nang libre. Lalagyan ng &quot;Sponsored&quot; kung bayad ito.</span>
              </div>
            </a>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <SectionHead title="Featured Gamefarms" href="/farms" />
          <Row>{farms.slice(0, 4).map((f) => <FarmCard key={f.id} f={f} compact />)}</Row>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="Educational Reels" href="/reels" />
          <Row cols={6}>{reels.slice(0, 6).map((r) => <ReelCard key={r.id} r={r} compact />)}</Row>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="Latest Goods" href="/goods" />
          <Row>{goods.slice(0, 4).map((g) => <GoodCard key={g.id} g={g} compact />)}</Row>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="Recently Added" />
          <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-2xl border border-line bg-cream p-0">
            {latest.map((l) => (
              <li key={l.id}>
                <a href={`/${kindPath[l.kind]}/${l.slug}`} className="flex min-h-12 items-center gap-3 px-4 py-2.5 text-ink no-underline">
                  <Chip tone="plain">{kindLabel[l.kind]}</Chip>
                  <span className="flex-1 text-[14px] font-semibold">{titleOf(l)}</span>
                  <span className="text-[12px] text-muted">{l.isSample ? "Sample" : "Bago"}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="Learning Hub · Latest Articles" href="/learn" />
          <div className="grid gap-3 md:grid-cols-2">{articles.slice(0, 4).map((a) => <ArticleCard key={a.id} a={a} />)}</div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="Community Notices" href="/notices" />
          <div className="grid gap-3 md:grid-cols-3">{notices.slice(0, 3).map((n) => <NoticeCard key={n.id} n={n} />)}</div>
        </section>

        <section className="flex flex-col items-start gap-3 rounded-2xl bg-crimson p-5 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="m-0 font-serif text-[22px] font-semibold">May farm, event o produkto ka?</h2>
            <p className="m-0 mt-1 text-[14px] text-rose">Libre mag-list. Ire-review muna ng admin bago lumabas sa public.</p>
          </div>
          <a href="/portal" className="lift rounded-full bg-gold px-5 py-3 text-[15px] font-semibold text-[#3a0a0a] no-underline">Pumunta sa Portal</a>
        </section>
      </div>
    </main>
  );
}

