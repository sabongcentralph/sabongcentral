import type { Metadata } from "next";
import type { Search } from "@/lib/content";
import { EventDirectory } from "@/components/EventDirectory";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Events" };

export default async function EventsPage({ searchParams }: { searchParams: Promise<Search> }) {
  return <EventDirectory sp={await searchParams} mode="derby" />;
}
