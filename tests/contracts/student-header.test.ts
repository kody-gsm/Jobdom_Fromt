import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const widgetPath = "src/fsd/widgets/student-header/ui/StudentHeader.tsx";
const modelPath = "src/fsd/widgets/student-header/model/navigation.ts";
const indexPath = "src/fsd/widgets/student-header/index.ts";
for (const path of [widgetPath, modelPath, indexPath]) assert.ok(existsSync(path), `${path} must exist`);

const widget = readFileSync(widgetPath, "utf8");
const index = readFileSync(indexPath, "utf8");
assert.match(index, /StudentHeader/);
assert.match(widget, /@fsd\/features\/logout/);
assert.match(widget, /JobdamIcon\.svg/);
assert.match(widget, /href="\/profile"/);
assert.doesNotMatch(widget, /\/teacher|\/admin/);

const { STUDENT_NAV_ITEMS, isStudentNavActive } = await import("../../src/fsd/widgets/student-header/model/navigation.ts");
assert.deepEqual(STUDENT_NAV_ITEMS, [
  { href: "/", label: "상담 대시보드" },
  { href: "/counsel", label: "상담 신청" },
  { href: "/recruit", label: "취업 공고" },
]);
assert.equal(isStudentNavActive("/recruit", "/recruit"), true);
assert.equal(isStudentNavActive("/recruit/3", "/recruit"), true);
assert.match(widget, /hover:text-brand-accent/);
assert.match(widget, /text-brand/);
assert.doesNotMatch(widget, /#315B83|#10243E/);
assert.equal((widget.match(/h-11 w-11/g) ?? []).length, 2);
assert.match(widget, /src="\/profileIcon\.svg"[\s\S]{0,160}width=\{18\}[\s\S]{0,40}height=\{18\}/);

console.log("student header navigation contract passed");
