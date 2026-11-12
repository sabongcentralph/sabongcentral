import type { Metadata } from "next";
import type { Search } from "@/lib/content";
import { EventDirectory } from "@/components/EventDirectory";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Education" };

export default async function EducationPage({ searchParams }: { searchParams: Promise<Search> }) {
  return <EventDirectory sp={await searchParams} mode="education" />;
}
