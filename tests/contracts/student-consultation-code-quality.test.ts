import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const sharedCardPath = "src/fsd/shared/ui/SummaryActionCard.tsx";
assert.equal(existsSync(sharedCardPath), true, "generic shared summary card must exist");

const sharedCard = existsSync(sharedCardPath) ? readFileSync(sharedCardPath, "utf8") : "";
const sharedIndex = readFileSync("src/fsd/shared/ui/index.ts", "utf8");
const home = readFileSync("src/fsd/widgets/home-services/ui/HomeServices.tsx", "utf8");
const profile = readFileSync("src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx", "utf8");
const hook = readFileSync("src/fsd/features/submit-consultation/model/useConsultationForm.ts", "utf8");
const form = readFileSync("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx", "utf8");
const globals = readFileSync("app/globals.css", "utf8");

assert.doesNotMatch(sharedCard, /Consultation|상담|예약 취소/);
assert.match(sharedCard, /title/);
assert.match(sharedCard, /detail/);
assert.match(sharedCard, /actionLabel/);
assert.doesNotMatch(sharedCard, /#[0-9A-Fa-f]{6}/);
assert.match(sharedIndex, /SummaryActionCard/);
assert.match(home, /SummaryActionCard/);
assert.match(profile, /SummaryActionCard/);
assert.doesNotMatch(home, /ConsultationReservationCard/);
assert.doesNotMatch(profile, /ConsultationReservationCard/);
assert.match(hook, /teacherStatus/);
assert.match(hook, /setTeacherStatus\("ready"\)/);
assert.match(hook, /setTeacherStatus\("error"\)/);
assert.match(form, /teacherStatus === "loading"/);
assert.match(form, /teacherStatus === "error"/);
assert.match(form, /선생님 정보를 불러오지 못했습니다/);

assert.match(globals, /--color-panel:/);
assert.match(globals, /--color-secondary-text:/);
assert.match(globals, /--color-disabled-text:/);

console.log("student consultation code quality contract passed");
