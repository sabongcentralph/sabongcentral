import { SITE_NAME } from "@/lib/site";
import { t, type Lang } from "@/lib/i18n";
import { Emblem, SearchIcon, UserIcon } from "./icons";
import { TopNav } from "./TopNav";
import { MenuDrawer } from "./MenuDrawer";
import { SideNav } from "./SideNav";

export function AppHeader({ lang }: { lang: Lang }) {
  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-crimson bg-noir text-white">
      <div className="mx-auto flex max-w-[1400px] items-center gap-1.5 px-2.5 py-2.5 md:gap-6 md:px-6">
        <MenuDrawer><SideNav /></MenuDrawer>
        <a href="/" className="flex min-w-0 lg:flex-none items-center gap-2 text-white no-underline">
          <Emblem className="flex-none text-gold" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="whitespace-nowrap font-serif text-[20px] font-semibold tracking-[0.2px]">{SITE_NAME}</span>
            <span className="truncate text-[10px] text-gold-light sm:text-[11px]">{t("tagline", lang)}</span>
          </span>
        </a>
        <TopNav lang={lang} />
        <div className="ml-auto flex flex-none items-center gap-2">
          <form action="/search" method="get" role="search" className="hidden h-10 items-center gap-2 rounded-full bg-white/12 pl-3.5 pr-1 lg:flex">
            <SearchIcon size={16} className="text-gold-light" />
            <label htmlFor="hdr-q" className="sr-only">Search</label>
            <input id="hdr-q" name="q" type="search" placeholder="Search…" className="w-36 border-0 xl:w-28 2xl:w-44 bg-transparent text-[14px] text-white outline-none placeholder:text-white/60" />
          </form>
          <a href="/search" aria-label="Search" className="flex size-10 items-center justify-center rounded-full text-gold-light no-underline hover:bg-white/10 lg:hidden">
            <SearchIcon size={20} />
          </a>
          <a href="/portal" aria-label={t("portal", lang)} className="flex size-10 items-center justify-center rounded-full border border-gold/70 text-gold-light no-underline transition-colors hover:border-crimson hover:bg-crimson hover:text-white md:w-auto md:gap-2 md:px-3.5">
            <UserIcon size={18} />
            <span className="hidden text-sm font-semibold md:inline">{t("portal", lang)}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
