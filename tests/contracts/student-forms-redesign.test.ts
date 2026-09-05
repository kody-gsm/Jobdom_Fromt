import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const hookPath = "src/fsd/pages/forms/model/useFormsPage.ts";

assert.ok(existsSync(hookPath), "forms list hook is required");

const listPage = read("src/fsd/pages/forms/ui/FormsPage.tsx");
const detailPage = read("src/fsd/pages/form-detail/ui/FormDetailPage.tsx");
const submitForm = read("src/fsd/features/submit-form/ui/SubmitForm.tsx");
const hook = read(hookPath);

assert.match(listPage, /StudentHeader/);
assert.match(detailPage, /StudentHeader/);
assert.doesNotMatch(listPage, /SiteHeader/);
assert.doesNotMatch(detailPage, /SiteHeader/);

assert.match(listPage, /ContentCard/);
assert.match(listPage, /useFormsPage/);
assert.doesNotMatch(listPage, /useState|useEffect|formsApi/);
assert.match(hook, /formsApi/);

assert.match(listPage, /학생 신청 폼/);
assert.match(detailPage, /신청 폼 작성/);
assert.match(submitForm, /ContentCard/);
assert.match(submitForm, /ActionButton/);
assert.match(submitForm, /bg-\[#10243E\]/);
assert.match(detailPage, /href="\/forms"[^\n]*min-h-11/);
assert.match(submitForm, /<label key=\{option\.id\} className="[^"]*min-h-11/);
