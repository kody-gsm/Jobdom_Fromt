import { LoginForm } from "@fsd/features/login";
import { AuthLayout } from "@fsd/widgets/auth-layout";

export const LoginPage = () => (
  <AuthLayout
    title="다시 만나서 반가워요"
    description="계정으로 로그인하면 상담 신청, 취업 공고와 신청 폼을 이어서 이용할 수 있어요."
  >
    <LoginForm />
  </AuthLayout>
);
