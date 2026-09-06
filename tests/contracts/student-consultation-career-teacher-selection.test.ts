import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getConsultationTeacherOptions,
  getDefaultGeneralTeacher,
} from "../../src/fsd/features/submit-consultation/model/teacherOption.ts";

const teachers = [
  { id: 9, name: "정윤기" },
  { id: 3, name: "임경원" },
  { id: 5, name: "김권예소" },
];

assert.equal(getDefaultGeneralTeacher(teachers)?.id, 3);
assert.equal(getDefaultGeneralTeacher([{ id: 7, name: "다른선생님" }])?.id, 7);
assert.equal(getDefaultGeneralTeacher([]), null);
assert.equal(getConsultationTeacherOptions("career", teachers), teachers);
assert.deepEqual(getConsultationTeacherOptions("general", teachers), []);

const form = readFileSync("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx", "utf8");
const hook = readFileSync("src/fsd/features/submit-consultation/model/useConsultationForm.ts", "utf8");

assert.match(form, /counselType === "career"/);
assert.match(form, /상담 선생님/);
assert.match(hook, /getDefaultGeneralTeacher/);
console.log("student consultation career teacher selection contract passed");