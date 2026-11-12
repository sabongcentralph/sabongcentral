import { redirect } from "next/navigation";

// Old address. Goods was renamed Market.
export default function GoodsRedirect() {
  redirect("/market");
}
