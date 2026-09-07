type Request = <T>(path: string, init?: RequestInit) => Promise<T>;

export const createResetPasswordActions = ({ request }: { request: Request }) => ({
  sendVerificationCode: (email: string) =>
    request<void>("/auth/email/password-reset-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (
    email: string,
    verificationCode: string,
    newPassword: string,
  ) =>
    request<void>("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ email, verificationCode, newPassword }),
    }),
});
