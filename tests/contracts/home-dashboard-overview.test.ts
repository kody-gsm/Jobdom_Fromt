import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildHomeOverview } from "../../src/fsd/widgets/home-services/model/overview.ts";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const modelPath = "src/fsd/widgets/home-services/model/overview.ts";
const hookPath = "src/fsd/widgets/home-services/model/useHomeOverview.ts";

assert.ok(existsSync(modelPath), "home overview pure model is required");
assert.ok(existsSync(hookPath), "home overview hook is required");

const model = read(modelPath);
const hook = read(hookPath);
const services = read("src/fsd/widgets/home-services/ui/HomeServices.tsx");

assert.match(model, /buildHomeOverview/);
assert.match(model, /upcomingConsultations/);
assert.match(model, /recentRecruits/);

assert.match(hook, /createConsultationApi/);
assert.match(hook, /createRecruitApi/);
assert.match(hook, /requestWithSession/);
assert.match(hook, /getUpcoming\("course"\)/);
assert.match(hook, /getUpcoming\("common"\)/);
assert.match(hook, /getAll\(\)/);

assert.match(services, /useHomeOverview/);
assert.match(services, /예정 상담/);
assert.match(services, /최근 취업 공고/);
assert.match(services, /\/profile/);

const overview = buildHomeOverview({
  course: [
    { id: 2, name: "A", date: "2026-09-08", period: "3교시" },
    { id: 1, name: "B", date: "2026-09-06", period: "2교시" },
  ],
  common: [
    { id: 3, name: "C", date: "2026-09-07", period: "1교시" },
  ],
  recruits: [
    { id: 1, companyName: "old", interviewDate: null, deadline: null, summary: null, status: "PUBLISHED", createdAt: "2026-09-01", updatedAt: "2026-09-01" },
    { id: 2, companyName: "draft", interviewDate: null, deadline: null, summary: null, status: "DRAFT", createdAt: "2026-09-05", updatedAt: "2026-09-05" },
    { id: 3, companyName: "new", interviewDate: null, deadline: null, summary: null, status: "PUBLISHED", createdAt: "2026-09-04", updatedAt: "2026-09-04" },
    { id: 4, companyName: "middle", interviewDate: null, deadline: null, summary: null, status: "PUBLISHED", createdAt: "2026-09-03", updatedAt: "2026-09-03" },
  ],
});

assert.deepEqual(
  overview.upcomingConsultations.map((item) => [item.type, item.date]),
  [
    ["진로상담", "2026-09-06"],
    ["일반상담", "2026-09-07"],
    ["진로상담", "2026-09-08"],
  ],
);
assert.deepEqual(overview.recentRecruits.map((item) => item.id), [3, 4]);
assert.ok((services.match(/min-h-11/g) ?? []).length >= 3);
