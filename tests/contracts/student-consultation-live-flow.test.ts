import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getConsultationTeacherLabel } from "../../src/fsd/entities/consultation/model/labels.ts";
import { getReservationPresentation } from "../../src/fsd/entities/consultation/model/status.ts";

const read = (path: string) => readFileSync(path, "utf8");

assert.equal(getConsultationTeacherLabel("임경원"), "임경원 선생님");
assert.equal(getConsultationTeacherLabel("임경원 선생님"), "임경원 선생님");
assert.deepEqual(getReservationPresentation("WAITING"), {
  status: "WAITING",
  statusLabel: "신청 대기",
  actionLabel: "신청 취소",
});
assert.deepEqual(getReservationPresentation("RESERVED"), {
  status: "RESERVED",
  statusLabel: "예약 확정",
  actionLabel: "예약 취소",
});

const dialog = read("src/fsd/entities/consultation/ui/ConsultationCancelDialog.tsx");
const home = read("src/fsd/widgets/home-services/ui/HomeServices.tsx");
const profile = read("src/fsd/widgets/profile-consultations/ui/ProfileConsultations.tsx");
const notifications = read("src/fsd/features/notifications/api/notifications.ts");
const stream = read("src/fsd/features/notifications/api/notificationStream.ts");
const notificationContext = read("src/fsd/features/notifications/model/NotificationContext.tsx");

assert.match(dialog, /target\.actionLabel/);
assert.match(dialog, /getConsultationTeacherLabel/);
assert.match(dialog, /confirming/);
assert.match(home, /ConsultationCancelDialog/);
assert.match(profile, /ConsultationCancelDialog/);
assert.match(home, /title=\{`\$\{item\.type\} · \$\{item\.teacherName\}/);
assert.match(profile, /title=\{`\$\{item\.type\} · \$\{item\.teacherName\}/);
assert.match(notifications, /COUNSELING_AUTO_CANCELED/);
assert.match(notifications, /COUNSELING_EXPIRED/);
assert.match(stream, /reservation/);
assert.match(notificationContext, /RESERVATION_CHANGED_EVENT/);

console.log("student consultation live flow contract passed");
