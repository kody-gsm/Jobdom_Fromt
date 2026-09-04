type ErrorLike = { message?: string; status?: number };
export type AuthErrorField = "email" | "verificationCode" | "form";
export type AuthFieldError = { field: AuthErrorField; message: string };

const messages: Record<string, string> = {
  "Invalid email or password.": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "Email verification is required.": "이메일 인증이 필요합니다.",
  "Invalid verification code.": "인증코드가 올바르지 않습니다.",
  "Verification code has expired.": "인증코드가 만료되었습니다. 재발송해주세요.",
  "Already signed up.": "이미 가입된 이메일입니다.",
  "Student information was not found.": "학생 정보를 찾을 수 없습니다.",
  "Invalid signup request.": "회원가입 정보를 다시 확인해주세요.",
  "이메일은 학교계정을 사용해야합니다.": "s로 시작하는 @gsm.hs.kr 이메일을 입력해주세요.",
};

const asError = (error: unknown): ErrorLike =>
  typeof error === "object" && error !== null ? error as ErrorLike : {};

const rawMessage = (error: unknown) => asError(error).message || "";
export const getAuthErrorMessage = (error: unknown, fallback: string) => {
  const current = asError(error);
  if (current.status === 0 || [502, 503, 504].includes(current.status ?? -1)) {
    return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
  }
  if (typeof current.status === "number" && current.status >= 500) {
    return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
  return current.message ? messages[current.message] || fallback : fallback;
};

export const getSignupError = (error: unknown): AuthFieldError => {
  const raw = rawMessage(error);
  const message = getAuthErrorMessage(
    error,
    "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.",
  );
  if (raw === "Invalid verification code." || raw === "Verification code has expired.") {
    return { field: "verificationCode", message };
  }
  if (
    raw === "Already signed up." ||
    raw === "Student information was not found." ||
    raw === "이메일은 학교계정을 사용해야합니다."
  ) {
    return { field: "email", message };
  }
  return { field: "form", message };
};

export const getPasswordResetError = (error: unknown): AuthFieldError => {
  const raw = rawMessage(error);
  const message = getAuthErrorMessage(
    error,
    "비밀번호를 변경하지 못했습니다. 잠시 후 다시 시도해주세요.",
  );
  if (raw === "Invalid verification code." || raw === "Verification code has expired.") {
    return { field: "verificationCode", message };
  }
  if (raw === "이메일은 학교계정을 사용해야합니다.") {
    return { field: "email", message };
  }
  return { field: "form", message };
};
