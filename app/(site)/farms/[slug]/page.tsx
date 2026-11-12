import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { approved, approvedOne } from "@/lib/db";
import { messengerHref, telHref } from "@/lib/links";
import { FarmCard, ReelCard } from "@/components/cards";
import { BIZ_NOTE, BizBadge, Chip, Empty, Note, Page, Photo, SampleTag, btnGhost, btnPrimary } from "@/components/ui";
import { Chat, Flag, Phone, Pin } from "@/components/icons";

export const dynamic = "force-dynamic";

const TABS = ["Overview", "Gallery", "Bloodlines", "Updates"] as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const f = await approvedOne("farm", (await params).slug);
  return { title: f?.data.name ?? "Farm" };
}

export default async function FarmPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { slug } = await params;
  const wanted = (await searchParams).tab;
  const tab = TABS.find((t) => t === wanted) ?? "Overview";
  const farm = await approvedOne("farm", slug);
  if (!farm) notFound();
  const d = farm.data;
  const [farms, reels, notices] = await Promise.all([approved("farm"), approved("reel"), approved("notice")]);
  // Similar farms: same province or a shared bloodline, closest matches first.
  const lines = new Set(d.bloodlines.map((b) => b.name));
  const score = (f: (typeof farms)[number]) => Number(f.data.province === d.province) * 2 + f.data.bloodlines.filter((b) => lines.has(b.name)).length;
  const others = farms.filter((f) => f.id !== farm.id && score(f) > 0).sort((a, b) => score(b) - score(a)).slice(0, 3);
  const myReels = reels.filter((r) => r.data.farmSlug === slug || r.data.farm === d.name);
  const myNotices = notices.filter((n) => n.data.title.startsWith(d.name));
  const msg = d.facebook ? messengerHref(d.facebook) : null;

  return (
    <Page>
      <div className="-mx-4 -mt-5 md:mx-0 md:mt-0">
        <Photo className="h-[170px] md:h-[300px] md:rounded-2xl" label="Cover photo" src={d.cover} />
      </div>
      <div className="-mt-14 flex flex-col gap-2 md:-mt-16 md:px-6">
        {d.profile ? <img src={d.profile} alt="Profile photo" className="block size-[88px] rounded-full border-[3px] border-gold object-cover shadow-[0_0_0_3px_#f6eedf]" /> : <span className="ph block size-[88px] rounded-full border-[3px] border-gold shadow-[0_0_0_3px_#f6eedf]" role="img" aria-label="Profile photo" />}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="m-0 font-serif text-[28px] font-semibold leading-tight md:text-[38px]">{d.name}</h1>
          {farm.isSample && <SampleTag />}
        </div>
        {d.verified && <BizBadge />}
        <p className="m-0 flex items-center gap-1.5 text-[14px] text-muted"><Pin size={15} />{d.city}, {d.province}{d.est ? ` · Est. ${d.est}` : ""}</p>
        {farm.isSample && <Note tone="red">This is a sample listing to show how the site looks. It is not a real farm.</Note>}
        <div className="flex flex-wrap gap-2 pt-1">
          {msg && <a href={msg} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} gap-2`}><Chat size={17} /> Message</a>}
          {d.phone && <a href={telHref(d.phone)} className={`${btnGhost} gap-2`}><Phone size={16} /> {d.phone}</a>}
        </div>
      </div>

      <nav aria-label="Farm sections" className="sticky top-[62px] z-10 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-ivory px-4 md:mx-0 md:px-0">
        {TABS.map((t) => (
          <a key={t} href={`/farms/${slug}${t === "Overview" ? "" : `?tab=${t}`}`} aria-current={t === tab ? "page" : undefined}
            className={`flex min-h-12 flex-none items-center border-b-[3px] px-3 text-[14px] font-semibold no-underline ${t === tab ? "border-crimson text-crimson" : "border-transparent text-muted"}`}>
            {t}
          </a>
        ))}
      </nav>

      {tab === "Overview" && (
        <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
          <section className="flex flex-col gap-3">
            <h2 className="m-0 font-serif text-[22px] font-semibold">About the farm</h2>
            <p className="m-0 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{d.about || "No description yet."}</p>
            <div className="flex flex-wrap gap-1.5">{d.bloodlines.map((b) => <Chip key={b.name}>{b.name}</Chip>)}</div>
          </section>
          <aside className="flex flex-col gap-3">
            <dl className="m-0 flex flex-col divide-y divide-line rounded-2xl border border-line bg-cream px-4 text-[14px]">
              {[["Owner", d.ownerName], ["Location", `${d.city}, ${d.province}`], ["Contact", d.phone], ["Established", d.est], ["Visits", d.visit ?? ""]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 py-2.5"><dt className="text-muted">{k}</dt><dd className="m-0 text-right font-semibold">{v}</dd></div>
              ))}
            </dl>
            <p className="m-0 text-[11.5px] leading-relaxed text-muted">{d.verified ? BIZ_NOTE : "Not Business Verified yet: an admin has not reviewed this farm's business registration."}</p>
            <Note>Sabong Central is a directory only. Talk to the farm directly. No payments go through us.</Note>
          </aside>
        </div>
      )}

      {tab === "Gallery" && (
        <section className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-1.5 md:grid-cols-4 md:gap-3">
            {d.gallery?.length
              ? d.gallery.map((p, i) => <a key={p} href={p}><Photo className="aspect-square rounded-lg" label={`Farm photo ${i + 1}`} src={p} /></a>)
              : Array.from({ length: 8 }, (_, i) => <Photo key={i} className="aspect-square rounded-lg" label={`Farm photo ${i + 1}`} />)}
          </div>
          {!d.gallery?.length && <p className="m-0 text-[13px] text-muted">No farm photos yet.</p>}
        </section>
      )}

      {tab === "Bloodlines" && (
        <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
          {d.bloodlines.map((b) => (
            <li key={b.name} className="flex flex-col gap-1 rounded-2xl border border-line bg-cream p-4">
              <span className="text-[16px] font-bold">{b.name}</span>
              <span className="text-[13px] text-muted">{b.note || "Details from the farm owner."}</span>
            </li>
          ))}
        </ul>
      )}

      {tab === "Updates" && (
        <section className="flex flex-col gap-4">
          {myNotices.map((n) => (
            <article key={n.id} className="rounded-2xl border border-line bg-cream p-4">
              <span className="text-[12px] text-muted">{n.data.meta}</span>
              <h3 className="m-0 mt-1 text-[16px] font-bold">{n.data.title}</h3>
              <p className="m-0 mt-1 text-[14px] text-ink-soft">{n.data.text}</p>
            </article>
          ))}
          {myReels.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{myReels.map((r) => <ReelCard key={r.id} r={r} />)}</div>
          )}
          {myNotices.length === 0 && myReels.length === 0 && <Empty>No updates from this farm yet.</Empty>}
        </section>
      )}

      <a href={`/report?target=${encodeURIComponent("Farm: " + d.name)}`} className="flex min-h-11 items-center gap-1.5 self-start text-[14px] font-semibold text-wine no-underline">
        <Flag size={15} /> Report this farm
      </a>

      {others.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[21px] font-semibold">Similar farms</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{others.map((f) => <FarmCard key={f.id} f={f} />)}</div>
        </section>
      )}
    </Page>
  );
}
