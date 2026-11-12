import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import { one, type Search } from "@/lib/content";
import { byId, titleOf } from "@/lib/db";
import { uploadsOn } from "@/lib/media";
import { ListingForm } from "@/components/ListingForm";
import { Note, Page } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add listing" };

const TABS = [["event", "Derby or event"], ["farm", "Gamefarm"], ["good", "Market item"], ["reel", "Reel"], ["article", "Article"], ["notice", "Notice or advisory"], ["supplier", "Supplier"]] as const;
type T = (typeof TABS)[number][0];
const ME = { name: "", phone: "", facebook: "" };

export default async function AdminAdd({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdmin();
  const sp = await searchParams;
  const editing = Number(one(sp.edit)) ? await byId(Number(one(sp.edit))) : null;
  const tab = (editing?.kind ?? TABS.find(([k]) => k === one(sp.tab))?.[0] ?? "event") as T;
  const up = await uploadsOn();
  const error = one(sp.error);
  return (
    <Page>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-serif text-[26px] font-semibold">{editing ? `Edit: ${titleOf(editing)}` : "Add a listing"}</h1>
        <p className="m-0 text-[13.5px] text-muted">
          {editing ? "Changes go live right away." : "Your listings skip the review queue and go live right away, marked “Listed by Sabong Central” with a “Claim or correct it” link. When the owner gets a Portal account, move it to them from the listing page."}
        </p>
        <p className="m-0 text-[12.5px] text-muted">Use only information they have posted publicly (their page, public contact number). Don’t post a personal mobile number without asking. For derbies, check the cockpit license and LGU permit first.</p>
      </div>
      {error && <Note tone="red">{error}</Note>}
      {!editing && (
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
          {TABS.map(([k, label]) => (
            <a key={k} href={`/admin/add?tab=${k}`} aria-current={k === tab ? "page" : undefined}
              className={`flex min-h-10 flex-none items-center rounded-full px-4 text-[13.5px] font-semibold no-underline ${k === tab ? "bg-crimson text-white" : "border border-line bg-cream text-ink-soft"}`}>
              {label}
            </a>
          ))}
        </div>
      )}
      {editing && !TABS.some(([k]) => k === editing.kind) ? <Note tone="red">This kind of listing can’t be edited here.</Note>
        : <ListingForm tab={tab} up={up} who={ME} l={editing ?? undefined} admin />}
    </Page>
  );
}
