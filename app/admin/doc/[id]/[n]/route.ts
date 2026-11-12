import { adminFromRequest } from "@/lib/auth";
import { logAction } from "@/lib/db";
import { DOC_KEY_RE, docById } from "@/lib/docs";
import { photoStore } from "@/lib/media";

// Private document photo: admins only, never cached, every view logged.
export async function GET(req: Request, { params }: { params: Promise<{ id: string; n: string }> }) {
  const admin = await adminFromRequest(req);
  if (!admin) return new Response("Not found", { status: 404 });
  const { id, n } = await params;
  const doc = await docById(Number(id));
  const key = doc?.keys[Number(n)];
  if (!doc || !key || !DOC_KEY_RE.test(key)) return new Response("Not found", { status: 404 });
  const store = await photoStore();
  const obj = store ? await store.get(key) : null;
  if (!obj) return new Response("Not found", { status: 404 });
  await logAction(admin, "document viewed", `member #${doc.member_id}: ${doc.type}`);
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}
