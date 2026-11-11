// Small helpers for plain HTML form posts (they work without JavaScript).
export function field(f: FormData, name: string, max = 500): string {
  const v = f.get(name);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function back(req: Request, path: string, status = 303) {
  return new Response(null, { status, headers: { Location: new URL(path, req.url).toString() } });
}

// Bots fill every field, including the hidden "website" one.
export function isBot(f: FormData) {
  return field(f, "website") !== "";
}
