import assert from "node:assert/strict";
import type { Recruit } from "../../src/fsd/entities/recruit/model/types.ts";
import { filterRecruits, isRecruitClosed } from "../../src/fsd/pages/recruit/model/recruitFilters.ts";
import { formatRecruitFields, RECRUIT_FIELD_OPTIONS } from "../../src/fsd/entities/recruit/model/fields.ts";

const now = new Date(2026, 8, 30, 12);
const base: Recruit = { id: 1, companyName: "Alpha", summary: "Frontend", deadline: null, interviewDate: null, status: "PUBLISHED", createdAt: "", updatedAt: "" };
const recruits: Recruit[] = [base, { ...base, id: 2, deadline: "2026-09-29" }, { ...base, id: 3, status: "CLOSED" }];
assert.equal(isRecruitClosed(base, now), false);
assert.equal(isRecruitClosed(recruits[1], now), true);
assert.equal(isRecruitClosed(recruits[2], now), true);
assert.deepEqual(filterRecruits(recruits, "OPEN", "", now).map((item) => item.id), [1]);
assert.deepEqual(filterRecruits(recruits, "CLOSED", "", now).map((item) => item.id), [2, 3]);
assert.equal(filterRecruits(recruits, "ALL", " ALPHA ", now).length, 3);
assert.equal(filterRecruits(recruits, "ALL", "frontend", now).length, 3);
assert.equal(filterRecruits(recruits, "ALL", "missing", now).length, 0);
assert.equal(filterRecruits([{ ...base, companyName: null, summary: null }], "ALL", "alpha", now).length, 0);

const withFields: Recruit[] = [
  { ...base, fields: ["FRONTEND", "BACKEND"] },
  { ...base, id: 2, fields: ["AI"], status: "CLOSED" },
  { ...base, id: 3, fields: [] },
  { ...base, id: 4 },
];
assert.equal(RECRUIT_FIELD_OPTIONS.length, 8);
assert.equal(formatRecruitFields(["FRONTEND", "BACKEND"]), "프론트엔드, 백엔드");
assert.equal(formatRecruitFields([]), "미정");
assert.equal(formatRecruitFields(undefined), "미정");
assert.deepEqual(filterRecruits(withFields, "ALL", "", now, ["BACKEND"]).map((item) => item.id), [1]);
assert.equal(filterRecruits(withFields, "OPEN", "", now, ["AI"]).length, 0);
assert.equal(filterRecruits(withFields, "ALL", "백엔드", now).length, 1);
assert.equal(filterRecruits(withFields, "ALL", "alpha", now, ["FRONTEND"]).length, 1);
assert.deepEqual(
  filterRecruits(withFields, "ALL", "", now, ["FRONTEND", "AI"]).map((item) => item.id),
  [1, 2],
);
assert.deepEqual(
  filterRecruits(withFields, "ALL", "", now, []).map((item) => item.id),
  [1, 2, 3, 4],
);
