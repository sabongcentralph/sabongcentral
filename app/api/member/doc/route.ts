import { sameOrigin } from "@/lib/auth";
import { back, field } from "@/lib/forms";
import { photoFiles } from "@/lib/media";
import { DOC_TYPES, MAX_DOC_PAGES, addDoc, badDoc, deleteDoc, docById } from "@/lib/docs";
import { memberFromRequest } from "@/lib/members";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const m = await memberFromRequest(req);
  if (!m) return back(req, "/portal");
  const f = await req.formData();
  const fail = (msg: string) => back(req, `/portal?tab=docs&error=${encodeURIComponent(msg)}`);
  if (field(f, "action", 10) === "delete") {
    const doc = await docById(Number(field(f, "id", 12)));
    if (!doc || doc.member_id !== m.id) return fail("Document not found.");
    await deleteDoc(doc, `${m.name || m.email} (member #${m.id})`);
    return back(req, "/portal?tab=docs&done=deleted");
  }
  if (m.status === "suspended" || m.status === "closed" || m.status === "incomplete") return fail("Your account can’t upload documents right now.");
  const type = field(f, "type", 80), expires = field(f, "expires", 10);
  if (!(DOC_TYPES as readonly string[]).includes(type)) return fail("Please choose the document type.");
  if (expires && !/^\d{4}-\d\d-\d\d$/.test(expires)) return fail("The expiry date doesn’t look right.");
  const files = photoFiles(f, "doc", MAX_DOC_PAGES);
  const bad = badDoc(files);
  if (bad) return fail(bad);
  try {
    await addDoc(m, type, expires, files);
  } catch {
    return fail("Uploads aren’t available right now. Please try again later.");
  }
  return back(req, "/portal?tab=docs&done=uploaded");
}
