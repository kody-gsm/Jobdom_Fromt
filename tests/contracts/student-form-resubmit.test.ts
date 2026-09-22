import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/fsd/features/submit-form/ui/SubmitForm.tsx", "utf8");

assert.match(
  source,
  /onClick=\{\(event\) => \{[\s\S]{0,120}event\.preventDefault\(\)[\s\S]{0,120}setEditing\(true\)/,
  "re-response must not submit the form while switching into editing mode",
);

assert.match(
  source,
  /event\.preventDefault\(\);[\s\S]{0,120}setMessage\(null\);[\s\S]{0,120}setEditing\(true\)/,
  "re-response must clear the previous submission message before editing",
);

console.log("student form resubmit contract passed");
