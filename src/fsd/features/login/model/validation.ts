import { getRequiredMessage } from "@fsd/entities/user";

export type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

export const validateLoginForm = ({ email, password }: LoginFormValues): LoginFormErrors => {
  const errors: LoginFormErrors = {};
  if (email.trim() === "") errors.email = getRequiredMessage("이메일을");
  if (password.trim() === "") errors.password = getRequiredMessage("비밀번호를");
  return errors;
};
