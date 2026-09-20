import assert from "node:assert/strict";
import { getReservationPresentation, isActiveReservation } from "./status.ts";

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

console.log("consultation status presentation test passed");
