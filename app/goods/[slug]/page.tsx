import { redirect } from "next/navigation";

export default async function GoodRedirect({ params }: { params: Promise<{ slug: string }> }) {
  redirect(`/market/${encodeURIComponent((await params).slug)}`);
}
