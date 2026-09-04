import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const entitySession = read("src/fsd/entities/user/model/session.ts");
const entityLifecycle = read("src/fsd/entities/user/model/lifecycle.ts");
const sessionRequest = read("src/fsd/entities/user/api/sessionRequest.ts");
const authenticatedRequest = read("src/fsd/shared/api/createAuthenticatedRequest.ts");
const loginForm = read("src/fsd/features/login/ui/LoginForm.tsx");
const loginHook = read("src/fsd/features/login/model/useLoginForm.ts");
const auth = `${entitySession}\n${entityLifecycle}`;
const login = `${loginHook}\n${loginForm}`;

assert.match(entityLifecycle, /saveSession[\s\S]*rememberLogin/);
assert.match(auth, /sessionStorage/);
assert.match(auth, /localStorage/);
assert.match(sessionRequest, /\/auth\/reissue/);
assert.match(entityLifecycle, /restoreRememberedSession/);
assert.match(authenticatedRequest, /status === 401/);
assert.match(authenticatedRequest, /reissueCurrentSession\(refreshToken\)/);
assert.match(entitySession, /jobdam_remember_login/);
assert.match(entitySession, /jobdam_remembered_email/);
assert.match(entitySession, /readRememberLoginPreference/);
assert.match(entityLifecycle, /clearSession[\s\S]*backfillRememberLoginEmail/);assert.match(loginForm, /아이디 저장/);
assert.match(loginForm, /type="checkbox"/);
assert.match(loginForm, /checked=\{form\.rememberLogin\}/);
assert.match(loginHook, /login\(form\.email\.trim\(\), form\.password, form\.rememberLogin\)/);
assert.match(loginHook, /restoreRememberedSession/);
assert.match(loginHook, /readRememberLoginPreference/);
assert.match(loginForm, /autoComplete="email"/);
assert.match(loginForm, /autoComplete="current-password"/);
assert.match(loginHook, /clearRememberLoginPreference/);
assert.doesNotMatch(login, />자동 로그인</);

console.log("remember login contract passed");