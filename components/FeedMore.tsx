"use client";

import { useEffect, useRef, useState } from "react";

// Shows the next posts of the Home feed as the visitor scrolls near the end.
// Posts are already in the page (hidden), so this needs no extra requests.
const STEP = 10;

export function FeedMore() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  const more = () => {
    const next = [...document.querySelectorAll<HTMLElement>(".feed-later.hidden")].slice(0, STEP);
    next.forEach((el) => el.classList.remove("hidden"));
    if (!document.querySelector(".feed-later.hidden")) setDone(true);
  };

  useEffect(() => {
    if (!document.querySelector(".feed-later.hidden")) { setDone(true); return; }
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) more(); }, { rootMargin: "600px 0px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  if (done) return <p className="m-0 py-2 text-center text-[13px] text-muted">You&apos;re all caught up.</p>;
  return (
    <div ref={ref} className="flex justify-center py-2">
      <button type="button" onClick={more} className="min-h-11 cursor-pointer rounded-full border border-sand bg-cream px-5 text-[14px] font-semibold text-crimson">Show more posts</button>
    </div>
  );
}
