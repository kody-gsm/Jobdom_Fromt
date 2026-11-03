export const GSM_EMAIL_GUIDE = "@gsm.hs.kr로 끝나는 학교 계정을 사용해주세요.";

export const isGsmEmail = (email: string) => /^[^\s@]+@gsm\.hs\.kr$/.test(email.trim());

export const getRequiredMessage = (label: string) =>
  `${label} 입력해주세요.`;

export const getGsmEmailErrorMessage = (email: string) => {
  if (email.trim() === "") return getRequiredMessage("이메일을");
  if (!isGsmEmail(email)) {
    return GSM_EMAIL_GUIDE;
  }
  return "";
};

export const isValidPassword = (password: string) => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{10,}$/;
  return passwordRegex.test(password);
};

export const normalizeVerificationCode = (value: string) =>
  value.replace(/\D/g, "").slice(0, 6);
