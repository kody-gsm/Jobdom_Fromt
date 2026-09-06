import { ResetPasswordForm } from "@fsd/features/reset-password";
import { AuthLayout } from "@fsd/widgets/auth-layout";

export const ForgotPasswordPage = () => (
  <AuthLayout
    title="비밀번호 재설정"
    description="학교 이메일로 인증코드를 받은 뒤 새로운 비밀번호를 설정하세요."
  >
    <ResetPasswordForm />
  </AuthLayout>
);