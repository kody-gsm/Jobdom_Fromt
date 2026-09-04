import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const widgetPath = "src/fsd/widgets/student-header/ui/StudentHeader.tsx";
const modelPath = "src/fsd/widgets/student-header/model/navigation.ts";
const indexPath = "src/fsd/widgets/student-header/index.ts";

for (const path of [widgetPath, modelPath, indexPath]) {
  assert.ok(existsSync(path), `${path} must exist`);
}

const widget = readFileSync(widgetPath, "utf8");
const index = readFileSync(indexPath, "utf8");
assert.match(index, /StudentHeader/);
assert.match(widget, /@fsd\/features\/logout/);
assert.match(widget, /JobdamIcon\.svg/);
assert.match(widget, /href="\/"/);
assert.match(widget, /href="\/profile"/);
assert.doesNotMatch(widget, /\/teacher|\/admin/);

const { STUDENT_NAV_ITEMS, isStudentNavActive } = await import("../../src/fsd/widgets/student-header/model/navigation.ts");
assert.deepEqual(STUDENT_NAV_ITEMS, [
  { href: "/", label: "상담 대시보드" },
  { href: "/counsel", label: "상담 신청" },
]);
assert.equal(isStudentNavActive("/", "/"), true);
assert.equal(isStudentNavActive("/counsel", "/counsel"), true);
assert.equal(isStudentNavActive("/counsel/complete", "/counsel"), true);
assert.equal(isStudentNavActive("/profile", "/counsel"), false);

