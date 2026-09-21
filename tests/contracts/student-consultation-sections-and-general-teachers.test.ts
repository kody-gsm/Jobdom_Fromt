import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const form = readFileSync(
  "src/fsd/features/submit-consultation/ui/ConsultationForm.tsx",
  "utf8",
);
const teacherOption = readFileSync(
  "src/fsd/features/submit-consultation/model/teacherOption.ts",
  "utf8",
);
const hook = readFileSync(
  "src/fsd/features/submit-consultation/model/useConsultationForm.ts",
  "utf8",
);

assert.doesNotMatch(teacherOption, /getDefaultGeneralTeacher/);
assert.match(form, /displayTeachers\.map/);
assert.doesNotMatch(form, /상담 선생님 배정 중/);
assert.doesNotMatch(hook, /getDefaultGeneralTeacher/);
assert.doesNotMatch(hook, /selectedTeacherId|setSelectedTeacherId/);
