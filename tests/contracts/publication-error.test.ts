import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getFormErrorMessage } from "../../src/fsd/entities/form/model/errors.ts";
import { getRecruitErrorMessage } from "../../src/fsd/entities/recruit/model/errors.ts";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

assert.equal(
  getFormErrorMessage({ code: "FORM_NOT_PUBLISHED", status: 404 }, "fallback"),
  "아직 공개되지 않은 폼입니다.",
);
assert.equal(
  getFormErrorMessage({ code: "FORM_CLOSED", status: 404 }, "fallback"),
  "마감된 폼입니다. 더 이상 응답을 받지 않습니다.",
);
assert.equal(
  getRecruitErrorMessage({ code: "RECRUIT_NOT_PUBLISHED", status: 404 }, "fallback"),
  "아직 공개되지 않은 공고입니다.",
);
assert.equal(
  getRecruitErrorMessage({ code: "RECRUIT_CLOSED", status: 404 }, "fallback"),
  "서류 접수가 마감된 공고입니다.",
);

const submitForm = read("src/fsd/features/submit-form/ui/SubmitForm.tsx");
const recruitDetail = read("src/fsd/pages/recruit-detail/ui/RecruitDetailPage.tsx");
const recruitDetailModel = read("src/fsd/pages/recruit-detail/model/useRecruitDetail.ts");
assert.match(submitForm, /isFormClosed/);
assert.match(submitForm, /getFormErrorMessage/);
assert.match(recruitDetail, /isRecruitClosed/);
assert.match(recruitDetailModel, /getRecruitErrorMessage/);

console.log("publication status and error code contract passed");
