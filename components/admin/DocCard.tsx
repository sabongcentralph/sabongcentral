import { daysToExpiry, docLabel, type Doc } from "@/lib/docs";
import { Chip, btnGhost, btnPrimary, input, labelCls } from "@/components/ui";

const tone = (s: string) => (s === "approved" ? "green" : s === "rejected" ? "red" : "gold") as "green" | "red" | "gold";

export function ExpiryText({ d }: { d: Pick<Doc, "expires" | "status"> }) {
  const left = daysToExpiry(d);
  if (left === null) return <span className="text-muted">No expiry date</span>;
  if (left <= 0) return <span className="font-semibold text-wine">Expired {d.expires}</span>;
  return <span className={left <= 30 ? "font-semibold text-wine" : "text-muted"}>Expires {d.expires}{left <= 30 ? ` (${left} day${left === 1 ? "" : "s"} left)` : ""}</span>;
}

// One document for admins. Photos load only when opened, because every view is logged.
export function AdminDocCard({ d, who, open, next }: { d: Doc; who?: { name: string; email: string; href: string }; open: boolean; next: string }) {
  const left = daysToExpiry(d);
  return (
    <article id={`d${d.id}`} className="flex flex-col gap-2.5 rounded-2xl border border-line bg-cream p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={tone(d.status)}>{docLabel(d.status)}</Chip>
        {d.status === "approved" && left !== null && left <= 30 && <Chip tone="red">{left <= 0 ? "Expired" : "Expiring soon"}</Chip>}
        <span className="text-[12px] text-muted">#{d.id} · uploaded {d.created_at} · {d.keys.length} photo{d.keys.length === 1 ? "" : "s"}</span>
      </div>
      <h3 className="m-0 text-[16px] font-bold">{d.type}</h3>
      {who && <a href={who.href} className="w-fit text-[13.5px] font-semibold text-wine">{who.name || who.email} ›</a>}
      <span className="text-[13px]"><ExpiryText d={d} /></span>
      {d.note && <span className="text-[13px] text-ink-soft">Note: “{d.note}”{d.reviewer ? ` · ${d.reviewer}` : ""}</span>}
      {open ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {d.keys.map((_, i) => <a key={i} href={`/admin/doc/${d.id}/${i}`} target="_blank" rel="noopener"><img src={`/admin/doc/${d.id}/${i}`} alt={`${d.type}, photo ${i + 1}`} className="w-full rounded-lg border border-line bg-black object-contain" /></a>)}
        </div>
      ) : (
        <a href={`${next}${next.includes("?") ? "&" : "?"}open=${d.id}#d${d.id}`} className={`${btnGhost} w-fit`}>Open document (logged)</a>
      )}
      <form action="/api/admin/doc" method="post" className="flex flex-col gap-2">
        <input type="hidden" name="id" value={d.id} /><input type="hidden" name="next" value={next} />
        <label className={labelCls}>Note (required to reject; the member sees it)<input name="note" maxLength={500} className={input} /></label>
        {d.status !== "approved" && (
          <label className="flex items-center gap-2 text-[13.5px] text-ink-soft"><input type="checkbox" name="badge" value="1" defaultChecked className="size-[17px] accent-crimson" /> Also give the Business Verified badge to their live farms and Market items</label>
        )}
        <div className="flex flex-wrap gap-2">
          {d.status !== "approved" && <button name="action" value="approve" className={btnPrimary}>Approve</button>}
          {d.status !== "rejected" && <button name="action" value="reject" className={btnGhost}>Not accepted</button>}
          <button name="action" value="delete" className={`${btnGhost} text-muted`}>Delete photos</button>
        </div>
      </form>
    </article>
  );
}

