import { env } from "cloudflare:workers";

export type Check = { ok: boolean; detail: string };

export async function checkDatabase(): Promise<Check> {
  try {
    const row = await env.DB.prepare("select 1 as one").first<{ one: number }>();
    return { ok: row?.one === 1, detail: "query ok" };
  } catch (err) {
    return { ok: false, detail: String(err) };
  }
}

export async function checkPhotos(): Promise<Check | null> {
  // R2 is not set up until Phase 2 (photo upload).
  const photos = (env as unknown as { PHOTOS?: R2Bucket }).PHOTOS;
  if (!photos) return null;
  try {
    const list = await photos.list({ limit: 1 });
    return { ok: true, detail: `${list.objects.length > 0 ? "has" : "no"} files yet` };
  } catch (err) {
    return { ok: false, detail: String(err) };
  }
}

export function derbyEnabled(): boolean {
  return (env.DERBY_ENABLED as string) === "true";
}
