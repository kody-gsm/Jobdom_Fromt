import assert from "node:assert/strict";
import { formatDeadlineDate, isDeadlinePassed } from "../../src/fsd/shared/lib/deadline.ts";

const beforeEndOfDeadline = new Date(2026, 8, 29, 23, 59, 59, 998);
const afterDeadline = new Date(2026, 8, 30, 0, 0, 0);

assert.equal(isDeadlinePassed("2026-09-29", beforeEndOfDeadline), false);
assert.equal(isDeadlinePassed("2026-09-29", afterDeadline), true);
assert.equal(
  isDeadlinePassed("2026-09-29T23:59:59.999999999", afterDeadline),
  true,
);
assert.equal(
  formatDeadlineDate("2026-09-29T23:59:59.999999999"),
  "2026. 09. 29.",
);
assert.equal(formatDeadlineDate(null), "제한 없음");
assert.equal(formatDeadlineDate("알 수 없는 기한"), "알 수 없는 기한");

console.log("student deadline helper tests passed");
