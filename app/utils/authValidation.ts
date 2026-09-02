export const isGsmEmail = (email: string) => /^s.*@gsm\.hs\.kr$/.test(email.trim());

export const getRequiredMessage = (label: string) =>
  `${label} 입력해주세요.`;

export const getGsmEmailErrorMessage = (email: string) => {
  if (email.trim() === "") {
    return getRequiredMessage("이메일을");
  }

  if (!isGsmEmail(email)) {
    return "s로 시작하는 @gsm.hs.kr 이메일을 입력해주세요.";
  }

  return "";
};

export const isValidPassword = (password: string) => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{10,}$/;

  return passwordRegex.test(password);
};
