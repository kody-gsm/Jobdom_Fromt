import { SignupForm } from "@fsd/features/signup";
import { AuthLayout } from "@fsd/widgets/auth-layout";

export const SignupPage = () => (
  <AuthLayout
    title="잡담 계정을 만들어보세요"
    description="학교 이메일 인증 후 상담, 채용 공고와 설문 기능을 이용할 수 있습니다."
  >
    <SignupForm />
  </AuthLayout>
);