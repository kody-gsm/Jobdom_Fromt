import { ResetPasswordForm } from "@fsd/features/reset-password";
import { AuthLayout } from "@fsd/widgets/auth-layout";

export const ForgotPasswordPage = () => (
  <AuthLayout>
    <ResetPasswordForm />
  </AuthLayout>
);