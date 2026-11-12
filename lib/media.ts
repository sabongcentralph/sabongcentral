// Photo storage in R2 (binding PHOTOS). Photos are shrunk in the browser first
// (max 1600 px, WebP ~250-300 KB, location data removed); the server only
// checks type and size. Photos never go in the database, only their path.
export const MAX_BYTES = 1_000_000; // after shrinking; a phone original is ~3-10 MB
const TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
export const KEY_RE = /^[a-z]\/[\w-]+\.(webp|jpg|png)$/;

export async function photoStore(): Promise<R2Bucket | null> {
  const { env } = await import("cloudflare:workers");
  return (env as unknown as { PHOTOS?: R2Bucket }).PHOTOS ?? null;
}

export const uploadsOn = async () => !!(await photoStore());

export function photoFiles(f: FormData, name: string, max: number): File[] {
  return f.getAll(name).filter((v): v is File => typeof v === "object" && v !== null && "size" in v && (v as File).size > 0).slice(0, max);
}

export function badPhoto(files: File[]): string | null {
  for (const file of files) {
    if (!TYPES[file.type]) return "Photos must be JPG, PNG or WebP images.";
    if (file.size > MAX_BYTES) return "A photo is too large. Please pick a smaller photo (the form shrinks photos automatically when JavaScript is on).";
  }
  return null;
}

// Saves photos and returns their public paths (/media/p/<id>.webp).
export async function savePhotos(files: File[]): Promise<string[]> {
  const store = await photoStore();
  if (!store || !files.length) return [];
  const out: string[] = [];
  for (const file of files) {
    const key = `p/${crypto.randomUUID()}.${TYPES[file.type]}`;
    await store.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" } });
    out.push(`/media/${key}`);
  }
  return out;
}
