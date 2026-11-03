import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const countdownPath = "src/fsd/shared/lib/countdown.ts";
const countdownHookPath = "src/fsd/shared/lib/useCountdown.ts";
const passwordFieldPath = "src/fsd/shared/ui/PasswordField.tsx";
const textFieldPath = "src/fsd/shared/ui/TextField.tsx";

for (const path of [countdownPath, countdownHookPath, passwordFieldPath]) {
  assert.equal(existsSync(path), true, `${path} must exist`);
}

const { formatCountdown, getCountdownSecondsLeft } = await import("../../src/fsd/shared/lib/countdown.ts");
assert.equal(formatCountdown(180), "03:00");
assert.equal(formatCountdown(65), "01:05");
assert.equal(formatCountdown(-10), "00:00");

const countdownHook = readFileSync(countdownHookPath, "utf8");
assert.match(countdownHook, /window\.setInterval/);
for (const [deadline, now, expected] of [
  [null, 1000, 0],
  [181000, 1000, 180],
  [181000, 1001, 180],
  [181000, 180001, 1],
  [181000, 181000, 0],
  [181000, 182000, 0],
] as const) {
  assert.equal(getCountdownSecondsLeft(deadline, now), expected);
}
const passwordField = readFileSync(passwordFieldPath, "utf8");
const textField = readFileSync(textFieldPath, "utf8");
assert.match(passwordField, /TextField/);
assert.match(passwordField, /useState\(false\)/);
assert.match(passwordField, /isVisible \? "text" : "password"/);
assert.match(passwordField, /비밀번호 보기/);
assert.match(passwordField, /비밀번호 숨기기/);
assert.match(textField, /endElement/);

console.log("auth shared controls contract passed");
