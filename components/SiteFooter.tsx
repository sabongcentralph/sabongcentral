import { SITE_NAME, CONTACT_EMAIL, FB_PAGE } from "@/lib/site";
import { t, type Lang } from "@/lib/i18n";

const LINKS = [
  ["/legal/about", "About"],
  ["/legal/terms", "Terms of Use"],
  ["/legal/privacy", "Privacy Notice"],
  ["/legal/disclaimer", "Legal Disclaimer"],
  ["/legal/market", "Marketplace Notice"],
  ["/legal/rules", "Portal Rules"],
  ["/legal/responsible-gaming", "Responsible Gaming"],
  ["/legal/faq", "FAQ"],
  ["/contact", "Contact Us"],
  ["/report", "Report Scam"],
] as const;

export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-auto border-t-2 border-gold bg-crimson-dark px-4 pb-24 pt-9 text-[#e8cfcb] md:px-6 lg:pb-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 text-sm leading-relaxed md:flex-row md:justify-between">
        <div className="flex max-w-[460px] flex-col gap-1.5">
          <span className="font-serif text-xl text-gold-light">{SITE_NAME}</span>
          <span>{t("footerAbout", lang)}</span>
          <span className="text-[13px] text-[#cfb3ae]">
            {CONTACT_EMAIL} · Facebook: {FB_PAGE} · Manila, Philippines
          </span>
          <span className="text-[12px] font-semibold text-gold-light">21+ only · Gamble responsibly · We never take bets</span>
          <span className="text-[12px] text-[#b89a95]">Problem with gambling? National Problem Gambling Helpline (PAGCOR): <a href="tel:0282489568" className="text-[#f1dcd8]">(02) 8248-9568</a>, 24/7</span>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
          {LINKS.map(([href, text]) => (
            <a key={href} href={href} className="py-1.5 text-[#f1dcd8] no-underline hover:text-gold-light">
              {text}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
