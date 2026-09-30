import assert from "node:assert/strict";
import type { Recruit } from "../../src/fsd/entities/recruit/model/types.ts";
import { filterRecruits, isRecruitClosed } from "../../src/fsd/pages/recruit/model/recruitFilters.ts";

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
