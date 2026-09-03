import assert from "node:assert/strict";

const { createLoginAction } = await import(
  "../../src/fsd/features/login/api/createLoginAction.ts"
);
const { createSignupActions } = await import(
  "../../src/fsd/features/signup/api/createSignupActions.ts"
);
const { createResetPasswordActions } = await import(
  "../../src/fsd/features/reset-password/api/createResetPasswordActions.ts"
);

type Call = { path: string; method: string; body?: unknown };
const calls: Call[] = [];
const request = async <T>(path: string, init: RequestInit = {}) => {
  calls.push({
    path,
    method: init.method || "GET",
    body: init.body ? JSON.parse(String(init.body)) : undefined,
  });
  return { accessToken: "token", refreshToken: "refresh" } as T;
};

let remembered = false;
const login = createLoginAction({
  request,
  saveSession: (response, rememberLogin) => {
    remembered = rememberLogin;
    return { ...response, role: "STUDENT" as const };
  },
});
await login("user@gsm.hs.kr", "Password!1", true);
assert.equal(remembered, true);

const signup = createSignupActions({ request });
await signup.sendVerificationCode("s123@gsm.hs.kr");
await signup.signup({
  email: "s123@gsm.hs.kr",
  password: "Password!1",
  verificationCode: "123456",
});

const reset = createResetPasswordActions({ request });
await reset.sendVerificationCode("s123@gsm.hs.kr");
await reset.resetPassword("s123@gsm.hs.kr", "123456", "Password!2");

assert.deepEqual(calls, [
  { path: "/auth/login", method: "POST", body: { email: "user@gsm.hs.kr", password: "Password!1" } },
  { path: "/auth/email/signup-code", method: "POST", body: { email: "s123@gsm.hs.kr" } },
  {
    path: "/auth/signup",
    method: "POST",
    body: { email: "s123@gsm.hs.kr", password: "Password!1", verificationCode: "123456" },
  },
  { path: "/auth/email/password-reset-code", method: "POST", body: { email: "s123@gsm.hs.kr" } },
  {
    path: "/auth/password/reset",
    method: "POST",
    body: { email: "s123@gsm.hs.kr", verificationCode: "123456", newPassword: "Password!2" },
  },
]);
