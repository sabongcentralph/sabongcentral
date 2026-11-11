import type { Metadata } from "next";
import { approved } from "@/lib/db";
import { one, type Search } from "@/lib/content";
import { SupplierCard } from "@/components/cards";
import { BIZ_NOTE, Empty, Note, Page, PageHead } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Verified Suppliers" };

const KINDS = ["Feed Manufacturers", "Equipment Providers", "Agri Supply Stores"];

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const kind = one((await searchParams).kind);
  const shown = (await approved("supplier")).filter((s) => !kind || s.data.kind === kind);
  return (
    <Page>
      <PageHead kicker="Directory" title="Verified Suppliers" sub="Feed manufacturers, equipment providers and agri supply stores." />
      <nav aria-label="Supplier types" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {["", ...KINDS].map((k) => (
          <a key={k || "all"} href={k ? `/suppliers?kind=${encodeURIComponent(k)}` : "/suppliers"} aria-current={k === kind ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${k === kind ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
            {k || "All"}
          </a>
        ))}
      </nav>
      <Note>{BIZ_NOTE} Deal with suppliers directly; no payments go through Sabong Central.</Note>
      {shown.length === 0 ? <Empty>No suppliers.</Empty> : <div className="grid gap-3 md:grid-cols-2">{shown.map((s) => <SupplierCard key={s.id} s={s} />)}</div>}
    </Page>
  );
}
