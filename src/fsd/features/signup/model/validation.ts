import { getGsmEmailErrorMessage, isValidPassword } from "@fsd/entities/user";

export type SignupFormValues = {
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
};

export type SignupFormErrors = Partial<Record<keyof SignupFormValues, string>>;

export const validateSignupForm = (values: SignupFormValues): SignupFormErrors => {
  const errors: SignupFormErrors = {};
  const emailError = getGsmEmailErrorMessage(values.email);
  if (emailError) errors.email = emailError;
  if (values.verificationCode.trim().length !== 6) {
    errors.verificationCode = "인증코드 6자리를 입력해주세요.";
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
