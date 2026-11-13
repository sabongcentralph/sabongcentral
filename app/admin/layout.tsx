import { currentAdmin } from "@/lib/auth";
import { adminSummary, alertsOf } from "@/lib/adminData";
import { AdminSideNav, AdminTabs } from "@/components/admin/AdminSideNav";
import { Bell } from "@/components/admin/Bell";
import { MenuDrawer } from "@/components/MenuDrawer";
import { UserIcon } from "@/components/icons";

function Logo() {
  return (
    <a href="/admin" className="flex items-center gap-2.5 text-ink no-underline">
      <img src="/icons/logo-mark.png" alt="" width={34} height={38} className="h-[38px] w-auto flex-none" />
      <span className="flex flex-col leading-tight">
        <span className="font-serif text-[18px] font-semibold tracking-tight">Sabong Sentral</span>
        <span className="mt-0.5 w-fit rounded-md bg-crimson px-1.5 py-px text-[10.5px] font-bold uppercase tracking-wider text-white">Admin Panel</span>
      </span>
    </a>
  );
}

// Admin panel shell: dark theme, its own side menu, header bell and phone tabs.
export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const email = await currentAdmin();
  if (!email) {
    return (
      <div className="admin-dark flex min-h-screen flex-col">
        <header className="flex items-center border-b border-line px-4 py-3 md:px-6"><Logo /></header>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    );
  }
  const s = await adminSummary();
  const counts = { waiting: s.waiting.length, reports: s.reports, messages: s.messages, permits: s.permits.length, members: s.applications, docs: s.docs };
  return (
    <div className="admin-dark min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-[264px] flex-none flex-col gap-6 overflow-y-auto border-r border-line bg-[#09090b] px-3 py-5 lg:flex">
        <div className="px-2"><Logo /></div>
        <AdminSideNav counts={counts} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col pb-24 lg:pb-0">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-ivory/90 px-3 py-2 backdrop-blur md:px-6">
          <MenuDrawer><AdminSideNav counts={counts} /></MenuDrawer>
          <div className="lg:hidden"><Logo /></div>
          <div className="ml-auto flex items-center gap-1.5">
            <Bell alerts={alertsOf(s)} log={s.log} />
            <a href="/admin/account" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 text-ink no-underline hover:bg-white/10 sm:pr-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#26262c] text-ink-soft"><UserIcon size={20} /></span>
              <span className="hidden flex-col leading-tight sm:flex"><span className="text-[13.5px] font-semibold">Admin</span><span className="text-[11.5px] text-muted">Super Admin</span></span>
            </a>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
      <AdminTabs counts={counts} />
    </div>
  );
}
