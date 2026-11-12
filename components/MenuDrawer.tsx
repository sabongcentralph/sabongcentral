"use client";

import { useRef } from "react";
import { CloseIcon, MenuIcon } from "./icons";

// ☰ button that opens the side menu as a slide-in panel (phones and tablets).
export function MenuDrawer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" aria-label="Open menu" onClick={() => ref.current?.showModal()}
        className="flex size-10 flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-gold-light hover:bg-white/10 lg:hidden">
        <MenuIcon size={24} />
      </button>
      <dialog ref={ref} aria-label="Menu" className="drawer m-0 h-dvh max-h-none w-[300px] max-w-[85vw] border-0 bg-ivory p-0 text-ink"
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-center justify-between border-b-2 border-gold bg-crimson px-4 py-3 text-white">
            <span className="font-serif text-[19px] font-semibold">Menu</span>
            <button type="button" aria-label="Close menu" onClick={() => ref.current?.close()}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-gold-light hover:bg-white/10">
              <CloseIcon size={22} />
            </button>
          </div>
          <div className="p-3 pb-10">{children}</div>
        </div>
      </dialog>
    </>
  );
}
