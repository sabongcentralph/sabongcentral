import { SITE_NAME } from "@/lib/site";
import { t, type Lang } from "@/lib/i18n";
import { Emblem } from "./icons";
import { NavLinks } from "./NavLinks";

export function SiteHeader({ lang, derbies }: { lang: Lang; derbies: boolean }) {
  const links = [
    { href: "/farms", text: t("navFarms", lang) },
    ...(derbies ? [{ href: "/derbies", text: t("navDerbies", lang) }] : []),
    { href: "/videos", text: t("navVideos", lang) },
    { href: "/#paano", text: t("navHow", lang) },
  ];
  const pill = "flex min-h-9 items-center rounded-full px-3 text-[13px] font-semibold no-underline";
  return (
    <header className="border-b-2 border-gold bg-crimson text-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-3.5">
        <a href="/" className="flex items-center gap-2.5 text-white no-underline">
          <Emblem className="text-gold" />
          <span className="font-serif text-[22px] font-semibold tracking-[0.2px]">{SITE_NAME}</span>
        </a>
        <NavLinks links={links} label={t("mainMenu", lang)} />
        <div className="flex flex-wrap items-center gap-3.5">
          <div role="group" aria-label="Wika / Language" className="flex rounded-full border border-white/30 p-[3px]">
            <a href="/lang?to=tl" aria-current={lang === "tl" ? "true" : undefined} className={`${pill} ${lang === "tl" ? "bg-cream text-crimson" : "text-[#f7e9e6]"}`}>
              TL
            </a>
            <a href="/lang?to=en" aria-current={lang === "en" ? "true" : undefined} className={`${pill} ${lang === "en" ? "bg-cream text-crimson" : "text-[#f7e9e6]"}`}>
              EN
            </a>
          </div>
          <a href="/sumali" className="lift rounded-[10px] bg-gold px-[18px] py-3 text-[15px] font-semibold text-[#3a0a0a] no-underline">
            {t("listFarm", lang)}
          </a>
        </div>
      </div>
    </header>
  );
}
