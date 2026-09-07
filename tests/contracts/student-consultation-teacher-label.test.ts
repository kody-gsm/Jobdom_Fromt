import assert from "node:assert/strict";
import { existsSync } from "node:fs";

const helperPath = "src/fsd/features/submit-consultation/model/teacherOption.ts";
assert.ok(existsSync(helperPath), "teacher label normalizer must exist");

const { getConsultationTeacherLabel } = await import(`../../${helperPath}`);
assert.equal(getConsultationTeacherLabel("임경원"), "임경원 선생님");
assert.equal(getConsultationTeacherLabel("임경원 선생님"), "임경원 선생님");
assert.equal(getConsultationTeacherLabel("김권예소"), "김권예소 선생님");

console.log("student consultation teacher label contract passed");
