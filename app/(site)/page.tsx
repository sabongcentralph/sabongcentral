import { placementLabel, spotlightOf, withFeaturedFirst } from "@/lib/placements";
import { getLang } from "@/lib/i18n";
import { approved } from "@/lib/db";
import { publicEvents } from "@/lib/content";
import { ArticleCard, EventCard, FarmCard, GoodCard, NoticeCard, ReelCard } from "@/components/cards";
import { BizBadge, Chip, Photo, Row, SampleTag, SectionHead, btnPrimary } from "@/components/ui";
import { LocationFields } from "@/components/LocationFields";
import { Pin } from "@/components/icons";

export const dynamic = "force-dynamic";

const TX = {
  tl: { kicker: "WELCOME!", title: "Your Hub for Gamefarms, Events, Supplies, and Education", ph: "Search farms, events, market, articles…" },
  en: { kicker: "WELCOME!", title: "Your Hub for Gamefarms, Events, Supplies, and Education", ph: "Search farms, events, market, articles…" },
};


export default async function Home() {
  const lang = await getLang();
  const tx = TX[lang];
  const [farms, events, goods, reels, articles, notices] = await Promise.all([
    approved("farm"), publicEvents(), approved("good"), approved("reel"), approved("article"), approved("notice"),
  ]);
  // Admin picks first: the Spotlight farm, then Featured farms; otherwise verified, then newest.
  const spot = spotlightOf(farms);
  const featured = withFeaturedFirst(farms);

  const derbies = events.filter((e) => e.data.derby);
  const classes = events.filter((e) => !e.data.derby);

  return (
    <main className="flex flex-col">
      <section className="relative overflow-hidden bg-crimson-dark px-5 pb-8 pt-7 text-white md:px-6 md:pb-12 md:pt-12 lg:mx-6 lg:mt-6 lg:rounded-3xl">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(201,162,74,.28),rgba(67,10,16,0)_60%)]" />
        <div className="relative mx-auto flex max-w-[900px] flex-col items-center gap-3 text-center">
          <p className="rise m-0 text-[12px] font-bold tracking-[2px] text-gold-light">{tx.kicker}</p>
          <h1 className="rise rise-1 m-0 max-w-[820px] text-balance font-serif text-[27px] font-semibold leading-[1.18] md:text-[44px]">{tx.title}</h1>
          <p className="rise rise-2 m-0 max-w-[640px] text-balance text-[14.5px] leading-relaxed text-[#f1dcd8] md:text-[16px]">
            A Philippine gamefowl community directory for farms, education, supplies and lawful event information.
          </p>
          <p className="rise rise-3 m-0 rounded-full border border-gold/50 px-3.5 py-1 text-[12px] font-semibold text-gold-light">
            Information only · No bets · No payments · No e-sabong · 21+ · Gamble responsibly
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 pb-10 pt-6 md:px-6">
        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-4">
          <h2 className="m-0 flex items-center gap-2 font-serif text-[21px] font-semibold"><Pin size={18} className="text-crimson" /> Near you</h2>
          <p className="m-0 text-[13px] text-muted">Pick a province and city to see farms, events, market listings and suppliers in your area.</p>
          <form action="/search" method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <LocationFields idPrefix="nb" />
            <button type="submit" className={btnPrimary}>Search</button>
          </form>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="Upcoming Derbies" href="/events" />
          {derbies.length ? <Row>{derbies.slice(0, 4).map((e) => <EventCard key={e.id} e={e} compact />)}</Row> : <p className="m-0 text-[14px] text-muted">No derbies scheduled yet.</p>}
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="Seminars, Training & Expos" href="/education" />
          <Row>{classes.slice(0, 4).map((e) => <EventCard key={e.id} e={e} compact />)}</Row>
        </section>

        {spot && (
          <section className="flex flex-col gap-3">
            <SectionHead title="Farm Spotlight" />
            <a href={`/farms/${spot.slug}`} className="card overflow-hidden rounded-2xl border-2 border-gold bg-cream text-ink no-underline md:flex">
              <div className="relative overflow-hidden md:w-1/2">
                <Photo className="h-[170px] md:h-full md:min-h-[220px]" label="Farm photo" src={spot.data.cover ?? spot.data.gallery?.[0] ?? spot.data.profile} />
                <span className="absolute left-3 top-3 rounded-md bg-[#e2b43a] px-2 py-1 text-[11px] font-extrabold tracking-[1.2px] text-[#3a0a0a]">{spot.data.sponsored ? "SPONSORED" : "FEATURED THIS WEEK"}</span>
              </div>
              <div className="flex flex-col gap-2 p-4 md:p-6">
                <div className="flex items-center gap-2"><h3 className="m-0 flex-1 font-serif text-[22px] font-semibold">{spot.data.name}</h3>{spot.isSample && <SampleTag />}</div>
                {spot.data.verified && <BizBadge />}
                <span className="text-[13px] text-ink-soft">📍 {spot.data.city}, {spot.data.province}{spot.data.est ? ` · Est. ${spot.data.est}` : ""}</span>
                <p className="m-0 text-[14px] leading-relaxed text-ink-soft">{spot.data.about}</p>
                <div className="flex flex-wrap gap-1">{spot.data.bloodlines.map((b) => <Chip key={b.name}>{b.name}</Chip>)}</div>
                <span className="text-[11px] text-muted">{spot.data.sponsored ? "Sponsored placement. Sabong Central does not endorse any farm or sale." : <>Featured for free. Paid features will be labeled &quot;Sponsored&quot;.</>}</span>
              </div>
            </a>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <SectionHead title="Featured Gamefarms" href="/farms" />
          <Row>{featured.slice(0, 4).map((f) => <FarmCard key={f.id} f={f} compact tag={f.data.featured ? placementLabel(f) : undefined} />)}</Row>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="Educational Reels" href="/reels" />
          <Row cols={6}>{reels.slice(0, 6).map((r) => <ReelCard key={r.id} r={r} compact />)}</Row>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="Latest in the Market" href="/market" />
          <Row>{goods.slice(0, 4).map((g) => <GoodCard key={g.id} g={g} compact />)}</Row>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="Learning Hub · Latest Articles" href="/learn" />
          <div className="grid gap-3 md:grid-cols-2">{articles.slice(0, 4).map((a) => <ArticleCard key={a.id} a={a} />)}</div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHead title="Advisories & Community Notices" href="/notices" />
          <div className="grid gap-3 md:grid-cols-3">{notices.slice(0, 3).map((n) => <NoticeCard key={n.id} n={n} />)}</div>
        </section>

        <section aria-labelledby="how" className="flex flex-col gap-3">
          <h2 id="how" className="m-0 font-serif text-[22px] font-semibold">How it works</h2>
          <ol className="m-0 grid list-none gap-3 p-0 md:grid-cols-3">
            {[
              ["1", "Submit", "Farms, organizers and sellers use their Portal account. Anyone can send an article, reel or announcement through the public form."],
              ["2", "Admin review", "An admin checks every listing and, where needed, business registration or permits. Nothing goes public automatically."],
              ["3", "Public listing", "Approved content appears on the site. Anyone can report a listing that breaks the rules."],
            ].map(([n, t, d]) => (
              <li key={n} className="flex gap-3 rounded-2xl border border-line bg-cream p-4">
                <span className="flex size-9 flex-none items-center justify-center rounded-full bg-crimson font-serif text-[17px] font-semibold text-gold-light">{n}</span>
                <span className="flex flex-col gap-1"><strong className="text-[15px]">{t}</strong><span className="text-[13.5px] leading-relaxed text-ink-soft">{d}</span></span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col items-start gap-3 rounded-2xl bg-crimson p-5 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="m-0 font-serif text-[22px] font-semibold">Have a farm, event or product?</h2>
            <p className="m-0 mt-1 text-[14px] text-rose">Listing is free. An admin reviews everything before it goes public.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/portal" className="lift rounded-full bg-gold px-5 py-3 text-[15px] font-semibold text-[#3a0a0a] no-underline">Go to the Portal</a>
            <a href="/submit" className="rounded-full border border-gold/70 px-5 py-3 text-[15px] font-semibold text-gold-light no-underline">Share an article or reel</a>
          </div>
        </section>
      </div>
    </main>
  );
}

