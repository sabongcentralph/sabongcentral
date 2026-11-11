import { SITE_NAME } from "@/lib/site";
import { getLang, t, type Lang } from "@/lib/i18n";
import { checkDatabase, checkPhotos, derbyEnabled, type Check } from "@/lib/health";

export const dynamic = "force-dynamic";

function Status({ label, check, lang }: { label: string; check: Check; lang: Lang }) {
  return (
    <li className="flex items-center justify-between gap-4 py-2">
      <span>{label}</span>
      <span className={check.ok ? "text-emerald-700" : "text-red-700"} title={check.detail}>
        {check.ok ? "✓ " + t("ok", lang) : "✗ " + t("failed", lang)}
      </span>
    </li>
  );
}

export default async function Home() {
  const lang = await getLang();
  const other = lang === "tl" ? "en" : "tl";
  const [database, photos] = await Promise.all([checkDatabase(), checkPhotos()]);
  const derbies = derbyEnabled();

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <span className="text-xl font-bold text-red-800">{SITE_NAME}</span>
          <a
            href={`/lang?to=${other}`}
            className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-stone-100"
          >
            {t("switchLang", lang)}
          </a>
        </header>

        <section className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">{t("comingSoon", lang)}</p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{t("tagline", lang)}</h1>
          <p className="text-lg leading-8 text-stone-700">{t("intro", lang)}</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <h2 className="font-semibold">{t("farms", lang)}</h2>
            <p className="mt-1 text-sm text-stone-600">{t("soon", lang)}</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <h2 className="font-semibold">{t("derbies", lang)}</h2>
            <p className="mt-1 text-sm text-stone-600">{derbies ? t("soon", lang) : t("hidden", lang)}</p>
          </div>
        </section>

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold">{t("infoOnlyTitle", lang)}</h2>
          <p className="mt-1 text-sm leading-6 text-stone-700">{t("infoOnlyBody", lang)}</p>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="font-semibold">{t("systemCheck", lang)}</h2>
          <ul className="mt-2 divide-y divide-stone-100 text-sm">
            <Status label={t("database", lang)} check={database} lang={lang} />
            {photos ? (
              <Status label={t("photoStorage", lang)} check={photos} lang={lang} />
            ) : (
              <li className="flex items-center justify-between gap-4 py-2">
                <span>{t("photoStorage", lang)}</span>
                <span className="text-stone-500">{t("notYet", lang)}</span>
              </li>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}
