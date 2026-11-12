import { ChevronRight, ShieldCheck } from "./icons";

export function Page({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return <main className={`mx-auto flex w-full ${wide ? "max-w-[1200px]" : "max-w-[1200px]"} flex-col gap-6 px-4 pb-10 pt-5 md:px-6 md:pt-8`}>{children}</main>;
}

export function PageHead({ kicker, title, sub, children }: { kicker?: string; title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="rise flex flex-col gap-1.5">
      {kicker && <p className="m-0 text-[12px] font-bold uppercase tracking-[1.5px] text-gold-dark">{kicker}</p>}
      <h1 className="m-0 font-serif text-[28px] font-semibold leading-tight md:text-[38px]">{title}</h1>
      {sub && <p className="m-0 text-[15px] leading-relaxed text-muted">{sub}</p>}
      {children}
    </div>
  );
}

export function SectionHead({ title, href, more = "See all", live }: { title: string; href?: string; more?: string; live?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="m-0 flex items-center gap-2.5 font-serif text-[21px] font-semibold md:text-[24px]"><span aria-hidden="true" className={`h-6 w-1 rounded-full bg-crimson ${live ? "hidden" : ""}`} />{live && <span aria-hidden="true" className="live-dot size-2.5 rounded-full bg-crimson" />}{title}</h2>
      {href && (
        <a href={href} className="flex min-h-10 items-center gap-0.5 text-sm font-semibold text-wine no-underline">
          {more} <ChevronRight size={16} className="arrow" />
        </a>
      )}
    </div>
  );
}

export function BizBadge({ small = false }: { small?: boolean }) {
  return (
    <span className={`inline-flex flex-none items-center gap-1 self-start rounded-full bg-ok-bg font-bold text-ok ${small ? "px-2 py-0.5 text-[10.5px]" : "px-2.5 py-1 text-[12px]"}`}>
      <ShieldCheck size={small ? 12 : 14} /> Business Verified
    </span>
  );
}

export const BIZ_NOTE =
  "Business Verified: Sabong Central has reviewed this account’s business registration documents. Verification does not guarantee the authenticity of products, bloodlines, transactions, or other claims.";

export function SampleTag() {
  return <span className="flex-none rounded-full border border-sand bg-cream px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">Sample</span>;
}

export function Chip({ children, tone = "red" }: { children: React.ReactNode; tone?: "red" | "green" | "gold" | "blue" | "plain" }) {
  const tones = {
    red: "bg-blush text-wine",
    green: "bg-ok-bg text-ok",
    gold: "bg-warn-bg text-warn",
    blue: "bg-info-bg text-info",
    plain: "bg-cream border border-line text-ink-soft",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Note({ children, tone = "gold" }: { children: React.ReactNode; tone?: "gold" | "red" | "green" }) {
  const tones = {
    gold: "bg-note-bg border-gold-light text-ink-soft",
    red: "bg-blush border-red-line text-wine",
    green: "bg-ok-bg border-ok-line text-ok",
  };
  return <div role="note" className={`rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${tones[tone]}`}>{children}</div>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="m-0 rounded-2xl border border-dashed border-sand p-8 text-center text-muted">{children}</p>;
}

export function Photo({ className = "", label = "Photo", src, contain = false }: { className?: string; label?: string; src?: string; contain?: boolean }) {
  if (src && /^\/media\/[a-z]\/[\w-]+\.(webp|jpg|png)$/.test(src)) {
    return <img src={src} alt={label} loading="lazy" className={`block bg-noir-soft ${/(^|\s)(w-|size-)/.test(className) ? "" : "w-full"} ${contain ? "object-contain" : "object-cover"} ${className}`} />;
  }
  return <div role="img" aria-label={label} className={`ph ${className}`} />;
}

// Horizontal scroll row on phones, grid on desktop.
export function Row({ children, cols = 4 }: { children: React.ReactNode; cols?: 4 | 6 }) {
  return (
    <div className={`-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:overflow-visible md:px-0 ${cols === 6 ? "md:grid-cols-6" : "md:grid-cols-4"}`}>
      {children}
    </div>
  );
}

export const input = "field min-h-11 w-full rounded-[10px] border border-sand bg-cream px-3 text-[15px] text-ink";
export const labelCls = "flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft";
export const btnPrimary = "lift inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border-0 bg-crimson px-5 text-[15px] font-semibold text-white no-underline shadow-[0_4px_14px_rgb(232_30_37/0.28)]";
export const btnGhost = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-sand bg-cream px-5 text-[14px] font-semibold text-crimson no-underline";

export const statusTone = (s: string) => (s === "approved" ? "green" : s === "pending" ? "gold" : s === "rejected" ? "red" : "plain") as "green" | "gold" | "red" | "plain";
