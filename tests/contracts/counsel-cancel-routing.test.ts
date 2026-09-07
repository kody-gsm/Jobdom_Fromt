import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "src/fsd/features/submit-consultation/model/useConsultationForm.ts"),
  "utf8",
);
const cancelHandler = source.match(
  /const handleCancel = \(\) => \{([\s\S]*?)\n  \};/,
)?.[1];

assert.ok(cancelHandler, "handleCancel should exist");
assert.match(cancelHandler, /setTitle\(""\)/);
assert.match(cancelHandler, /setContent\(""\)/);
assert.match(cancelHandler, /setSelectedTeacher\(null\)/);
assert.match(cancelHandler, /setSelectedDate\(null\)/);
assert.match(cancelHandler, /setSelectedTime\(null\)/);
assert.match(cancelHandler, /router\.push\("\/"\)/);
assert.doesNotMatch(cancelHandler, /showToast\(/);

console.log("counsel cancel routing contract passed");
