import type { Farm } from "@/lib/farms";
import { t, type Lang } from "@/lib/i18n";
import { Camera, Pin, ShieldCheck } from "./icons";

export function FarmCard({ farm, lang, photoHeight = "h-[200px]" }: { farm: Farm; lang: Lang; photoHeight?: string }) {
  return (
    <a
      href={`/farms/${farm.slug}`}
      className="card flex flex-col overflow-hidden rounded-2xl border border-line bg-cream text-ink no-underline"
    >
      <div className="overflow-hidden">
        <div className={`ph ${photoHeight} flex flex-col items-center justify-center gap-1.5 text-[13px] text-muted`}>
          <Camera />
          {t("farmPhoto", lang)}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-lg font-semibold">{farm.name}</h3>
          <ShieldCheck className="flex-none text-crimson" />
          <span className="sr-only">{t("verified", lang)}</span>
          {farm.isSample && (
            <span className="ml-auto rounded-full border border-sand px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              {t("sample", lang)}
            </span>
          )}
        </div>
        <p className="m-0 flex items-center gap-1.5 text-sm text-muted">
          <Pin size={15} />
          {farm.city}, {farm.province}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {farm.bloodlines.map((b) => (
            <span key={b.name} className="rounded-full bg-blush px-2.5 py-1 text-xs font-semibold text-crimson">
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
