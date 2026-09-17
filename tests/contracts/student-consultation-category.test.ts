import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const hook = read("src/fsd/features/submit-consultation/model/useConsultationForm.ts");
const form = read("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx");

assert.match(hook, /category/);
assert.match(hook, /category[,}]/);
assert.match(hook, /if \(!category\) return "상담 카테고리를 선택해주세요"/);
assert.match(form, /학업/);
assert.match(form, /취업/);
assert.match(form, /진학/);
assert.match(form, /생활/);
assert.match(form, /기타/);
assert.match(form, /CATEGORY_OPTIONS/);
assert.match(form, /aria-pressed=\{category === item\}/);

assert.match(hook, /\| "category"/);
assert.match(hook, /return "category"/);
assert.match(hook, /sessionStorage\.setItem/);
assert.match(form, /errorTarget === "category" \? "ring-1 ring-\[#E53935\]"/);

console.log("student consultation category contract passed");
