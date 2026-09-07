import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const hook = read("src/fsd/features/submit-consultation/model/useConsultationForm.ts");
const form = read("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx");

assert.match(hook, /ConsultationErrorTarget/);
assert.match(hook, /제목을 입력해주세요[\s\S]{0,120}title/);
assert.match(hook, /내용을 입력해주세요[\s\S]{0,120}content/);
assert.match(hook, /선생님을 선택해주세요[\s\S]{0,120}teacher/);
assert.match(hook, /날짜를 선택해주세요[\s\S]{0,120}date/);
assert.match(hook, /교시를 선택해주세요[\s\S]{0,120}period/);
assert.match(hook, /scrollIntoView\(\{[\s\S]{0,120}behavior:\s*["']smooth["'][\s\S]{0,120}block:\s*["']center["']/);
assert.match(hook, /\.focus\(\)/);
assert.match(hook, /setErrorTarget\(null\)/);
assert.match(form, /errorTarget === "teacher"/);
assert.match(form, /errorTarget === "date"/);
assert.match(form, /errorTarget === "period"/);
assert.match(form, /border-red-500|border-\[#E53935\]/);

console.log("student consultation error focus contract passed");
