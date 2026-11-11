import { checkDatabase, checkPhotos, derbyEnabled } from "@/lib/health";

export async function GET() {
  const [database, photos] = await Promise.all([checkDatabase(), checkPhotos()]);
  return Response.json(
    { ok: database.ok && photos.ok, database, photos, derbyEnabled: derbyEnabled() },
    { status: database.ok && photos.ok ? 200 : 503 },
  );
}
