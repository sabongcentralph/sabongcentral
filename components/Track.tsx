"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Counts one page view per page opened (no cookies, see lib/stats.ts).
// The site it came from (Facebook, Google...) is sent only with the first page of a visit.
export function Track() {
  const path = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (navigator.webdriver) return; // automated browsers
    const body = JSON.stringify({ p: path, r: first.current ? document.referrer : "" });
    first.current = false;
    try {
      if (!navigator.sendBeacon?.("/api/hit", new Blob([body], { type: "text/plain" }))) {
        fetch("/api/hit", { method: "POST", body, keepalive: true }).catch(() => {});
      }
    } catch { /* never break the page */ }
  }, [path]);
  return null;
}
