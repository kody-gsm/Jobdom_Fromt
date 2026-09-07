import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const hook = read("src/fsd/features/login/model/useLoginForm.ts");
const validation = read("src/fsd/features/login/model/validation.ts");
const form = read("src/fsd/features/login/ui/LoginForm.tsx");
const source = `${hook}\n${validation}\n${form}`;

assert.equal(source.includes("gsm.hs.kr"), false, "로그인은 GSM 이메일 형식을 강제하면 안 됩니다.");
assert.equal(source.includes("const isEmailError"), false, "로그인 실패 원인을 프론트에서 추측하면 안 됩니다.");
assert.match(source, /이메일 또는 비밀번호가 올바르지 않습니다\./);
assert.match(hook, /getRoleHomePath/);
assert.match(validation, /getRequiredMessage\("이메일을"\)/);
assert.match(validation, /getRequiredMessage\("비밀번호를"\)/);
assert.doesNotMatch(form, /login\(/);

console.log("login validation contract passed");