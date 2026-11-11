import { checkDatabase, checkPhotos, derbyEnabled } from "@/lib/health";

export async function GET() {
  const [database, photos] = await Promise.all([checkDatabase(), checkPhotos()]);
  const ok = database.ok && (photos?.ok ?? true);
  return Response.json(
    { ok, database, photos: photos ?? "not set up yet", derbyEnabled: derbyEnabled() },
    { status: ok ? 200 : 503 },
  );
}
