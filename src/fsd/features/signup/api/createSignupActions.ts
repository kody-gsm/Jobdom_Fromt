export interface SignupInput {
  email: string;
  password: string;
  verificationCode: string;
}

type Request = <T>(path: string, init?: RequestInit) => Promise<T>;

export const createSignupActions = ({ request }: { request: Request }) => ({
  sendVerificationCode: (email: string) =>
    request<void>("/auth/email/signup-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  signup: (input: SignupInput) =>
    request<unknown>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(input),
    }),
});
