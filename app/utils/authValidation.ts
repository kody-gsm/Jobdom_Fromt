export const isGsmEmail = (email: string) => email.endsWith("@gsm.hs.kr");

export const getRequiredMessage = (label: string) =>
  `${label} 입력해주세요.`;

export const getGsmEmailErrorMessage = (email: string) => {
  if (email.trim() === "") {
    return getRequiredMessage("이메일을");
  }

  if (!isGsmEmail(email)) {
    return "@gsm.hs.kr 이메일만 사용 가능합니다.";
  }

  return "";
};

export const isValidPassword = (password: string) => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{10,}$/;

  return passwordRegex.test(password);
};
