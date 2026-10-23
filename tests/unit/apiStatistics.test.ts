import assert from "node:assert/strict";
import {
  fillApiStatisticsDays,
  getApiStatisticsFilterError,
  getDefaultApiStatisticsFilter,
  getErrorRate,
} from "../../src/fsd/features/view-api-statistics/model/apiStatistics.ts";

assert.deepEqual(getDefaultApiStatisticsFilter(new Date("2026-10-22T16:00:00Z")), { from: "2026-09-24", to: "2026-10-23" });

assert.equal(getApiStatisticsFilterError({ from: "2026-02-30", to: "2026-03-01" }), "올바른 조회 날짜를 선택해 주세요.");
assert.equal(getApiStatisticsFilterError({ from: "2026-10-02", to: "2026-10-01" }), "시작일은 종료일보다 늦을 수 없습니다.");
assert.equal(getApiStatisticsFilterError({ from: "2026-10-01", to: "2026-10-01" }), "");
assert.equal(getApiStatisticsFilterError({ from: "2025-10-01", to: "2026-10-01" }), "");
assert.equal(getApiStatisticsFilterError({ from: "2025-09-30", to: "2026-10-01" }), "조회 기간은 최대 366일까지 선택할 수 있습니다.");

assert.deepEqual(fillApiStatisticsDays("2026-02-27", "2026-03-02", [
  { date: "2026-02-28", calls: 5, errorCalls: 1 },
  { date: "2026-03-02", calls: 2, errorCalls: 0 },
]), [
  { date: "2026-02-27", calls: 0, errorCalls: 0 },
  { date: "2026-02-28", calls: 5, errorCalls: 1 },
  { date: "2026-03-01", calls: 0, errorCalls: 0 },
  { date: "2026-03-02", calls: 2, errorCalls: 0 },
]);
assert.equal(fillApiStatisticsDays("2026-10-01", "2026-10-01", []).length, 1);

assert.equal(getErrorRate(0, 0), 0);
assert.equal(getErrorRate(3, 1), 33.3);
assert.equal(getErrorRate(200, 200), 100);
