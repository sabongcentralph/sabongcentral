import { SITE_NAME } from "@/lib/site";
import { t, type Lang } from "@/lib/i18n";
import { Emblem, UserIcon } from "./icons";
import { TopNav } from "./TopNav";

export function AppHeader({ lang }: { lang: Lang }) {
  const pill = "flex min-h-8 items-center rounded-full px-2.5 text-[12px] font-semibold no-underline";
  return (
    <header className="sticky top-0 z-30 border-b-2 border-gold bg-crimson text-white">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-2.5 md:gap-8 md:px-6">
        <a href="/" className="flex min-w-0 items-center gap-2 text-white no-underline">
          <Emblem className="flex-none text-gold" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="font-serif text-[20px] font-semibold tracking-[0.2px]">{SITE_NAME}</span>
            <span className="truncate text-[11px] text-gold-light">{t("tagline", lang)}</span>
          </span>
        </a>
        <TopNav lang={lang} />
        <div className="ml-auto flex flex-none items-center gap-2">
          <div role="group" aria-label="Wika / Language" className="flex rounded-full border border-white/30 p-[2px]">
            <a href="/lang?to=tl" aria-current={lang === "tl" ? "true" : undefined} className={`${pill} ${lang === "tl" ? "bg-cream text-crimson" : "text-[#f7e9e6]"}`}>TL</a>
            <a href="/lang?to=en" aria-current={lang === "en" ? "true" : undefined} className={`${pill} ${lang === "en" ? "bg-cream text-crimson" : "text-[#f7e9e6]"}`}>EN</a>
          </div>
          <a href="/portal" aria-label={t("portal", lang)} className="flex size-10 items-center justify-center rounded-full border border-gold/70 text-gold-light no-underline md:w-auto md:gap-2 md:px-3.5">
            <UserIcon size={18} />
            <span className="hidden text-sm font-semibold md:inline">{t("portal", lang)}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
