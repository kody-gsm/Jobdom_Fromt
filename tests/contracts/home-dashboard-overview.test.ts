import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildHomeOverview } from "../../src/fsd/widgets/home-services/model/overview.ts";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const modelPath = "src/fsd/widgets/home-services/model/overview.ts";
const hookPath = "src/fsd/widgets/home-services/model/useHomeOverview.ts";
assert.ok(existsSync(modelPath));
assert.ok(existsSync(hookPath));

const services = read("src/fsd/widgets/home-services/ui/HomeServices.tsx");
const overview = buildHomeOverview({
  course: [
    { id: 2, name: "A", date: "2026-09-08", period: "3교시" },
    { id: 1, name: "B", date: "2026-09-06", period: "2교시" },
    { id: 4, name: "D", date: "2026-09-09", period: "4교시" },
  ],
  common: [{ id: 3, name: "C", date: "2026-09-07", period: "1교시" }],
  recruits: [
    { id: 1, companyName: "old", interviewDate: null, deadline: null, summary: null, status: "PUBLISHED", createdAt: "2026-09-01", updatedAt: "2026-09-01" },
    { id: 2, companyName: "draft", interviewDate: null, deadline: null, summary: null, status: "DRAFT", createdAt: "2026-09-05", updatedAt: "2026-09-05" },
    { id: 3, companyName: "new", interviewDate: null, deadline: null, summary: null, status: "PUBLISHED", createdAt: "2026-09-04", updatedAt: "2026-09-04" },
    { id: 4, companyName: "middle", interviewDate: null, deadline: null, summary: null, status: "PUBLISHED", createdAt: "2026-09-03", updatedAt: "2026-09-03" },
  ],
});

assert.equal(overview.upcomingConsultations.length, 4, "modal needs the full consultation collection");
assert.deepEqual(overview.upcomingConsultations.map((item) => item.date), ["2026-09-06", "2026-09-07", "2026-09-08", "2026-09-09"]);
assert.deepEqual(overview.recentRecruits.map((item) => item.id), [3, 4]);
assert.match(services, /useState/);
assert.match(services, /role="dialog"/);
assert.match(services, /상담 신청/);
assert.match(services, /예정 상담/);
assert.match(services, /등록된 배너가 없습니다\./);
assert.doesNotMatch(services, />BANNER</);
assert.match(services, /취업 공고/);
assert.doesNotMatch(services, /href="\/profile"/);
assert.doesNotMatch(services, /상담 신청하기/);

console.log("home dashboard overview contract passed");
