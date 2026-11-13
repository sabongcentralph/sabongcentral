"use client";

import { useEffect, useState } from "react";
import { kickYouTube } from "@/lib/embed";

// Reel page player: starts playing muted on its own (browsers block autoplay with
// sound), unless the viewer turned on "reduce motion". Tap the player for sound.
export function ReelPlayer({ src, autoSrc, title }: { src: string; autoSrc: string | null; title: string }) {
  const [url, setUrl] = useState(src);
  useEffect(() => {
    if (autoSrc && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setUrl(autoSrc);
  }, [autoSrc]);
  return (
    <iframe key={url} src={url} title={title} className="size-full border-0" onLoad={(e) => kickYouTube(e.currentTarget)}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin" />
  );
}
