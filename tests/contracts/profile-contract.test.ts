import assert from "node:assert/strict";
import {
  decodeProfileConsultationId,
  toProfileConsultation,
} from "../../src/fsd/entities/consultation/model/profile.ts";
import {
  buildUserProfileData,
  formatStudentNumber,
} from "../../src/fsd/pages/profile/model/buildUserProfileData.ts";

const course = { id: 3, name: "학생", teacherId: 11, teacherName: "임경원 선생님", date: "2026-09-05", period: "2교시", status: "WAITING" as const };
const common = { id: 4, name: "학생", teacherId: 12, teacherName: "강우빈 선생님", date: "2026-09-08", period: "점심시간", status: "RESERVED" as const };

assert.deepEqual(toProfileConsultation("course", course), {
  id: 6,
  reservationId: 3,
  kind: "course",
  type: "진로상담",
  date: "2026.09.05",
  slot: "2교시",
  period: "2교시",
  teacherId: 11,
  teacherName: "임경원 선생님",
  title: "",
  content: "",
  category: null,
  status: "WAITING",
});
assert.deepEqual(toProfileConsultation("common", common), {
  id: 9,
  reservationId: 4,
  kind: "common",
  type: "일반상담",
  date: "2026.09.08",
  slot: "점심시간",
  period: "점심시간",
  teacherId: 12,
  teacherName: "강우빈 선생님",
  title: "",
  content: "",
  category: null,
  status: "RESERVED",
});

assert.deepEqual(decodeProfileConsultationId(6), { kind: "course", reservationId: 3 });
assert.deepEqual(decodeProfileConsultationId(9), { kind: "common", reservationId: 4 });

const profile = buildUserProfileData({
  upcomingCourse: [course],
  upcomingCommon: [common],
  session: { name: "배순우", email: "2401@gsm.hs.kr" },
  profile: { name: "배순우", email: "2401@gsm.hs.kr", student_number: "2-4-11" },
});

assert.equal(profile.name, "배순우");
assert.equal(profile.studentId, "2학년 4반 11번");
assert.equal(formatStudentNumber("2111"), "2학년 1반 11번");
assert.equal(formatStudentNumber("2-1-11"), "2학년 1반 11번");
assert.deepEqual(profile.reservations.map((item) => item.id), [6, 9]);
assert.equal("history" in profile, false);

console.log("profile contract passed");
