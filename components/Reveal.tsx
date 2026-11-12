"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Staggered fade-up as sections and cards scroll into view.
// Only things below the fold are hidden first, so nothing on screen ever blinks.
export function Reveal() {
  const path = usePathname();
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("js-reveal");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    const fold = window.innerHeight;
    const els = [
      ...document.querySelectorAll<HTMLElement>("main section:not(:has(.card))"),
      ...document.querySelectorAll<HTMLElement>("main .card"),
    ];
    for (const el of els) {
      if (el.dataset.reveal !== undefined || el.getBoundingClientRect().top < fold) continue;
      el.dataset.reveal = "";
      if (el.classList.contains("card") && el.parentElement) {
        const i = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
      }
      io.observe(el);
    }
    return () => io.disconnect();
  }, [path]);
  return null;
}
