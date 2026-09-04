import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getAuthRedirect } from "../../src/fsd/app/auth-gate/model/routePolicy.ts";

assert.equal(getAuthRedirect("/login", null), null);
assert.equal(getAuthRedirect("/signup", null), null);
assert.equal(getAuthRedirect("/forgot-password", null), null);
assert.equal(getAuthRedirect("/", null), "/login");
assert.equal(getAuthRedirect("/profile", null), "/login");
assert.equal(getAuthRedirect("/teacher", null), "/login");
assert.equal(getAuthRedirect("/teacher/forms", "STUDENT"), "/");
assert.equal(getAuthRedirect("/profile", "TEACHER"), "/teacher");
assert.equal(getAuthRedirect("/admin", "STUDENT"), "/");
assert.equal(getAuthRedirect("/admin", "TEACHER"), "/teacher");
assert.equal(getAuthRedirect("/admin", "ADMIN"), null);
assert.equal(getAuthRedirect("/teacher", "ADMIN"), "/admin");
assert.equal(getAuthRedirect("/counsel", "STUDENT"), null);
assert.equal(getAuthRedirect("/teacher/recruit", "TEACHER"), null);

const layout = readFileSync(resolve(process.cwd(), "app/layout.tsx"), "utf8");
assert.match(layout, /AuthGate/);
assert.match(layout, /<AuthGate>\{children\}<\/AuthGate>/);

console.log("auth route guard contract passed");
