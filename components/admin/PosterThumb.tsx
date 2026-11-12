// Event poster thumbnail. Shows the uploaded poster when there is one (photo
// upload comes with R2); until then a poster-style title card.
const TONES: Record<string, string> = {
  "Derbies & Events": "from-[#7a0f1a] via-[#3a0a0f] to-[#0e0808] text-white",
  "Education & Training": "from-[#123a6b] via-[#0d2240] to-[#070d18] text-white",
  "Expos & Community": "from-[#8a6417] via-[#4a320a] to-[#140d04] text-[#ffe7a8]",
};

export function PosterThumb({ title, group, poster, className = "" }: { title: string; group?: string; poster?: string; className?: string }) {
  const box = `relative flex h-[60px] w-[104px] flex-none overflow-hidden rounded-lg border border-white/10 md:h-[68px] md:w-[120px] ${className}`;
  if (poster && /^https:\/\//.test(poster)) {
    return <span className={box}><img src={poster} alt="" loading="lazy" className="size-full object-cover" /></span>;
  }
  const words = title.replace(/[^\p{L}\p{N}\s&-]/gu, "").split(/\s+/).filter(Boolean);
  const text = words.slice(0, 5).join(" ");
  return (
    <span aria-hidden="true" className={`${box} items-center justify-center bg-gradient-to-br px-1.5 text-center ${TONES[group ?? ""] ?? TONES["Derbies & Events"]}`}>
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgb(255_255_255/0.18),transparent_55%)]" />
      <span className="relative line-clamp-3 font-serif text-[11.5px] font-bold uppercase leading-[1.05] tracking-tight [text-shadow:0_1px_2px_rgb(0_0_0/0.6)] md:text-[12.5px]">{text}</span>
      <span className="absolute inset-x-0 bottom-0 h-[3px] bg-gold" />
    </span>
  );
}
