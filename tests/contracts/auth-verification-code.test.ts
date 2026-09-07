import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const credentialsPath = "src/fsd/entities/user/model/credentials.ts";
const credentials = readFileSync(credentialsPath, "utf8");
assert.match(credentials, /normalizeVerificationCode/);

const { normalizeVerificationCode } = await import(
  "../../src/fsd/entities/user/model/credentials.ts"
);
assert.equal(normalizeVerificationCode("12a3-45b6"), "123456");
assert.equal(normalizeVerificationCode("12345678"), "123456");
assert.equal(normalizeVerificationCode("abc"), "");

console.log("auth verification code contract passed");
