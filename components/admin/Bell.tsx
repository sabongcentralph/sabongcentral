import { BellIcon } from "../icons";
import type { alertsOf } from "@/lib/adminData";

type Alert = ReturnType<typeof alertsOf>[number];
type Log = { id: number; action: string; target: string; created_at: string };

// Bell with a short list of what needs the admin. Only non-zero items show,
// plus the last few actions, so it stays calm.
export function Bell({ alerts, log }: { alerts: Alert[]; log: Log[] }) {
  const total = alerts.reduce((a, b) => a + b.n, 0);
  return (
    <details className="bell relative">
      <summary aria-label={total ? `${total} things need your review` : "Notifications"}
        className="relative flex size-11 cursor-pointer list-none items-center justify-center rounded-full text-ink hover:bg-white/10">
        <BellIcon size={23} />
        {total > 0 && <span className="absolute right-1 top-1 min-w-5 rounded-full bg-crimson px-1 text-center text-[10.5px] font-bold leading-5 text-white ring-2 ring-ivory">{total > 99 ? "99+" : total}</span>}
      </summary>
      <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-line bg-cream shadow-[0_18px_50px_rgb(0_0_0/0.55)]">
        <div className="border-b border-line px-4 py-3 text-[14px] font-bold">Needs your attention</div>
        {alerts.length === 0 ? (
          <p className="m-0 px-4 py-4 text-[13.5px] text-muted">All caught up. Nothing to review right now.</p>
        ) : (
          <ul className="m-0 list-none p-1.5">
            {alerts.map((a) => (
              <li key={a.label}>
                <a href={a.href} className="flex min-h-11 items-center gap-3 rounded-xl px-2.5 text-[14px] text-ink no-underline hover:bg-white/5">
                  <span className={`min-w-7 rounded-full px-1.5 text-center text-[12.5px] font-bold leading-7 ${a.tone === "red" ? "bg-crimson text-white" : "bg-gold text-[#2a1d05]"}`}>{a.n}</span>
                  <span className="flex-1">{a.label}</span>
                  <span className="text-muted">›</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        {log.length > 0 && (
          <div className="border-t border-line px-4 py-3">
            <div className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-muted">Recent actions</div>
            <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[12.5px] text-ink-soft">
              {log.slice(0, 3).map((l) => <li key={l.id} className="truncate"><strong className="text-ink">{l.action}</strong> · {l.target}</li>)}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}
