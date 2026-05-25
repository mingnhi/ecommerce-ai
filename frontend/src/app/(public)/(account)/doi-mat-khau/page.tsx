import { Metadata } from "next";
import ChangePasswordPage from "@/modules/ChangePasswordPage";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
  description: "Cập nhật mật khẩu để bảo vệ tài khoản của bạn.",
};

export default function Page() {
  return <ChangePasswordPage />;
}
