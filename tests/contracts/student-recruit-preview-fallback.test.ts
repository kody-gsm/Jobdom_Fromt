import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const hook = readFileSync("src/fsd/pages/recruit/model/useRecruitList.ts", "utf8");
const page = readFileSync("src/fsd/pages/recruit/ui/RecruitPage.tsx", "utf8");

assert.equal(existsSync("src/fsd/pages/recruit/model/previewRecruits.ts"), false);
assert.doesNotMatch(hook, /withRecruitPreviewFallback|previewRecruits/);
assert.match(hook, /setItems\(data\)/);
assert.doesNotMatch(page, /item\.id < 0|const preview/);
assert.match(page, /현재 공개된 취업 공고가 없습니다/);
assert.match(page, /bg-brand/);
console.log("student recruit real-data-only contract passed");