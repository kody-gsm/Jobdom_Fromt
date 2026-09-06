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
assert.match(hook, /credentials\?/);
assert.match(hook, /form\.rememberLogin/);
assert.match(form, /new FormData\(event\.currentTarget\)/);
assert.match(form, /formData\.get\("email"\)/);
assert.match(form, /formData\.get\("password"\)/);
assert.match(form, /submit\(\{ email, password \}\)/);
assert.match(form, /disabled=\{isSubmitting\}/);
assert.doesNotMatch(form, /disabled=\{!canSubmit\}/);
assert.match(form, /아이디 저장/);
assert.match(form, /href="\/forgot-password"/);
assert.match(form, /href="\/signup"/);
assert.doesNotMatch(`${hook}\n${form}`, /gsm\.hs\.kr/);

console.log("student login autofill contract passed");
