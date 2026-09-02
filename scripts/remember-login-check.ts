import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const api = readFileSync(resolve(process.cwd(), "app/utils/api.ts"), "utf8");
const storage = readFileSync(resolve(process.cwd(), "app/utils/authSession.ts"), "utf8");
const login = readFileSync(resolve(process.cwd(), "app/(auth)/login/page.tsx"), "utf8");
const auth = `${api}\n${storage}`;

assert.match(api, /saveSession[\s\S]*rememberLogin/);
assert.match(auth, /sessionStorage/);
assert.match(auth, /localStorage/);
assert.match(api, /\/auth\/reissue/);
assert.match(api, /restoreRememberedSession/);
assert.match(api, /response\.status === 401[\s\S]*reissueCurrentSession/);
assert.match(storage, /jobdam_remember_login/);
assert.match(storage, /jobdam_remembered_email/);
assert.match(storage, /readRememberLoginPreference/);
assert.match(login, /isRememberLogin/);
assert.match(login, /type="checkbox"/);
assert.match(login, /checked=\{isRememberLogin\}/);
assert.match(login, /login\(email, password, isRememberLogin\)/);
assert.match(login, /restoreRememberedSession/);
assert.match(login, /readRememberLoginPreference/);
assert.match(login, /useState\(\(\) => readRememberLoginPreference\(\)\.email\)/);
assert.match(login, /useState\(\(\) => readRememberLoginPreference\(\)\.enabled\)/);
assert.doesNotMatch(login, /setEmail\(preference\.email\)/);
assert.match(login, /autoComplete="email"/);
assert.match(login, /autoComplete="current-password"/);
assert.match(login, /className="sr-only"/);
assert.match(login, /text-\[#5F6368\]/);
assert.match(login, /border-\[#02C551\] bg-\[#02C551\]/);
assert.match(login, /border-\[#B8BBC0\] bg-white/);
const rememberBlock = login.match(/<label[\s\S]*?자동 로그인[\s\S]*?<\/label>/)?.[0] || "";
assert.doesNotMatch(rememberBlock, /hover:|cursor-pointer|accent-/);

console.log("remember login contract passed");