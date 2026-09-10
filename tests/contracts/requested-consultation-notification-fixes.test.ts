import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createReservationInput,
  getAvailablePeriods,
} from "../../src/fsd/entities/consultation/model/rules.ts";
import {
  canManageHomeBanner,
  getTeacherWorkspaceVariant,
} from "../../src/fsd/pages/teacher/model/workspace.ts";
import { formatNotificationTime } from "../../src/fsd/features/notifications/model/time.ts";

assert.deepEqual(getAvailablePeriods("career", "임경원 선생님"), [
  "1교시", "2교시", "3교시", "4교시", "5교시", "6교시", "7교시", "8교시", "9교시",
]);
assert.deepEqual(getAvailablePeriods("career", "김권예소 선생님"), ["점심시간", "저녁시간"]);
assert.deepEqual(getAvailablePeriods("career", "정윤기 선생님"), ["점심시간", "저녁시간"]);
assert.equal(getTeacherWorkspaceVariant("임경원 선생님"), "im-gyeongwon");
assert.equal(getTeacherWorkspaceVariant("김권예소"), "kim-gwon-yeso");
assert.equal(getTeacherWorkspaceVariant("정윤기"), "jeong-yungi");
assert.equal(getTeacherWorkspaceVariant("강우빈"), "general");
assert.equal(canManageHomeBanner("강우빈"), true);
assert.equal(canManageHomeBanner("임경원"), false);

assert.equal(createReservationInput({
  type: "career",
  title: "취업 고민",
  content: "내용",
  teacher: "강우빈 선생님",
  date: "2026-09-10",
  period: "2교시",
}).title, "취업 고민");
assert.equal(createReservationInput({
  type: "general",
  title: "고민",
  content: "내용",
  teacher: "강우빈 선생님",
  date: "2026-09-10",
  period: "2교시",
}).category, "기타");

const now = Date.parse("2026-09-10T01:05:00Z");
assert.equal(formatNotificationTime("2026-09-10T01:00:00", now), "5분 전");
assert.equal(formatNotificationTime("2026-09-10T01:00:00Z", now), "5분 전");
assert.equal(formatNotificationTime("2026-09-10T01:06:00", now), "방금");

const read = (path: string) => readFileSync(path, "utf8");
const authGate = read("src/fsd/app/auth-gate/ui/AuthGate.tsx");
const form = read("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx");
const teacherPage = read("src/fsd/pages/teacher/ui/TeacherPage.tsx");
const home = read("src/fsd/widgets/home-services/ui/HomeServices.tsx");
const bell = read("src/fsd/features/notifications/ui/NotificationBell.tsx");

assert.doesNotMatch(authGate, /isAccessTokenExpired|clearSession/);
assert.match(form, /공강시간/);
assert.match(teacherPage, /canManageHomeBanner/);
assert.match(teacherPage, /학생 홈 배너/);
assert.match(home, /readHomeBanner/);
assert.match(bell, /bg-red-500/);
assert.match(bell, /unreadCount > 99 \? "99\+" : unreadCount/);

console.log("requested consultation and notification fixes contract passed");
