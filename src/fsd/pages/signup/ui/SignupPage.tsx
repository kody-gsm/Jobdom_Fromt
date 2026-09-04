import { SignupForm } from "@fsd/features/signup";
import { AuthLayout } from "@fsd/widgets/auth-layout";

export const SignupPage = () => (
  <AuthLayout
    title="잡담 계정을 만들어요"
    description="학교 이메일 인증 후 계정을 만들 수 있습니다. 비밀번호 정책과 인증 방식은 기존 서비스와 동일합니다."
  >
    <SignupForm />
  </AuthLayout>
);
