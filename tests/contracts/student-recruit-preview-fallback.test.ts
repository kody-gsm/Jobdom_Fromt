import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  withRecruitPreviewFallback,
} from "../../src/fsd/pages/recruit/model/previewRecruits.ts";

const real = [{
  id: 1,
  companyName: "실제 회사",
  interviewDate: "2026-09-20",
  deadline: "2026-09-18",
  summary: "실제 공고",
  status: "PUBLISHED" as const,
  createdAt: "2026-09-07T00:00:00",
  updatedAt: "2026-09-07T00:00:00",
}];

assert.equal(withRecruitPreviewFallback(real), real);
const preview = withRecruitPreviewFallback([]);
assert.equal(preview.length, 2);
assert.equal(preview[0].companyName, "광주테크솔루션");
assert.equal(preview[1].companyName, "스마트소프트");
assert.ok(preview.every((item) => item.id < 0));

const hook = readFileSync("src/fsd/pages/recruit/model/useRecruitList.ts", "utf8");
const page = readFileSync("src/fsd/pages/recruit/ui/RecruitPage.tsx", "utf8");
assert.match(hook, /withRecruitPreviewFallback/);
assert.match(page, /md:grid-cols-2/);
assert.doesNotMatch(page, /lg:grid-cols-3/);
assert.doesNotMatch(page, /공개 공고/);
assert.match(page, /bg-\[#02C551\]/);
console.log("student recruit preview fallback contract passed");