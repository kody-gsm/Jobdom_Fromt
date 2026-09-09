import assert from "node:assert/strict";
import {
  decodeProfileConsultationId,
  toProfileConsultation,
} from "../../src/fsd/entities/consultation/model/profile.ts";
import {
  buildUserProfileData,
} from "../../src/fsd/pages/profile/model/buildUserProfileData.ts";

const course = { id: 3, name: "학생", date: "2026-09-05", period: "2교시" };
const common = { id: 4, name: "학생", date: "2026-09-08", period: "점심시간" };

assert.deepEqual(toProfileConsultation("course", course), {
  id: 6,
  type: "진로상담",
  date: "2026.09.05",
  slot: "2교시",
});
assert.deepEqual(toProfileConsultation("common", common), {
  id: 9,
  type: "일반상담",
  date: "2026.09.08",
  slot: "점심시간",
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
assert.equal("studentId" in profile, false);
assert.deepEqual(profile.reservations.map((item) => item.id), [6, 9]);
assert.equal("history" in profile, false);

console.log("profile contract passed");
