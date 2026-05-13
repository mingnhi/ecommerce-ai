import type { Metadata } from "next";
import CartPage from "@/modules/CartPage";
import { siteConfig } from "@/configs/site";

export const metadata: Metadata = {
  title: `Giỏ hàng — ${siteConfig.name}`,
  description: "Giỏ hàng của bạn",
};

export default function Page() {
  return <CartPage />;
}
