import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const page = read("src/fsd/pages/counsel/ui/CounselPage.tsx");
const form = read("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx");
const hook = read("src/fsd/features/submit-consultation/model/useConsultationForm.ts");
const segmentedTabs = read("src/fsd/shared/ui/SegmentedTabs.tsx");

assert.match(page, /StudentHeader/);
assert.match(page, /상담 신청/);
assert.doesNotMatch(page, /상담 신청을 차근차근 진행해보세요|CONSULTATION|rounded-\[28px\][^\n]*bg-\[#10243E\]/);
assert.doesNotMatch(page, /SiteHeader/);

assert.match(form, /SegmentedTabs/);
assert.match(form, /TextField/);
assert.match(form, /TextAreaField/);
assert.match(form, /ContentCard/);
assert.match(form, /ActionButton/);
assert.match(form, /useConsultationForm/);
assert.doesNotMatch(form, /useState|useEffect|submitConsultation|getUpcomingConsultations/);
assert.match(hook, /useState/);
assert.match(hook, /submitConsultation/);
assert.match(hook, /getConsultationTeachers/);
assert.doesNotMatch(hook, /getUpcomingConsultations|setHasCareerReservation/);
assert.match(hook, /validateConsultationDraft/);
assert.match(form, /진로 상담/);
assert.match(form, /label: "일반 상담"/);
assert.match(form, /key=\{counselType\}/);
assert.match(segmentedTabs, /transition-all/);
assert.equal((form.match(/bg-brand(?!-)/g) ?? []).length, 1);
assert.doesNotMatch(form, /hover:bg-green|hover:border-green/);
assert.match(form, /grid-cols-5/);
assert.match(form, /toggleTime\(row\.period\)[\s\S]{0,320}min-h-\[48px\]/);
