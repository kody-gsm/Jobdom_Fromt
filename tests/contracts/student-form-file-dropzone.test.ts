import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "src/fsd/features/submit-form/ui/SubmitForm.tsx"),
  "utf8",
);

assert.match(source, /onDragOver/);
assert.match(source, /onDrop/);
assert.match(source, /dataTransfer\.files/);
assert.match(source, /fileInputRef/);
assert.match(source, /fileInputRef\.current\?\.click\(\)/);
assert.match(source, /파일 선택/);
assert.match(source, /재응답/);
assert.doesNotMatch(source, /응답 재응답/);

console.log("student form file dropzone contract passed");
