import { adminFromRequest, sameOrigin } from "@/lib/auth";
import { back, field } from "@/lib/forms";
import { savePlacements, type Slot } from "@/lib/placements";

export async function POST(req: Request) {
  const admin = await adminFromRequest(req);
  if (!admin || !sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const slots: Slot[] = [];
  for (const raw of f.getAll("id").map(String)) {
    const id = Number(raw);
    if (!id || f.get(`remove_${id}`) === "1") continue;
    slots.push({ id, rank: Math.max(1, Number(field(f, `rank_${id}`, 3)) || 99), sponsored: f.get(`sp_${id}`) === "1", until: field(f, `until_${id}`, 10) });
  }
  const add = Number(field(f, "add_id", 12));
  if (add && !slots.some((s) => s.id === add)) slots.push({ id: add, rank: Math.max(1, Number(field(f, "add_rank", 3)) || slots.length + 1), sponsored: f.get("add_sp") === "1", until: field(f, "add_until", 10) });
  await savePlacements(slots, Number(field(f, "spotlight", 12)) || 0, admin);
  return back(req, "/admin/placements?saved=1");
}
