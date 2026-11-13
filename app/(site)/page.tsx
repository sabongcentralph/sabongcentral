import { buildFeed } from "@/lib/feed";
import { getLang } from "@/lib/i18n";
import { approved } from "@/lib/db";
import { publicEvents } from "@/lib/content";
import { FeedPost } from "@/components/FeedPost";
import { FeedMore } from "@/components/FeedMore";
import { btnPrimary } from "@/components/ui";
import { LocationFields } from "@/components/LocationFields";
import { Pin } from "@/components/icons";

export const dynamic = "force-dynamic";

const FIRST_POSTS = 12;

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
  // One mixed feed, newest first; Sponsored / Featured placements lead, then one every few posts.
  const feed = buildFeed({ farms, events, goods, reels, articles, notices });

  return (
    <main className="flex flex-col">
      <section className="relative overflow-hidden bg-noir px-5 pb-8 pt-7 text-white md:px-6 md:pb-12 md:pt-12 lg:mx-6 lg:mt-6 lg:rounded-3xl">
        <div aria-hidden="true" className="hero-slash pointer-events-none absolute -right-20 -top-10 h-[150%] w-24 rotate-[24deg] bg-crimson md:-right-24 md:w-56" />
        <div aria-hidden="true" className="hero-slash hero-slash-2 pointer-events-none absolute -right-1 -top-10 h-[150%] w-2 rotate-[24deg] bg-gold md:right-36 md:w-4" />
        <div aria-hidden="true" className="hero-slash pointer-events-none absolute -bottom-14 -left-24 h-24 w-52 rotate-[24deg] bg-gold/90 md:-bottom-16 md:-left-16 md:h-40 md:w-72" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden bg-crimson/40"><div className="hero-streak h-full w-1/2 bg-gradient-to-r from-transparent via-gold to-transparent" /></div>
        <div className="relative mx-auto flex max-w-[900px] flex-col items-center gap-3 text-center">
          <p className="rise m-0 text-[12px] font-bold tracking-[2px] text-gold-light">{tx.kicker}</p>
          <h1 className="rise rise-1 m-0 max-w-[820px] text-balance font-serif text-[27px] font-semibold leading-[1.18] md:text-[44px]">{tx.title}</h1>
          <p className="rise rise-2 m-0 max-w-[640px] text-balance text-[14.5px] leading-relaxed text-white/80 md:text-[16px]">
            A Philippine gamefowl community directory for farms, education, supplies and lawful event information.
          </p>
          <p className="rise rise-3 m-0 rounded-full border border-gold/50 px-3.5 py-1 text-[12px] font-semibold text-gold-light">
            Information only · No bets · No payments · No e-sabong · 21+ · Gamble responsibly
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-4 pb-10 pt-6 md:px-6">
        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-4">
          <h2 className="m-0 flex items-center gap-2 font-serif text-[21px] font-semibold"><Pin size={18} className="text-crimson" /> Near you</h2>
          <p className="m-0 text-[13px] text-muted">Pick a province and city to see farms, events, market listings and suppliers in your area.</p>
          <form action="/search" method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <LocationFields idPrefix="nb" />
            <button type="submit" className={btnPrimary}>Search</button>
          </form>
        </section>

        <section id="feed" aria-label="Latest posts" className="flex flex-col gap-4">
          {feed.length ? feed.map((item, i) => <FeedPost key={item.l.id} item={item} later={i >= FIRST_POSTS} />)
            : <p className="m-0 rounded-2xl border border-dashed border-sand p-8 text-center text-muted">No posts yet. Approved farms, derbies, market items and articles will show here.</p>}
          {feed.length > FIRST_POSTS && <FeedMore />}
        </section>

        <section aria-labelledby="how" className="flex flex-col gap-3">
          <h2 id="how" className="m-0 font-serif text-[22px] font-semibold">How it works</h2>
          <ol className="m-0 grid list-none gap-3 p-0">
            {[
              ["1", "Submit", "Farms, organizers and sellers use their Portal account. Anyone can send an article, reel or announcement through the public form."],
              ["2", "Admin review", "An admin checks every listing and, where needed, business registration or permits. Nothing goes public automatically."],
              ["3", "Public listing", "Approved content appears on the site. Anyone can report a listing that breaks the rules."],
            ].map(([n, t, d]) => (
              <li key={n} className="flex gap-3 rounded-2xl border border-line bg-cream p-4">
                <span className="flex size-9 flex-none items-center justify-center rounded-full bg-noir font-serif text-[17px] font-semibold text-gold-light ring-2 ring-crimson">{n}</span>
                <span className="flex flex-col gap-1"><strong className="text-[15px]">{t}</strong><span className="text-[13.5px] leading-relaxed text-ink-soft">{d}</span></span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col items-start gap-3 relative overflow-hidden rounded-2xl bg-noir p-5 text-white md:flex-row md:p-6 md:items-center md:justify-between">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-crimson" />
          <div>
            <h2 className="m-0 font-serif text-[22px] font-semibold">Have a farm, event or product?</h2>
            <p className="m-0 mt-1 text-[14px] text-white/70">Listing is free. An admin reviews everything before it goes public.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/portal" className="lift rounded-full bg-crimson px-5 py-3 text-[15px] font-semibold text-white no-underline">Go to the Portal</a>
            <a href="/submit" className="rounded-full border border-gold/70 px-5 py-3 text-[15px] font-semibold text-gold-light no-underline">Share an article or reel</a>
          </div>
        </section>
      </div>
    </main>
  );
}

