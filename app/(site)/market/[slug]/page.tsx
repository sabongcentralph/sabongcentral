import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListedBy } from "@/components/ListedBy";
import { approved, approvedOne } from "@/lib/db";
import { telHref } from "@/lib/links";
import { AvailBadge, GoodCard } from "@/components/cards";
import { BIZ_NOTE, BizBadge, Note, Page, Photo, SampleTag } from "@/components/ui";
import { Flag } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = await approvedOne("good", (await params).slug);
  return { title: g?.data.name ?? "Market" };
}

export default async function GoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const g = await approvedOne("good", (await params).slug);
  if (!g) notFound();
  const d = g.data;
  const more = (await approved("good")).filter((x) => x.id !== g.id && x.data.seller === d.seller).slice(0, 4);
  const initials = d.seller.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("");
  return (
    <Page>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="relative -mx-4 -mt-5 md:mx-0 md:mt-0">
          <Photo className="aspect-square md:rounded-2xl" label="Product photo" src={d.photos?.[0]} />
          {(d.photos?.length ?? 0) > 1 && <div className="mt-2 flex gap-2 px-4 md:px-0">{d.photos!.slice(1).map((p) => <a key={p} href={p}><Photo className="size-20 rounded-lg" label="Product photo" src={p} /></a>)}</div>}
          <AvailBadge d={d} className="absolute left-4 top-4 px-2.5 py-1 text-[12px]" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-gold-dark">{d.cat} · {d.sub}</span>
            <div className="flex items-start gap-2"><h1 className="m-0 flex-1 font-serif text-[26px] font-semibold leading-tight md:text-[34px]">{d.name}</h1>{g.isSample && <SampleTag />}</div>
            <span className="text-[26px] font-bold text-crimson">{d.price}</span>
            <span className="text-[12.5px] text-muted">Last updated {new Date(g.updatedAt.replace(" ", "T") + "Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" })}</span>
          </div>
          {(d.condition || d.pickup) && (
            <dl className="m-0 flex flex-col divide-y divide-line rounded-2xl border border-line bg-cream px-4 text-[14px]">
              {d.condition && <div className="flex justify-between gap-4 py-2.5"><dt className="text-muted">Condition</dt><dd className="m-0 text-right font-semibold">{d.condition}</dd></div>}
              {d.pickup && <div className="flex justify-between gap-4 py-2.5"><dt className="flex-none text-muted">Pickup / delivery</dt><dd className="m-0 text-right font-semibold">{d.pickup}</dd></div>}
            </dl>
          )}
          {d.desc && (
            <section className="rounded-2xl border border-line bg-cream p-4">
              <h2 className="m-0 text-[16px] font-bold">Description</h2>
              <p className="m-0 mt-1.5 text-[14px] leading-relaxed text-ink-soft">{d.desc}</p>
            </section>
          )}
          <section className="flex flex-col gap-2.5 rounded-2xl border border-line bg-cream p-4">
            <h2 className="m-0 text-[16px] font-bold">Seller Details</h2>
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="flex size-11 flex-none items-center justify-center rounded-xl bg-crimson text-[13px] font-semibold text-cream">{initials}</span>
              <div className="flex flex-col gap-1">
                <span className="text-[15px] font-bold">{d.seller}</span>
                {d.sellerVerified ? <BizBadge small /> : <span className="text-[12px] text-muted">Email verified seller</span>}
              </div>
            </div>
            <div className="flex justify-between border-t border-line pt-2.5 text-[14px]"><span className="text-muted">Contact number</span><a href={telHref(d.phone)} className="font-semibold text-ink no-underline">{d.phone}</a></div>
            <div className="flex justify-between border-t border-line pt-2.5 text-[14px]"><span className="text-muted">Location</span><span className="font-semibold">{d.city}, {d.province}</span></div>
            {d.sellerVerified && <p className="m-0 text-[11.5px] leading-relaxed text-muted">{BIZ_NOTE}</p>}
            <ListedBy data={d} title={d.name} />
            <a href={`/report?target=${encodeURIComponent("Seller: " + d.seller + " · " + d.name)}`} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-wine bg-blush text-[14px] font-semibold text-wine no-underline">
              <Flag size={15} /> Report Seller
            </a>
          </section>
          <Note tone="red"><strong>Beware of scams.</strong> Even a Business Verified seller is not a guarantee of the item or delivery. Don't pay before you confirm the item.</Note>
          <Note><strong>Contact the seller directly.</strong> Sabong Sentral is not the seller and receives no payment. Pickup or delivery is arranged between you and the seller.</Note>
        </div>
      </div>
      {more.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[21px] font-semibold">More from this seller</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{more.map((x) => <GoodCard key={x.id} g={x} />)}</div>
        </section>
      )}
    </Page>
  );
}
