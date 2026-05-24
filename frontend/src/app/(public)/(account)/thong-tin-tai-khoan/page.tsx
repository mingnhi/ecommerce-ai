import { Metadata } from "next";
import ProfilePage from "@/modules/ProfilePage";

export const metadata: Metadata = {
  title: "Thông tin tài khoản",
  description: "Quản lý thông tin cá nhân của bạn.",
};

export default function Page() {
  return <ProfilePage />;
}
