export const isGsmEmail = (email: string) => email.endsWith("@gsm.hs.kr");

export const isValidPassword = (password: string) => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{10,}$/;

  return passwordRegex.test(password);
};
