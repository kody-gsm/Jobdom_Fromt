import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

assert.equal(existsSync("app/components"), false);
assert.equal(existsSync("app/utils"), false);
assert.ok(existsSync("src/fsd/app/auth-gate/index.ts"));
assert.ok(existsSync("src/fsd/app/auth-gate/ui/AuthGate.tsx"));
assert.ok(existsSync("src/fsd/app/auth-gate/model/routePolicy.ts"));

const layout = read("app/layout.tsx");
assert.match(layout, /@fsd\/app\/auth-gate/);
assert.doesNotMatch(layout, /@\/app\/components/);

const { getAuthRedirect } = await import("../../src/fsd/app/auth-gate/model/routePolicy.ts");
assert.equal(getAuthRedirect("/teacher", "STUDENT"), "/");
assert.equal(getAuthRedirect("/teacher", "TEACHER"), null);
assert.equal(getAuthRedirect("/admin", "TEACHER"), "/teacher");
assert.equal(getAuthRedirect("/admin", "ADMIN"), null);
assert.equal(getAuthRedirect("/profile", "ADMIN"), "/admin");

const packageJson = JSON.parse(read("package.json"));
assert.equal(packageJson.scripts["check:api"], "node --no-warnings --experimental-strip-types tests/contracts/api-contract.test.ts");
assert.equal(packageJson.scripts["check:forms"], "node --no-warnings --experimental-strip-types tests/contracts/form-answers.test.ts");
assert.equal(existsSync("scripts/api-contract-check.ts"), false);
assert.equal(existsSync("scripts/form-answers-check.ts"), false);
assert.ok(existsSync("tests/contracts/api-contract.test.ts"));
assert.ok(existsSync("tests/contracts/form-answers.test.ts"));
