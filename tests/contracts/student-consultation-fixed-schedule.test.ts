import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const helper = readFileSync(resolve(process.cwd(), "src/fsd/features/submit-consultation/model/schedulePresentation.ts"), "utf8");
const form = readFileSync(resolve(process.cwd(), "src/fsd/features/submit-consultation/ui/ConsultationForm.tsx"), "utf8");

assert.match(helper, /CONSULTATION_SCHEDULE_ROWS/);
assert.match(helper, /"1교시"[\s\S]*"2교시"[\s\S]*"3교시"[\s\S]*"4교시"[\s\S]*"점심시간"[\s\S]*"5교시"[\s\S]*"6교시"[\s\S]*"7교시"/);
assert.match(form, /CONSULTATION_SCHEDULE_ROWS\.map/);
assert.doesNotMatch(form, /times\.map/);
assert.match(form, /selectedTeacherId !== null && !times\.includes\(row\.period\)/);
assert.match(form, /min-h-\[720px\]/);
assert.match(form, /lg:grid-cols-\[minmax\(0,1fr\)_520px\]/);

console.log("student consultation fixed schedule contract passed");
