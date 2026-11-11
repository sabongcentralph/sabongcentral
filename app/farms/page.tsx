import { getLang, t } from "@/lib/i18n";
import { farmFacets, listFarms } from "@/lib/farms";
import { BATANGAS_CITIES, START_PROVINCE, START_REGION } from "@/lib/locations";
import { FarmCard } from "@/components/FarmCard";

export const dynamic = "force-dynamic";

type Search = { q?: string | string[]; city?: string | string[]; line?: string | string[] };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const many = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]).filter(Boolean);

const label = "text-[13px] font-semibold text-ink-soft";
const input = "field min-h-11 rounded-[10px] border border-sand bg-cream px-3 text-[15px] text-ink";

export default async function FarmsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const lang = await getLang();
  const sp = await searchParams;
  const q = one(sp.q);
  const city = one(sp.city);
  const lines = many(sp.line);
  const [farms, facets] = await Promise.all([listFarms({ q, city, lines }), farmFacets()]);

  return (
    <main className="flex flex-col">
      <section className="border-b border-line bg-cream px-6 pb-6 pt-10">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2">
          <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-muted">
            <a href="/" className="text-wine">Home</a>
            <span aria-hidden="true">/</span>
            <span>{t("navFarms", lang)}</span>
          </nav>
          <h1 className="rise m-0 font-serif text-[40px] font-medium">{t("directoryTitle", lang)}</h1>
          <p className="m-0 text-base text-muted">{t("directorySub", lang)}</p>
        </div>
      </section>

      <section className="px-6 pb-18 pt-8">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-8">
          <form
            action="/farms"
            method="get"
            aria-label={t("filters", lang)}
            className="rise rise-1 flex max-w-full flex-[1_1_240px] flex-col gap-5 rounded-2xl border border-line bg-cream p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-base font-semibold">{t("filters", lang)}</h2>
              <a href="/farms" className="py-2.5 text-sm font-semibold text-wine">{t("reset", lang)}</a>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fq" className={label}>{t("search", lang)}</label>
              <input id="fq" name="q" type="search" defaultValue={q} placeholder={t("farmName", lang)} className={input} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="freg" className={label}>{t("region", lang)}</label>
              <select id="freg" className={input}><option>{START_REGION}</option></select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fprov" className={label}>{t("province", lang)}</label>
              <select id="fprov" className={input}><option>{START_PROVINCE}</option></select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fcity" className={label}>{t("city", lang)}</label>
              <select id="fcity" name="city" defaultValue={city ?? ""} className={input}>
                <option value="">{t("all", lang)}</option>
                {BATANGAS_CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            {facets.bloodlines.length > 0 && (
              <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
                <legend className={`${label} mb-1.5`}>{t("bloodline", lang)}</legend>
                {facets.bloodlines.map((b) => (
                  <label key={b} className="flex min-h-9 cursor-pointer items-center gap-2.5 text-[15px]">
                    <input type="checkbox" name="line" value={b} defaultChecked={lines.includes(b)} className="size-[18px] accent-crimson" />
                    {b}
                  </label>
                ))}
              </fieldset>
            )}
            <button type="submit" className="lift min-h-11 cursor-pointer rounded-[10px] border-0 bg-crimson text-[15px] font-semibold text-white">
              {t("applyFilters", lang)}
            </button>
          </form>

          <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
            <p className="m-0 text-[15px] text-ink-soft">
              <strong>{farms.length}</strong> {t("farmsFound", lang)}
            </p>
            {farms.length === 0 ? (
              <p className="m-0 rounded-2xl border border-dashed border-sand p-8 text-center text-muted">{t("noFarms", lang)}</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
                {farms.map((f, i) => (
                  <div key={f.id} className={`rise rise-${Math.min(i + 1, 4)}`}>
                    <FarmCard farm={f} lang={lang} photoHeight="h-[170px]" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
