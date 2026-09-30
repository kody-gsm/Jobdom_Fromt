import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const listModel = read("src/fsd/pages/recruit/model/useRecruitList.ts");
const listPage = read("src/fsd/pages/recruit/ui/RecruitPage.tsx");
const detailModel = read("src/fsd/pages/recruit-detail/model/useRecruitDetail.ts");
const detailPage = read("src/fsd/pages/recruit-detail/ui/RecruitDetailPage.tsx");

assert.match(listModel, /retry/);
assert.match(listPage, /onClick=\{retry\}/);
assert.match(listPage, /error[\s\S]*items\.length === 0|items\.length === 0[\s\S]*error/);
assert.match(detailModel, /formId/);
assert.match(detailModel, /retryForm/);
assert.doesNotMatch(detailModel, /findRecruitForm\(data\.companyName/);
assert.match(detailPage, /retryForm/);
assert.match(detailPage, /formError/);

const { findRecruitForm } = await import(
  "../../src/fsd/pages/recruit-detail/model/formMatching.ts"
);
assert.equal(
  findRecruitForm(null, [{ id: 7, title: "Acme application" }]),
  null,
  "company/title similarity must not create an implicit form link",
);

console.log("student recruit resilience contract passed");
