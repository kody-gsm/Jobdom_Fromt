import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getAuthRedirect } from "../../src/fsd/app/auth-gate/model/routePolicy.ts";
import { decodeUserRole, getRoleHomePath } from "../../src/fsd/entities/user/model/role.ts";

const tokenWithRole = (role: string) => `header.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;

assert.equal(getAuthRedirect("/login", null), null);
assert.equal(getAuthRedirect("/signup", null), null);
assert.equal(getAuthRedirect("/forgot-password", null), null);
assert.equal(getAuthRedirect("/", null), "/login");
assert.equal(getAuthRedirect("/profile", null), "/login");
assert.equal(getAuthRedirect("/teacher", null), "/login");
assert.equal(getAuthRedirect("/teacher/forms", "STUDENT"), "/");
assert.equal(getAuthRedirect("/profile", "TEACHER"), null);
assert.equal(getAuthRedirect("/admin", "STUDENT"), "/");
assert.equal(getAuthRedirect("/admin", "TEACHER"), "/teacher");
assert.equal(getAuthRedirect("/admin", "ADMIN"), null);
assert.equal(getAuthRedirect("/teacher", "ADMIN"), "/admin");
assert.equal(getAuthRedirect("/counsel", "STUDENT"), null);
assert.equal(getAuthRedirect("/teacher/recruit", "TEACHER"), null);
assert.equal(getAuthRedirect("/teacher", "WEE_TEACHER"), null);
assert.equal(getAuthRedirect("/counsel", "WEE_TEACHER"), "/teacher");
assert.equal(decodeUserRole(tokenWithRole("WEE_TEACHER")), "WEE_TEACHER");
assert.equal(getRoleHomePath("WEE_TEACHER"), "/teacher");

const layout = readFileSync(resolve(process.cwd(), "app/layout.tsx"), "utf8");
assert.match(layout, /AuthGate/);
assert.match(layout, /<AuthGate>\{children\}<\/AuthGate>/);

console.log("auth route guard contract passed");
