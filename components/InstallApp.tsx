"use client";

import { useEffect, useState } from "react";

// "Add to Home Screen" help (Em, 2026-11-13). InstallButton shows Android's own
// install button when the browser offers one; InstallPrompt is a small card on
// phones that points to /app. Neither shows once the site runs as the app.

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let deferred: BIP | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e as BIP; listeners.forEach((f) => f()); });
}

function standalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}
function platform(): "ios" | "android" | "other" {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}
function useDeferred() {
  const [, set] = useState(0);
  useEffect(() => { const f = () => set((n) => n + 1); listeners.add(f); return () => { listeners.delete(f); }; }, []);
  return deferred;
}
async function install() {
  if (!deferred) return;
  await deferred.prompt();
  await deferred.userChoice.catch(() => null);
  deferred = null; listeners.forEach((f) => f());
}

export function InstallButton() {
  const d = useDeferred();
  const [installed, setInstalled] = useState(false);
  useEffect(() => setInstalled(standalone()), []);
  if (installed) return <p className="m-0 rounded-xl bg-[#e7f3ea] px-4 py-3 text-[14px] font-semibold text-[#2f5b3a]">You're using the Sabong Sentral app. ✓</p>;
  if (!d) return null;
  return <button type="button" onClick={install} className="min-h-12 w-fit rounded-full bg-crimson px-6 text-[15px] font-bold text-white">Install the app</button>;
}

const KEY = "sc_install_dismissed";

export function InstallPrompt() {
  const d = useDeferred();
  const [show, setShow] = useState(false);
  const [os, setOs] = useState<"ios" | "android" | "other">("other");
  useEffect(() => {
    let dismissed = false;
    try { dismissed = !!localStorage.getItem(KEY); } catch {}
    const p = platform();
    if (dismissed || standalone() || p === "other" || location.pathname === "/app") return;
    setOs(p);
    const t = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  const close = () => { setShow(false); try { localStorage.setItem(KEY, "1"); } catch {} };
  return (
    <div role="dialog" aria-label="Add Sabong Sentral to your Home Screen"
      className="fixed inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom))] z-40 flex items-center gap-3 rounded-2xl border border-gold/40 bg-noir p-3 text-white shadow-xl lg:hidden">
      <img src="/icons/icon-192.png" alt="" width={44} height={44} className="size-11 flex-none rounded-xl" />
      <div className="flex min-w-0 flex-1 flex-col">
        <strong className="text-[14px] leading-tight">Get the Sabong Sentral app</strong>
        <span className="text-[12.5px] leading-snug text-white/75">
          {os === "ios" ? <>Tap Share <span aria-hidden="true">⬆︎</span> then “Add to Home Screen”.</> : "Add it to your Home Screen. It's free."}
        </span>
      </div>
      {os === "android" && d
        ? <button type="button" onClick={async () => { await install(); close(); }} className="min-h-10 flex-none rounded-full bg-crimson px-4 text-[13px] font-bold text-white">Install</button>
        : <a href="/app" onClick={close} className="flex min-h-10 flex-none items-center rounded-full bg-crimson px-4 text-[13px] font-bold text-white no-underline">How?</a>}
      <button type="button" onClick={close} aria-label="Close" className="flex size-9 flex-none items-center justify-center rounded-full text-[18px] text-white/70">✕</button>
    </div>
  );
}
