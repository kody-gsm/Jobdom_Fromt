import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const types = readFileSync("src/fsd/entities/form/model/types.ts", "utf8");
const listPage = readFileSync("src/fsd/pages/forms/ui/FormsPage.tsx", "utf8");
const preview = readFileSync("src/fsd/pages/forms/model/previewForms.ts", "utf8");
const submitForm = readFileSync("src/fsd/features/submit-form/ui/SubmitForm.tsx", "utf8");

assert.match(types, /deadline: string \| null/);
assert.match(preview, /deadline:/);
assert.match(listPage, /제한 기한/);
assert.match(listPage, /form\.deadline/);
assert.match(listPage, /bg-\[#02C551\]/);
assert.doesNotMatch(listPage, /bg-\[#10243E\]/);

assert.match(submitForm, /제한 기한/);
assert.match(submitForm, /form\.deadline/);
assert.match(submitForm, /bg-\[#02C551\]/);
assert.match(submitForm, /accent-\[#02C551\]/);
assert.doesNotMatch(submitForm, /bg-\[#10243E\]/);

console.log("student forms deadline and main color contract passed");
