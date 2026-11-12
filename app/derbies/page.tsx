import { redirect } from "next/navigation";

// Old address. Derby schedules now live under Events.
export default function DerbiesPage() {
  redirect("/events");
}
