import type { Metadata } from "next";
import type { Search } from "@/lib/content";
import { EventDirectory } from "@/components/EventDirectory";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seminars & Expos" };

// Same list as /education (Events tab), shown inside the Learn tab.
export default async function LearnSeminarsPage({ searchParams }: { searchParams: Promise<Search> }) {
  return <EventDirectory sp={await searchParams} mode="education" learn />;
}
