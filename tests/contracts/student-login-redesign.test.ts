import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const hookPath = "src/fsd/features/login/model/useLoginForm.ts";
const formPath = "src/fsd/features/login/ui/LoginForm.tsx";

assert.equal(existsSync(hookPath), true, `${hookPath} must exist`);

const hook = readFileSync(hookPath, "utf8");
const form = readFileSync(formPath, "utf8");

assert.match(hook, /validateLoginForm/);
assert.match(hook, /restoreRememberedSession/);
assert.match(hook, /readRememberLoginPreference/);
assert.match(hook, /clearRememberLoginPreference/);
assert.match(hook, /login\(/);
assert.match(hook, /getRoleHomePath/);
assert.match(hook, /이메일 또는 비밀번호가 올바르지 않습니다\./);

assert.match(form, /useLoginForm/);
assert.match(form, /TextField/);
assert.match(form, /PasswordField/);
assert.match(form, /ActionButton/);
assert.match(form, /아이디 저장/);
assert.match(form, /href="\/forgot-password"/);
assert.match(form, /href="\/signup"/);
assert.doesNotMatch(form, /useState|useEffect/);
assert.doesNotMatch(form, /login\(/);
assert.doesNotMatch(`${hook}\n${form}`, /gsm\.hs\.kr/);



assert.match(form, /<label className="[^"]*min-h-11[^"]*">[\s\S]*?<input[\s\S]*?type="checkbox"/);
assert.match(form, /href="\/forgot-password"[\s\S]*?className="[^"]*min-h-11/);
assert.match(form, /href="\/signup"[^\n]*min-h-11/);

console.log("student login redesign contract passed");
