import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");
const route = read("app/teacher/page.tsx");
const page = read("src/fsd/pages/teacher/ui/TeacherPage.tsx");
const homeLogo = read("src/fsd/features/navigate-home/ui/HomeLogoButton.tsx");
const legacyLogo = read("app/components/atoms/HomeLogoButton.tsx");

assert.match(route, /@fsd\/pages\/teacher/);
assert.doesNotMatch(route, /useState|getTeacherConsultations|approveConsultation/);
assert.match(page, /취업 공고 관리/);
assert.match(page, /진로 상담/);
assert.match(page, /WEEKLY_CLASS_SCHEDULE/);
assert.match(page, /getTeacherConsultations\("course"\)/);
assert.match(page, /approveConsultation\("course",\s*reservationId\)/);
assert.match(page, /상담 예약 요청 목록/);
assert.match(page, /예약 확정 정보/);
assert.match(page, /@fsd\/features\/navigate-home/);
assert.doesNotMatch(page, /@\/app\/utils\/api|@\/app\/components/);
assert.match(homeLogo, /getSession\(\)\?\.role === "STUDENT"/);
assert.match(homeLogo, /router\.push\("\/"\)/);
assert.match(legacyLogo, /@fsd\/features\/navigate-home/);

console.log("teacher consultation page contract passed");
