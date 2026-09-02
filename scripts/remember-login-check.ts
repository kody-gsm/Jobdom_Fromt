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

assert.match(login, /isRememberLogin/);
assert.match(login, /type="checkbox"/);
assert.match(login, /checked=\{isRememberLogin\}/);
assert.match(login, /자동 로그인/);
assert.match(login, /login\(email, password, isRememberLogin\)/);
assert.match(login, /restoreRememberedSession/);
assert.match(login, /<label className="flex items-center gap-2 text-\[#02C551\]">/);
assert.match(login, /className="h-\[18px\] w-\[18px\] accent-\[#02C551\]"/);

console.log("remember login contract passed");