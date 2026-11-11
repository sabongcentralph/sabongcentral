import { redirect } from "next/navigation";
import { currentAdmin } from "./auth";

export async function requireAdmin(): Promise<string> {
  const email = await currentAdmin();
  if (!email) redirect("/admin/login");
  return email;
}
