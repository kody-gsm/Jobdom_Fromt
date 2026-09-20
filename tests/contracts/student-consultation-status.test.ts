import assert from "node:assert/strict";
import {
  getReservationPresentation,
  isActiveReservation,
} from "../../src/fsd/entities/consultation/model/status.ts";
import { toProfileConsultation } from "../../src/fsd/entities/consultation/model/profile.ts";

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
assert.equal(isActiveReservation("CANCELED"), false);
assert.equal(isActiveReservation(undefined as never), false);
assert.equal(getReservationPresentation(undefined as never).status, "CANCELED");

assert.equal(
  toProfileConsultation("course", {
    id: 1,
    name: "학생",
    date: "2026-09-21",
    period: "1교시",
    status: "WAITING",
  }).status,
  "WAITING",
);

console.log("student consultation status contract passed");
