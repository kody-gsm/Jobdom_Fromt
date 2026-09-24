import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "src/fsd/features/submit-form/ui/SubmitForm.tsx"),
  "utf8",
);

assert.doesNotMatch(source, /Promise\.all/);
assert.match(source, /formLoading/);
assert.match(source, /formError/);
assert.match(source, /submissionLoading/);
assert.match(source, /submissionError/);
assert.match(source, /retrySubmission/);
assert.match(source, /formRequestVersion/);
assert.match(source, /formId/);
assert.match(source, /disabled=\{[^}]*submissionLoading/);
assert.match(source, /setValues\(valuesFromSubmission\(loadedSubmission\)\)/);

console.log("student form async state contract passed");
