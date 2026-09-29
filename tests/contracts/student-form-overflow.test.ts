import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const submitFeature = readFileSync(
  resolve(process.cwd(), "src/fsd/features/submit-form/ui/SubmitForm.tsx"),
  "utf8",
);

assert.match(submitFeature, /<div className="min-w-0 space-y-5 p-6 sm:p-9">/);
assert.match(submitFeature, /<p className="mt-2 min-w-0 wrap-anywhere whitespace-pre-line text-gray-900">/);
assert.match(submitFeature, /<label key=\{option\.id\} className="flex min-h-11 min-w-0 items-center/);
assert.match(submitFeature, /<span className="min-w-0 wrap-anywhere">\s*\{option\.label\}/);

console.log("student form overflow contract passed");
