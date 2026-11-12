import { adminFromRequest, sameOrigin } from "@/lib/auth";
import { back, field } from "@/lib/forms";
import { deleteDoc, docById, reviewDoc } from "@/lib/docs";

export async function POST(req: Request) {
  const admin = await adminFromRequest(req);
  if (!admin || !sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const f = await req.formData();
  const doc = await docById(Number(field(f, "id", 12)));
  const next = field(f, "next", 200).startsWith("/admin") ? field(f, "next", 200) : "/admin/documents";
  if (!doc) return back(req, next);
  const action = field(f, "action", 20), note = field(f, "note", 500);
  const sep = next.includes("?") ? "&" : "?";
  if (action === "reject" && !note) return back(req, `${next}${sep}error=note`);
  if (action === "approve") await reviewDoc(doc.id, true, admin, note, field(f, "badge", 2) === "1");
  else if (action === "reject") await reviewDoc(doc.id, false, admin, note, false);
  else if (action === "delete") await deleteDoc(doc, admin);
  return back(req, `${next}${sep}done=${action}`);
}
