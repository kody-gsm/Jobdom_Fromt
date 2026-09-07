import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const api = read("src/fsd/features/submit-consultation/api/consultation.ts");
const hook = read("src/fsd/features/submit-consultation/model/useConsultationForm.ts");

assert.match(api, /ConsultationSlotStatus/);
assert.match(api, /getConsultationSlotStatus/);
assert.match(api, /\/student\/\$\{kind\}\/status/);
assert.match(api, /teacherId/);
assert.match(api, /date/);
assert.match(api, /available:\s*boolean/);

assert.match(hook, /getConsultationSlotStatus/);
assert.match(hook, /toConsultationKind\(counselType\)/);
assert.match(hook, /selectedTeacher\.id/);
assert.doesNotMatch(hook, /selectedTeacherId|setSelectedTeacherId/);
assert.match(hook, /selectedDate/);
assert.match(hook, /!item\.available/);
assert.match(hook, /serverUnavailablePeriods/);
assert.match(hook, /serverUnavailablePeriods\.has\(time\)/);
assert.match(hook, /setSelectedTime\(null\)/);

console.log("student consultation slot status api contract passed");
