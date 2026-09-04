import { ResetPasswordForm } from "@fsd/features/reset-password";
import { AuthLayout } from "@fsd/widgets/auth-layout";

export const ForgotPasswordPage = () => (
  <AuthLayout
    title="비밀번호를 다시 설정해요"
    description="학교 이메일로 인증코드를 받은 뒤 새 비밀번호를 설정할 수 있습니다."
  >
    <ResetPasswordForm />
  </AuthLayout>
);
