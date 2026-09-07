import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getConsultationTeacherOptions } from "../../src/fsd/features/submit-consultation/model/teacherOption.ts";

const teachers = [
  { id: 9, name: "정윤기" },
  { id: 3, name: "임경원" },
  { id: 5, name: "김권예소" },
  { id: 7, name: "다른선생님" },
];

assert.equal(getConsultationTeacherOptions("career", teachers), teachers);
assert.deepEqual(
  getConsultationTeacherOptions("general", teachers).map((teacher) => teacher.id),
  [3, 5, 9],
);

const form = readFileSync("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx", "utf8");
const hook = readFileSync("src/fsd/features/submit-consultation/model/useConsultationForm.ts", "utf8");

assert.match(form, /displayTeachers\.map/);
assert.match(form, /onClick=\{\(\) => toggleTeacher\(teacher\)\}/);
assert.doesNotMatch(hook, /getDefaultGeneralTeacher/);
console.log("student consultation teacher selection contract passed");
