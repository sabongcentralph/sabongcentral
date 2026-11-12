import type { Metadata } from "next";
import { one, type Search } from "@/lib/content";
import { Note, Page, PageHead, btnPrimary, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Report" };

const REASONS = ["Scam / fraud", "Fake identity or impersonation", "Misleading product", "Prohibited item", "Animal cruelty", "Unauthorized event", "Betting or gambling content", "Copyright", "Other"];

export default async function ReportPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const target = one(sp.target), sent = one(sp.sent) === "1", error = one(sp.error) === "1";
  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[620px] flex-col gap-5">
        <PageHead kicker="Report" title="Report to admin" sub="Scams, fake listings, prohibited products or anything that breaks the rules. Your report is confidential." />
        {sent ? (
          <Note tone="green"><strong>Thank you! Your report was received.</strong> An admin will review it. The listing may be hidden while we investigate.</Note>
        ) : (
          <form action="/api/report" method="post" className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-4">
            {error && <Note tone="red">Please fill in the required fields.</Note>}
            <label className={labelCls}>Listing name or page link *<input name="target" required defaultValue={target} placeholder="e.g. Seller: Farm Deals PH, or https://…" className={input} /></label>
            <label className={labelCls}>Reason *
              <select name="reason" required defaultValue={target.startsWith("Scam") ? "Scam / fraud" : ""} className={input}>
                <option value="">Select</option>{REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
            <label className={labelCls}>Details<textarea name="details" rows={5} placeholder="What happened? Dates, amounts, screenshots (describe them)…" className={`${input} py-2.5`} /></label>
            <label className={labelCls}>Your contact (optional)<input name="contact" placeholder="Email or mobile, if you'd like us to follow up" className={input} /></label>
            <p className="m-0 text-[12.5px] leading-relaxed text-muted">Confidential: your report and contact details are seen only by admins. We never tell the person you reported who sent it.</p>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
            <button type="submit" className={btnPrimary}>Submit report</button>
          </form>
        )}
        <Note>If you lost money, also report it to the PNP Anti-Cybercrime Group or the NBI Cybercrime Division.</Note>
      </div>
    </Page>
  );
}
