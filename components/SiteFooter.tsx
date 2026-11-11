import { SITE_NAME } from "@/lib/site";
import { t, type Lang } from "@/lib/i18n";

export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-auto border-t-2 border-gold bg-crimson-dark px-6 py-10 text-[#e8cfcb]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-5 text-sm leading-relaxed">
        <div className="flex max-w-[520px] flex-col gap-1.5">
          <span className="font-serif text-xl text-gold-light">{SITE_NAME}</span>
          <span>{t("footerAbout", lang)}</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="#">{t("aboutUs", lang)}</a>
          <a href="#">{t("reportListing", lang)}</a>
          <a href="#">{t("policies", lang)}</a>
          <a href="#">{t("contactUs", lang)}</a>
        </nav>
      </div>
    </footer>
  );
}
