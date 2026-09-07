import assert from "node:assert/strict";
import { createRecruitApi } from "../../src/fsd/entities/recruit/api/createRecruitApi.ts";
import { createRecruitApplyUrl } from "../../src/fsd/features/copy-recruit-link/model/createRecruitApplyUrl.ts";

const calls: Array<{ path: string; init?: RequestInit }> = [];
const api = createRecruitApi(async <T>(path: string, init?: RequestInit) => {
  calls.push({ path, init });
  return [] as T;
});

await api.getAll();
await api.getById(7);
assert.deepEqual(calls, [
  { path: "/recruit", init: undefined },
  { path: "/recruit/7", init: undefined },
]);

assert.equal(
  createRecruitApplyUrl("https://jobdam.example", 7),
  "https://jobdam.example/recruit/7/apply",
);
assert.equal(
  createRecruitApplyUrl("https://jobdam.example/", 7),
  "https://jobdam.example/recruit/7/apply",
);

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const listRoute = read("app/recruit/page.tsx");
const detailRoute = read("app/recruit/[id]/page.tsx");
const applyRoute = read("app/recruit/[id]/apply/page.tsx");
const listPage = read("src/fsd/pages/recruit/ui/RecruitPage.tsx");
const detailPage = read("src/fsd/pages/recruit-detail/ui/RecruitDetailPage.tsx");
const listHook = read("src/fsd/pages/recruit/model/useRecruitList.ts");

assert.match(listRoute, /@fsd\/pages\/recruit/);
assert.match(detailRoute, /@fsd\/pages\/recruit-detail/);
assert.doesNotMatch(listRoute, /useState|useEffect|getRecruits/);
assert.doesNotMatch(detailRoute, /useState|useEffect|getRecruit/);
assert.match(applyRoute, /redirect\("\/forms"\)/);
assert.match(listHook, /로그인 후 취업 공고를 확인할 수 있습니다\./);
assert.match(listPage, /href="\/forms"/);
assert.match(detailPage, /@fsd\/features\/copy-recruit-link/);
assert.match(detailPage, /href="\/forms"/);
