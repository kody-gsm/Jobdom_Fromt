import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const layout = read("app/layout.tsx");
const recruitDetailHook = read("src/fsd/pages/recruit-detail/model/useRecruitDetail.ts");
const login = read("app/(auth)/login/page.tsx");
const signup = read("app/(auth)/signup/page.tsx");
const forgotPassword = read("app/(auth)/forgot-password/page.tsx");

assert.match(layout, /template: "잡담 \| %s"/);
assert.match(layout, /icon:\s*"\/JobdamIcon\.svg"/);
assert.match(recruitDetailHook, /document\.title = `잡담 \|/);
assert.match(login, /title: "로그인"/);
assert.match(signup, /title: "회원가입"/);
assert.match(forgotPassword, /title: "비밀번호 재설정"/);

console.log("site metadata contract passed");
