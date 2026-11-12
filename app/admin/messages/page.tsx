import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { messages } from "@/lib/db";
import { Chip, Empty, Page, btnGhost } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessages() {
  await requireAdmin();
  const list = await messages();
  return (
    <Page>
      <h1 className="m-0 font-serif text-[26px] font-semibold">Contact messages</h1>
      <p className="m-0 text-[13px] text-muted">From the Contact Us form. Reply to the sender by email. (Automatic forwarding to Gmail comes with email sending.)</p>
      {list.length === 0 ? <Empty>No messages yet.</Empty> : list.map((m) => (
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
