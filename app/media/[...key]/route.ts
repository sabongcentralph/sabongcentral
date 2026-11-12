import { KEY_RE, photoStore } from "@/lib/media";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join("/");
  if (!KEY_RE.test(key) || !key.startsWith("p/")) return new Response("Not found", { status: 404 });
  const store = await photoStore();
  const obj = store ? await store.get(key) : null;
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
