import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const types = readFileSync("src/fsd/entities/form/model/types.ts", "utf8");
const listPage = readFileSync("src/fsd/pages/forms/ui/FormsPage.tsx", "utf8");
const submitForm = readFileSync("src/fsd/features/submit-form/ui/SubmitForm.tsx", "utf8");

assert.match(types, /deadline: string \| null/);
assert.match(listPage, /제한 기한/);
assert.match(listPage, /form\.deadline/);
assert.match(listPage, /bg-brand/);
assert.doesNotMatch(listPage, /bg-\[#10243E\]/);

assert.match(submitForm, /제한 기한/);
assert.match(submitForm, /form\.deadline/);
assert.match(submitForm, /bg-brand/);
assert.match(submitForm, /accent-brand/);
assert.doesNotMatch(submitForm, /bg-\[#10243E\]/);

console.log("student forms deadline and main color contract passed");