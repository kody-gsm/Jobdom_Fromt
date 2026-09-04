import { LoginForm } from "@fsd/features/login";
import { AuthLayout } from "@fsd/widgets/auth-layout";

export const LoginPage = () => (
  <AuthLayout
    title="다시 만나서 반가워요"
    description="학교 계정으로 로그인하고 상담 신청, 채용 공고와 설문을 한 곳에서 확인하세요."
  >
    <LoginForm />
  </AuthLayout>
);