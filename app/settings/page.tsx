import type { Metadata } from "next";
import { Note, Page, PageHead } from "@/components/ui";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Page>
      <PageHead title="Settings" sub="Visitors don't need an account to browse. These settings apply to this device." />
      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-4">
        <h2 className="m-0 font-serif text-[19px] font-semibold">Language</h2>
        <p className="m-0 text-[14px] text-ink-soft">English. Tagalog is coming soon.</p>
      </section>
      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-4">
        <h2 className="m-0 font-serif text-[19px] font-semibold">Your listings</h2>
        <p className="m-0 text-[14px] text-ink-soft">Farms, event organizers and sellers manage their listings in the <a href="/portal" className="font-semibold text-crimson">Portal</a>.</p>
      </section>
      <Note tone="gold">More settings will appear here once accounts with email sign-in are ready.</Note>
    </Page>
  );
}
