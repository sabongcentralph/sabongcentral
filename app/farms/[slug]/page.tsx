import { notFound } from "next/navigation";
import { getLang, t } from "@/lib/i18n";
import { getFarm, listFarms } from "@/lib/farms";
import { Camera, Chat, Flag, Info, Phone, Pin, ShieldCheck } from "@/components/icons";

export const dynamic = "force-dynamic";

function telHref(phone: string) {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

function safeFacebook(url: string): string | null {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return /(^|\.)(facebook\.com|fb\.com|m\.me)$/.test(u.hostname) ? u.toString() : null;
  } catch {
    return null;
  }
}

export default async function FarmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const farm = await getFarm(slug);
  if (!farm) notFound();
  const others = (await listFarms({ limit: 4 })).filter((f) => f.id !== farm.id).slice(0, 3);
  const fb = farm.facebook ? safeFacebook(farm.facebook) : null;
  const since = new Date(farm.createdAt.replace(" ", "T") + "Z").toLocaleDateString("en-PH", {
    month: "short",
    year: "numeric",
  });

  return (
    <main className="px-6 pb-18 pt-7">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted">
          <a href="/" className="text-wine">Home</a>
          <span aria-hidden="true">/</span>
          <a href="/farms" className="text-wine">{t("navFarms", lang)}</a>
          <span aria-hidden="true">/</span>
          <span>{farm.name}</span>
        </nav>

        {farm.isSample && (
          <p role="note" className="m-0 flex items-start gap-2.5 rounded-xl bg-blush px-4 py-3.5 text-sm text-crimson-dark">
            <Info className="mt-0.5 flex-none" />
            {t("sampleNotice", lang)}
          </p>
        )}

        <div className="rise flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 font-serif text-[44px] font-medium leading-[1.1]">{farm.name}</h1>
            <span className="flex items-center gap-1.5 rounded-full border border-gold/70 bg-blush px-3 py-1.5 text-[13px] font-semibold text-crimson">
              <ShieldCheck size={16} />
              {t("adminVerified", lang)}
            </span>
          </div>
          <p className="m-0 flex items-center gap-1.5 text-base text-muted">
            <Pin size={17} />
            {[farm.barangay, farm.city, farm.province].filter(Boolean).join(", ")}
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-8">
          <div className="rise rise-1 flex min-w-0 flex-[999_1_600px] flex-col gap-8">
            <div className="ph flex h-[440px] max-h-[60vw] flex-col items-center justify-center gap-2 rounded-2xl text-[15px] text-muted">
              <Camera size={36} />
              {t("farmPhoto", lang)}
            </div>

            {farm.about && (
              <section className="flex flex-col gap-3">
                <h2 className="m-0 font-serif text-[28px] font-medium">{t("aboutFarm", lang)}</h2>
                <p className="m-0 whitespace-pre-line text-base leading-[1.7] text-ink-soft">{farm.about}</p>
              </section>
            )}

            {farm.bloodlines.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="m-0 font-serif text-[28px] font-medium">{t("bloodlines", lang)}</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                  {farm.bloodlines.map((b) => (
                    <div key={b.name} className="flex flex-col gap-1 rounded-[14px] border border-line bg-cream p-[18px]">
                      <span className="text-[17px] font-semibold">{b.name}</span>
                      {b.note && <span className="text-sm text-muted">{b.note}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside aria-label={t("contactFarm", lang)} className="rise rise-2 flex flex-[1_1_300px] flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-6">
              <h2 className="m-0 text-lg font-semibold">{t("contactFarm", lang)}</h2>
              {farm.ownerName && (
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] text-muted">{t("owner", lang)}</span>
                  <span className="text-base font-medium">{farm.ownerName}</span>
                </div>
              )}
              {farm.phone && (
                <a href={telHref(farm.phone)} className="lift flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-crimson text-base font-semibold text-white no-underline">
                  <Phone />
                  {t("call", lang)}
                </a>
              )}
              {fb && (
                <a href={fb} target="_blank" rel="noopener noreferrer nofollow" className="flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-crimson text-base font-semibold text-crimson no-underline transition-colors hover:bg-blush">
                  <Chat />
                  {t("messageFb", lang)}
                </a>
              )}
              <p className="m-0 text-[13px] leading-normal text-muted">{t("directoryOnly", lang)}</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-cream">
              <div className="ph flex h-[180px] items-center justify-center text-sm text-muted">{t("locationMap", lang)}</div>
              <dl className="m-0 flex flex-col gap-2.5 px-6 py-[18px] text-sm">
                {[
                  [t("region", lang), farm.region],
                  [t("province", lang), farm.province],
                  [t("city", lang), farm.city],
                  [t("memberSince", lang), since],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-muted">{k}</dt>
                    <dd className="m-0 text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <a href="#" className="flex items-center gap-2 px-1 py-2 text-sm font-medium text-muted">
              <Flag />
              {t("reportThis", lang)}
            </a>
          </aside>
        </div>

        {others.length > 0 && (
          <section className="flex flex-col gap-4 pt-6">
            <h2 className="m-0 font-serif text-[28px] font-medium">{t("otherFarms", lang)}</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
              {others.map((o) => (
                <a key={o.id} href={`/farms/${o.slug}`} className="card flex items-center gap-3.5 rounded-[14px] border border-line bg-cream p-3.5 text-ink no-underline">
                  <div className="overflow-hidden rounded-[10px]"><div className="ph size-[72px]" /></div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{o.name}</span>
                    <span className="text-sm text-muted">{o.city}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
