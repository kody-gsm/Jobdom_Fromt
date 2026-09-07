import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");
const schedulePath = "src/fsd/entities/consultation/model/schedule.ts";

assert.ok(existsSync(schedulePath), "consultation schedule must have one entity source");
const schedule = existsSync(schedulePath) ? read(schedulePath) : "";
const timePolicy = read("src/fsd/entities/consultation/model/timePolicy.ts");
const presentation = read("src/fsd/features/submit-consultation/model/schedulePresentation.ts");
const teacherOption = read("src/fsd/features/submit-consultation/model/teacherOption.ts");
const hook = read("src/fsd/features/submit-consultation/model/useConsultationForm.ts");

assert.match(schedule, /CONSULTATION_SCHEDULE/);
assert.match(schedule, /startHour/);
assert.match(schedule, /time/);
assert.match(timePolicy, /getConsultationScheduleItem|CONSULTATION_SCHEDULE/);
assert.doesNotMatch(timePolicy, /PERIOD_STARTS/);
assert.match(presentation, /CONSULTATION_SCHEDULE/);
assert.doesNotMatch(presentation, /08:40 - 09:30/);
assert.doesNotMatch(teacherOption, /as ConsultationTeacher/);
assert.match(hook, /useState<ConsultationTeacherOption \| null>/);
assert.doesNotMatch(hook, /setSelectedTeacherId|useState<ConsultationTeacher \| null>/);

console.log("student consultation domain quality contract passed");
