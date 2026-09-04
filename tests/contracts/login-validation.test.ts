import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const loginForm = readFileSync(
  resolve(process.cwd(), "src/fsd/features/login/ui/LoginForm.tsx"),
  "utf8",
);

assert.equal(
  loginForm.includes("gsm.hs.kr"),
  false,
  "로그인에서 GSM 이메일 도메인을 강제하면 안 됩니다.",
);
assert.equal(
  loginForm.includes("const isEmailError"),
  false,
  "로그인 실패 원인을 프론트에서 추측하면 안 됩니다.",
);
assert.match(
  loginForm,
  /이메일 또는 비밀번호가 올바르지 않습니다\./,
  "인증 실패 시 계정 정보 불일치 메시지를 표시해야 합니다.",
);
assert.match(loginForm, /getRoleHomePath/);

console.log("login validation contract passed");
