import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { counts, messages } from "@/lib/db";
import { AdminNav } from "@/components/AdminNav";
import { Chip, Empty, Page, btnGhost } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessages() {
  const email = await requireAdmin();
  const [list, c] = await Promise.all([messages(), counts()]);
  return (
    <Page>
      <AdminNav email={email} at="/admin/messages" counts={c} />
      <h1 className="m-0 font-serif text-[26px] font-semibold">Contact messages</h1>
      <p className="m-0 text-[13px] text-muted">Mula sa Contact Us form. Sumagot sa email ng nagpadala. (Ang awtomatikong pag-forward sa gmail ay idadagdag kasama ng email sending.)</p>
      {list.length === 0 ? <Empty>Wala pang messages.</Empty> : list.map((m) => (
        <article key={m.id} className="flex flex-col gap-1.5 rounded-2xl border border-line bg-cream p-4">
          <div className="flex flex-wrap items-center gap-2"><Chip tone={m.status === "new" ? "gold" : "plain"}>{m.status}</Chip><Chip tone="plain">{m.topic}</Chip><span className="text-[12px] text-muted">{m.created_at}</span></div>
          <h2 className="m-0 text-[15px] font-bold">{m.name} · <a href={`mailto:${m.email}`} className="text-wine">{m.email}</a></h2>
          <p className="m-0 whitespace-pre-line text-[14px] text-ink-soft">{m.body}</p>
          {m.status === "new" && (
            <form action="/api/admin/inbox" method="post"><input type="hidden" name="what" value="message" /><input type="hidden" name="id" value={m.id} /><button type="submit" className={btnGhost}>Mark as read</button></form>
          )}
        </article>
      ))}
    </Page>
  );
}
