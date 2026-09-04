import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const listRoute = read("app/forms/page.tsx");
const detailRoute = read("app/forms/[id]/page.tsx");
const submitFeature = read("src/fsd/features/submit-form/ui/SubmitForm.tsx");

assert.match(listRoute, /@fsd\/pages\/forms/);
assert.match(detailRoute, /@fsd\/pages\/form-detail/);
assert.match(submitFeature, /getMissingRequiredQuestion/);
assert.match(submitFeature, /buildFormAnswers/);
assert.match(submitFeature, /이미 제출한 폼입니다\./);
assert.match(submitFeature, /응답을 제출했습니다\./);
assert.match(submitFeature, /submitForm/);
assert.match(submitFeature, /FormQuestion/);

console.log("form fsd pages contract passed");
