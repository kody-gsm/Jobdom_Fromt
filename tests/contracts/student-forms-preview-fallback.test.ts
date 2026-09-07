import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const hook = readFileSync("src/fsd/pages/forms/model/useFormsPage.ts", "utf8");
const page = readFileSync("src/fsd/pages/forms/ui/FormsPage.tsx", "utf8");

assert.equal(existsSync("src/fsd/pages/forms/model/previewForms.ts"), false);
assert.doesNotMatch(hook, /withFormPreviewFallback|previewForms/);
assert.match(hook, /\.then\(setForms\)/);
assert.doesNotMatch(page, /form\.id < 0/);
assert.match(page, /공개된 폼이 없습니다/);
console.log("student forms real-data-only contract passed");