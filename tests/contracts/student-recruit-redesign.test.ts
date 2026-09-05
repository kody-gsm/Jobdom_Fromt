import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const listHookPath = "src/fsd/pages/recruit/model/useRecruitList.ts";
const detailHookPath = "src/fsd/pages/recruit-detail/model/useRecruitDetail.ts";

assert.ok(existsSync(listHookPath), "recruit list hook is required");
assert.ok(existsSync(detailHookPath), "recruit detail hook is required");

const listPage = read("src/fsd/pages/recruit/ui/RecruitPage.tsx");
const detailPage = read("src/fsd/pages/recruit-detail/ui/RecruitDetailPage.tsx");
const listHook = read(listHookPath);
const detailHook = read(detailHookPath);

assert.match(listPage, /StudentHeader/);
assert.match(detailPage, /StudentHeader/);
assert.doesNotMatch(listPage, /SiteHeader/);
assert.doesNotMatch(detailPage, /SiteHeader/);

assert.match(listPage, /ContentCard/);
assert.match(detailPage, /ContentCard/);
assert.match(listPage, /useRecruitList/);
assert.match(detailPage, /useRecruitDetail/);
assert.doesNotMatch(listPage, /useState|useEffect|getRecruits/);
assert.doesNotMatch(detailPage, /useState|useEffect|getRecruit/);

assert.match(listHook, /getRecruits/);
assert.match(detailHook, /getRecruit/);
assert.match(listPage, /학생 취업 공고/);
assert.match(detailPage, /공고 상세/);
assert.match(detailPage, /href="\/recruit"[^\n]*min-h-11/);
