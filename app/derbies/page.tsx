import { redirect } from "next/navigation";

// Old address. Derby listings now live under Events.
export default function DerbiesPage() {
  redirect("/events?group=Derbies+%26+Events");
}
