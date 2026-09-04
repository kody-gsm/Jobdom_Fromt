import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const page = read("src/fsd/pages/counsel/ui/CounselPage.tsx");
const form = read("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx");

assert.match(page, /StudentHeader/);
assert.match(page, /상담 신청을 차근차근 진행해보세요/);
assert.doesNotMatch(page, /SiteHeader/);

assert.match(form, /SegmentedTabs/);
assert.match(form, /TextField/);
assert.match(form, /TextAreaField/);
assert.match(form, /ContentCard/);
assert.match(form, /ActionButton/);
assert.match(form, /진로 상담/);
assert.match(form, /일반 상담/);
