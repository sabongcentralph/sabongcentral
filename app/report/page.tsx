import type { Metadata } from "next";
import { one, type Search } from "@/lib/content";
import { Note, Page, PageHead, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Report" };

const REASONS = ["Scam / fraud", "Fake identity o impersonation", "Misleading product", "Prohibited item", "Animal cruelty", "Unauthorized event", "Betting o gambling content", "Copyright", "Iba pa"];

export default async function ReportPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const target = one(sp.target), sent = one(sp.sent) === "1", error = one(sp.error) === "1";
  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[620px] flex-col gap-5">
        <PageHead kicker="Report" title="I-report sa admin" sub="Scam, pekeng listing, bawal na produkto o anumang lumalabag sa rules. Kumpidensyal ang report mo." />
        {sent ? (
          <Note tone="green"><strong>Salamat! Natanggap na ang report.</strong> Ire-review ito ng admin. Pwedeng itago muna ang listing habang sinusuri.</Note>
        ) : (
          <form action="/api/report" method="post" className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-4">
            {error && <Note tone="red">Pakikumpleto ang mga required na field.</Note>}
            <label className={labelCls}>Ano ang nire-report? *<input name="target" required defaultValue={target} placeholder="hal. Seller: Farm Deals PH" className={input} /></label>
            <label className={labelCls}>Dahilan *
              <select name="reason" required defaultValue={target.startsWith("Scam") ? "Scam / fraud" : ""} className={input}>
                <option value="">Piliin</option>{REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
            <label className={labelCls}>Detalye<textarea name="details" rows={5} placeholder="Ano ang nangyari? Petsa, halaga, screenshots (ilarawan)…" className={`${input} py-2.5`} /></label>
            <label className={labelCls}>Contact mo (optional)<input name="contact" placeholder="Email o mobile, kung gusto mong ma-update" className={input} /></label>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
            <button type="submit" className={btnPrimary}>I-submit ang report</button>
          </form>
        )}
        <Note>Kung may nawalang pera, i-report din sa PNP Anti-Cybercrime Group o NBI Cybercrime Division.</Note>
      </div>
    </Page>
  );
}
