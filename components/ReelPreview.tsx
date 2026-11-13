"use client";

import { useEffect, useRef, useState } from "react";
import { kickYouTube } from "@/lib/embed";
import { Play } from "./icons";

// Reel card preview (Em, 2026-11-13): when a card is mostly on screen, its video
// plays silently in place, like a Facebook or TikTok feed. Only one card plays at
// a time, and nothing plays for people who turned on "reduce motion" or data saver.
// The player ignores taps, so tapping the card still opens the reel page.
const EVT = "sc-reel-active";
let counter = 0;

function canAutoplay() {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !c?.saveData;
}

export function ReelPreview({ src, thumb, label }: { src: string | null; thumb?: string; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [me] = useState(() => ++counter);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!src || !box.current || !canAutoplay()) return;
    const el = box.current;
    const onOther = (e: Event) => { if ((e as CustomEvent<number>).detail !== me) setPlaying(false); };
    window.addEventListener(EVT, onOther);
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.7) {
        window.dispatchEvent(new CustomEvent(EVT, { detail: me }));
        setPlaying(true);
      } else if (e.intersectionRatio < 0.3) setPlaying(false);
    }, { threshold: [0, 0.3, 0.7, 1] });
    io.observe(el);
    return () => { io.disconnect(); window.removeEventListener(EVT, onOther); };
  }, [src, me]);

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden bg-noir-soft">
      {thumb ? <img src={thumb} alt={label} loading="lazy" className="absolute inset-0 size-full object-cover" /> : <div role="img" aria-label={label} className="ph absolute inset-0" />}
      {playing && src && (
        <iframe src={src} title={label} tabIndex={-1} aria-hidden="true" allow="autoplay; encrypted-media; picture-in-picture"
          onLoad={(e) => kickYouTube(e.currentTarget)}
          className="pointer-events-none absolute left-1/2 top-0 h-full aspect-video -translate-x-1/2 border-0" />
      )}
      {!playing && <span className="absolute inset-0 flex items-center justify-center"><span className="flex size-11 items-center justify-center rounded-full bg-black/45 text-white"><Play size={20} /></span></span>}
    </div>
  );
}
