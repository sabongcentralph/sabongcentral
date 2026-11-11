import { getLang, t } from "@/lib/i18n";
import { listFarms, farmFacets } from "@/lib/farms";
import { BATANGAS_CITIES, START_PROVINCE, START_REGION } from "@/lib/locations";
import { FarmCard } from "@/components/FarmCard";
import { Info, Pin, SearchIcon, ShieldCheck } from "@/components/icons";

export const dynamic = "force-dynamic";

const label = "text-[13px] font-semibold text-ink-soft";
const input = "field min-h-12 rounded-[10px] border border-sand bg-cream px-3.5 text-base text-ink";

export default async function Home() {
  const lang = await getLang();
  const [featured, facets] = await Promise.all([listFarms({ limit: 3 }), farmFacets()]);
  const steps = [
    { n: "01", title: t("how1Title", lang), body: t("how1Body", lang) },
    { n: "02", title: t("how2Title", lang), body: t("how2Body", lang) },
    { n: "03", title: t("how3Title", lang), body: t("how3Body", lang) },
  ];

  return (
    <main className="flex flex-col">
      <section className="bg-crimson px-6 pb-24 pt-14 text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
          <p className="rise m-0 text-[13px] font-semibold uppercase tracking-[2px] text-gold-light">{t("eyebrow", lang)}</p>
          <h1 className="rise rise-1 m-0 max-w-[820px] font-serif text-[clamp(36px,5vw,60px)] font-medium leading-[1.08]">
            {t("heroTitle", lang)}
          </h1>
          <p className="rise rise-2 m-0 max-w-[640px] text-lg leading-relaxed text-rose">{t("heroBody", lang)}</p>
        </div>
      </section>

      <section aria-label={t("searchFarms", lang)} className="px-6">
        <form
          action="/farms"
          method="get"
          className="rise rise-3 mx-auto -mt-16 grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] items-end gap-4 rounded-2xl bg-cream p-6 shadow-[0_18px_40px_rgb(107_15_26/0.16)]"
        >
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="q" className={label}>{t("searchLabel", lang)}</label>
            <input id="q" name="q" type="search" placeholder={t("searchPlaceholder", lang)} className={input} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="region" className={label}>{t("region", lang)}</label>
            <select id="region" className={input} defaultValue={START_REGION}>
              <option>{START_REGION}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="province" className={label}>{t("province", lang)}</label>
            <select id="province" className={input} defaultValue={START_PROVINCE}>
              <option>{START_PROVINCE}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="city" className={label}>{t("city", lang)}</label>
            <select id="city" name="city" className={input} defaultValue="">
              <option value="">{t("all", lang)}</option>
              {BATANGAS_CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="lift flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] border-0 bg-crimson text-base font-semibold text-white">
            <SearchIcon />
            {t("search", lang)} <span className="arrow">→</span>
          </button>
        </form>
        <div className="mx-auto mt-5 flex max-w-[1200px] flex-wrap gap-x-7 gap-y-3 text-sm text-ink-soft">
          <span className="flex items-center gap-2"><ShieldCheck className="text-crimson" />{t("trustApproved", lang)}</span>
          <span className="flex items-center gap-2"><Info className="text-crimson" />{t("trustInfoOnly", lang)}</span>
        </div>
      </section>

      {facets.cities.length > 0 && (
        <section className="rise rise-4 px-6 pt-18">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
            <h2 className="m-0 font-serif text-[30px] font-medium">{t("browseByLocation", lang)}</h2>
            <div className="flex flex-wrap gap-2.5">
              {facets.cities.map((c) => (
                <a
                  key={c}
                  href={`/farms?city=${encodeURIComponent(c)}`}
                  className="flex min-h-11 items-center gap-2 rounded-full border border-sand bg-cream px-[18px] text-[15px] font-medium text-ink no-underline transition-colors hover:border-crimson hover:bg-blush hover:text-crimson"
                >
                  <Pin className="text-wine" />
                  {c}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="px-6 pt-18">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <h2 className="m-0 font-serif text-[30px] font-medium">{t("featuredFarms", lang)}</h2>
                <p className="m-0 text-base text-muted">{t("featuredSub", lang)}</p>
              </div>
              <a href="/farms" className="py-3 text-[15px] font-semibold text-wine hover:text-crimson">
                {t("viewAllFarms", lang)} <span className="arrow">→</span>
              </a>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
              {featured.map((f) => (
                <FarmCard key={f.id} farm={f} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="paano" className="scroll-mt-6 px-6 pt-18">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-7">
          <h2 className="m-0 font-serif text-[30px] font-medium">{t("howTitle", lang)}</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col gap-2.5">
                <span className="font-serif text-[40px] text-gold-dark">{s.n}</span>
                <h3 className="m-0 text-lg font-semibold">{s.title}</h3>
                <p className="m-0 text-[15px] leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-18">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6 rounded-[20px] border border-gold/60 bg-crimson px-10 py-12 text-white">
          <div className="flex flex-[1_1_420px] flex-col gap-2.5">
            <h2 className="m-0 font-serif text-[32px] font-medium">{t("ctaTitle", lang)}</h2>
            <p className="m-0 text-[17px] leading-relaxed text-rose">{t("ctaBody", lang)}</p>
          </div>
          <a href="/sumali" className="lift rounded-xl bg-gold px-[26px] py-4 text-base font-semibold text-[#3a0a0a] no-underline">
            {t("ctaButton", lang)} <span className="arrow">→</span>
          </a>
        </div>
      </section>
    </main>
  );
}
