import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const api = read("app/utils/api.ts");
const entitySession = read("src/fsd/entities/user/model/session.ts");
const entityLifecycle = read("src/fsd/entities/user/model/lifecycle.ts");
const login = read("src/fsd/features/login/ui/LoginForm.tsx");
const auth = `${api}\n${entitySession}\n${entityLifecycle}`;

assert.match(entityLifecycle, /saveSession[\s\S]*rememberLogin/);
assert.match(auth, /sessionStorage/);
assert.match(auth, /localStorage/);
assert.match(api, /\/auth\/reissue/);
assert.match(entityLifecycle, /restoreRememberedSession/);
assert.match(api, /status === 401[\s\S]*reissueCurrentSession/);
assert.match(entitySession, /jobdam_remember_login/);
assert.match(entitySession, /jobdam_remembered_email/);
assert.match(entitySession, /readRememberLoginPreference/);
assert.match(entityLifecycle, /clearSession[\s\S]*backfillRememberLoginEmail/);

assert.match(login, /아이디 저장/);
assert.match(login, /type="checkbox"/);
assert.match(login, /checked=\{isRememberLogin\}/);
assert.match(login, /login\(email, password, isRememberLogin\)/);
assert.match(login, /restoreRememberedSession/);
assert.match(login, /readRememberLoginPreference/);
assert.match(login, /autoComplete="email"/);
assert.match(login, /autoComplete="current-password"/);
assert.match(login, /clearRememberLoginPreference/);
assert.doesNotMatch(login, />자동 로그인</);

console.log("remember login contract passed");
