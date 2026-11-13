// Shown on listings Sabong Sentral added itself (from public information) until
// the owner takes them over with a Portal account.
export function ListedBy({ data, title }: { data: unknown; title: string }) {
  if ((data as { listedBy?: string })?.listedBy !== "admin") return null;
  return (
    <p className="m-0 rounded-xl border border-dashed border-sand px-3 py-2 text-[13px] text-ink-soft">
      Listed by Sabong Sentral from public information.{" "}
      <a href={`/contact?topic=${encodeURIComponent("Claim or correct a listing")}&about=${encodeURIComponent(title)}`} className="font-semibold text-wine">Is this yours? Claim or correct it</a>
    </p>
  );
}
