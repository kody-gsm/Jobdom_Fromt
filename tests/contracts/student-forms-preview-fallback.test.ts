import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  withFormPreviewFallback,
} from "../../src/fsd/pages/forms/model/previewForms.ts";

const real = [{
  id: 1,
  title: "실제 폼",
  description: null,
  status: "PUBLISHED" as const,
  questionCount: 1,
  createdAt: "2026-09-07T00:00:00",
}];

assert.equal(withFormPreviewFallback(real), real);
const preview = withFormPreviewFallback([]);
assert.equal(preview.length, 2);
assert.match(preview[0].title, /취업 희망 기업/);
assert.match(preview[1].title, /현장실습/);
assert.ok(preview.every((form) => form.id < 0));

const hook = readFileSync("src/fsd/pages/forms/model/useFormsPage.ts", "utf8");
const page = readFileSync("src/fsd/pages/forms/ui/FormsPage.tsx", "utf8");
assert.match(hook, /withFormPreviewFallback/);
assert.match(page, /form\.id < 0/);
console.log("student forms preview fallback contract passed");