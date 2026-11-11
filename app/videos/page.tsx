import { getLang, t } from "@/lib/i18n";
import { ComingSoon } from "@/components/ComingSoon";
import { Play } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const lang = await getLang();
  return (
    <ComingSoon lang={lang} title={t("videosTitle", lang)} body={t("videosBody", lang)}>
      <div aria-hidden="true" className="my-4 grid w-full grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="ph flex aspect-[9/14] items-center justify-center rounded-2xl">
            <span className="flex size-12 items-center justify-center rounded-full bg-crimson/90 text-cream shadow-[0_0_0_2px_var(--color-gold)]">
              <Play size={20} />
            </span>
          </div>
        ))}
      </div>
    </ComingSoon>
  );
}
