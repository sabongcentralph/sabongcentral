import { t, type Lang } from "@/lib/i18n";

export function ComingSoon({ lang, title, body, children }: { lang: Lang; title: string; body: string; children?: React.ReactNode }) {
  return (
    <main className="px-6 py-18">
      <div className="rise mx-auto flex max-w-[760px] flex-col items-start gap-4">
        <p className="m-0 text-[13px] font-semibold uppercase tracking-[2px] text-gold-dark">{t("soonTitle", lang)}</p>
        <h1 className="m-0 font-serif text-[clamp(32px,4vw,44px)] font-medium leading-tight">{title}</h1>
        <p className="m-0 text-lg leading-relaxed text-ink-soft">{body}</p>
        {children}
        <a href="/" className="lift mt-2 rounded-[10px] bg-crimson px-5 py-3.5 text-[15px] font-semibold text-white no-underline">
          {t("backHome", lang)}
        </a>
      </div>
    </main>
  );
}
