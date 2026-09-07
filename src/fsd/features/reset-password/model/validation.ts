import { getGsmEmailErrorMessage, isValidPassword } from "@fsd/entities/user";

export type ResetPasswordFormValues = {
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
  isCodeExpired: boolean;
};

export type ResetPasswordFormErrors = Partial<
  Record<Exclude<keyof ResetPasswordFormValues, "isCodeExpired">, string>
>;

export const validateResetPasswordForm = (
  values: ResetPasswordFormValues,
): ResetPasswordFormErrors => {
  const errors: ResetPasswordFormErrors = {};
  const emailError = getGsmEmailErrorMessage(values.email);
  if (emailError) errors.email = emailError;
  if (values.verificationCode.trim().length !== 6) {
    errors.verificationCode = "인증코드 6자리를 입력해주세요.";
  } else if (values.isCodeExpired) {
    errors.verificationCode = "인증코드가 만료되었습니다. 재발송해주세요.";
  }
  if (!isValidPassword(values.password)) {
    errors.password = "영문, 숫자, 특수문자를 포함해 10자 이상 입력해주세요.";
  }
  if (values.confirmPassword.trim() === "") {
    errors.confirmPassword = "비밀번호를 다시 입력해주세요.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
  }
  return errors;
};
