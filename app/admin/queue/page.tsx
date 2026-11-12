import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { QUEUE, titleOf, type Listing, type QueueStatus } from "@/lib/db";
import { TYPES, queueRows } from "@/lib/adminData";
import { one, type Search } from "@/lib/content";
import { Chip, Empty, Page, btnGhost, input, labelCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Review queue" };

const RISKS = ["Permit needed", "Report received", "Possible prohibited content"] as const;
const tone = (q: QueueStatus) => (q === "Approved" ? "green" : q === "Rejected" || q === "Hidden" ? "red" : q === "Needs Changes" || q === "In Review" ? "gold" : "plain") as "green" | "red" | "gold" | "plain";

export default async function AdminHome({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (QUEUE as readonly string[]).includes(one(sp.q)) ? (one(sp.q) as QueueStatus) : one(sp.q) === "All" || one(sp.q) === "Edits" ? (one(sp.q) as "All" | "Edits") : "New";
  const type = TYPES.find((t) => t === one(sp.type));
  const risk = RISKS.find((r) => r === one(sp.risk));
  const who = one(sp.who).toLowerCase(), where = one(sp.where).toLowerCase();
  const rows = await queueRows();
  const tally = (s: string) => rows.filter((r) => (s === "Edits" ? r.edit : r.qs === s)).length;
  const placeOf = (l: Listing) => { const d = l.data as { province?: string; city?: string }; return `${d.city ?? ""} ${d.province ?? ""}`.toLowerCase(); };
  const list = rows.filter((r) => (q === "All" || (q === "Edits" ? r.edit : r.qs === q)) && (!type || r.type === type) && (!risk || r.flags.includes(risk)) &&
    (!who || (r.l.submittedBy ?? "").toLowerCase().includes(who)) && (!where || placeOf(r.l).includes(where)));
  const link = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, type, risk, who: one(sp.who), where: one(sp.where), ...o })) if (v && !(k === "q" && v === "New")) p.set(k, v);
    const s = p.toString();
    return s ? `/admin/queue?${s}` : "/admin/queue";
  };

  return (
    <Page>
      <section className="flex flex-col gap-3">
        <h1 className="m-0 font-serif text-[26px] font-semibold">Review queue{type ? `: ${type}` : ""}</h1>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
          {["New", "Edits", ...QUEUE.slice(1), "All"].map((s) => (
            <a key={s} href={link({ q: s })} aria-current={s === q ? "page" : undefined}
              className={`flex min-h-9 flex-none items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold no-underline ${s === q ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
              {s === "Edits" ? "Edits waiting" : s}{s !== "All" && <span className="opacity-70">{tally(s)}</span>}
            </a>
          ))}
        </div>
        <form method="get" action="/admin/queue" className="grid gap-2 rounded-2xl border border-line bg-cream p-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          {q !== "New" && <input type="hidden" name="q" value={q} />}
          <label className={labelCls}>Type<select name="type" defaultValue={type ?? ""} className={input}><option value="">All types</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label className={labelCls}>Risk<select name="risk" defaultValue={risk ?? ""} className={input}><option value="">Any</option>{RISKS.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label className={labelCls}>Submitter<input name="who" defaultValue={one(sp.who)} className={input} /></label>
          <label className={labelCls}>Province / city<input name="where" defaultValue={one(sp.where)} className={input} /></label>
          <button type="submit" className={btnGhost}>Filter</button>
        </form>
        {list.length === 0 ? <Empty>{q === "New" ? "Nothing waiting for review. 🎉" : "Nothing here."}</Empty> : (
          <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-2xl border border-line bg-cream p-0">
            {list.map(({ l, qs, type: t, flags, edit }) => (
              <li key={l.id}>
                <a href={`/admin/item/${l.id}`} className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-ink no-underline">
                  <Chip tone="plain">{t}</Chip>
                  <span className="min-w-0 flex-1 text-[14.5px] font-semibold">{titleOf(l)}</span>
                  {flags.map((f) => <Chip key={f} tone="red">{f}</Chip>)}
                  {edit && <Chip tone="gold">Edit waiting</Chip>}
                  <Chip tone={tone(qs)}>{qs}</Chip>
                  <span className="w-full text-[12px] text-muted md:w-auto">{l.submittedBy ?? "—"} · {l.createdAt.slice(0, 16)}{l.isSample ? " · sample" : ""}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

    </Page>
  );
}
