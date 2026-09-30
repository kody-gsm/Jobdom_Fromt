import type { Metadata } from "next";
import { ForgotPasswordPage } from "@fsd/pages/forgot-password";

export const metadata: Metadata = { title: "비밀번호 재설정" };

export default function Page() {
  return <ForgotPasswordPage />;
}
