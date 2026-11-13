import type { Metadata } from "next";
import { shuffled } from "@/lib/feed";
import { approved } from "@/lib/db";
import { one, type Search } from "@/lib/content";
import { SupplierCard } from "@/components/cards";
import { BIZ_NOTE, Empty, Note, Page, PageHead } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Verified Suppliers" };

const KINDS = ["Feed Manufacturers", "Equipment Providers", "Agricultural Supply Stores"];

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const kind = one((await searchParams).kind);
  const list = await approved("supplier");
  const shown = kind ? list.filter((s) => s.data.kind === kind) : shuffled(list); // shuffled unless filtered (Em, 2026-11-13)
  return (
    <Page>
      <PageHead kicker="Directory" title="Verified Suppliers" sub="Feed manufacturers, equipment providers and agricultural supply stores." />
      <nav aria-label="Supplier types" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {["", ...KINDS].map((k) => (
          <a key={k || "all"} href={k ? `/suppliers?kind=${encodeURIComponent(k)}` : "/suppliers"} aria-current={k === kind ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${k === kind ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {k || "All"}
          </a>
        ))}
      </nav>
      <Note>{BIZ_NOTE} Deal with suppliers directly; no payments go through Sabong Sentral.</Note>
      {shown.length === 0 ? <Empty>No suppliers.</Empty> : (kind ? [kind] : KINDS).map((k) => {
        const list = shown.filter((s) => s.data.kind === k);
        return list.length === 0 ? null : (
          <section key={k} className="flex flex-col gap-3">
            <h2 className="m-0 font-serif text-[20px] font-semibold">{k}</h2>
            <div className="grid gap-3 md:grid-cols-2">{list.map((s) => <SupplierCard key={s.id} s={s} />)}</div>
          </section>
        );
      })}
      <p className="m-0 text-[13px] text-muted">Suppliers sign up through the <a href="/portal" className="font-semibold text-wine">Portal</a> with the same checks as Market sellers.</p>
    </Page>
  );
}
