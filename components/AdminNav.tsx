export function AdminNav({ email, at, counts }: { email: string; at: string; counts?: Record<string, number> }) {
  const links = [
    ["/admin", "Review queue", counts?.pending],
    ["/admin?q=Approved", "Live", undefined],
    ["/admin/reports", "Reports", counts?.reports],
    ["/admin/messages", "Messages", counts?.messages],
    ["/admin/account", "Account", undefined],
  ] as const;
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-crimson-dark p-4 text-white">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-serif text-[20px] font-semibold text-gold-light">Admin</span>
        <span className="text-[12px] text-[#e8cfcb]">{email} · Super Admin</span>
        <form action="/api/admin/logout" method="post" className="ml-auto">
          <button type="submit" className="min-h-9 cursor-pointer rounded-full border border-white/40 bg-transparent px-3 text-[13px] font-semibold text-white">Sign out</button>
        </form>
      </div>
      <nav aria-label="Admin" className="-mx-1 flex gap-1.5 overflow-x-auto">
        {links.map(([href, label, n]) => (
          <a key={href} href={href} aria-current={href === at ? "page" : undefined}
            className={`flex min-h-10 flex-none items-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-semibold no-underline ${href === at ? "bg-cream text-crimson" : "text-[#f1dcd8]"}`}>
            {label}{n ? <span className="rounded-full bg-gold px-1.5 text-[11px] font-bold text-[#3a0a0a]">{n}</span> : null}
          </a>
        ))}
      </nav>
    </div>
  );
}
