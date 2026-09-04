import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const navigateHome = read("src/fsd/features/navigate-home/ui/HomeLogoButton.tsx");

assert.match(navigateHome, /getSession/);
assert.match(navigateHome, /getSession\(\)\?\.role\s*===\s*["']STUDENT["']/);
assert.match(navigateHome, /router\.push\(["']\/["']\)/);

for (const path of [
  "app/(auth)/login/page.tsx",
  "app/(auth)/signup/page.tsx",
  "app/(auth)/forgot-password/page.tsx",
]) {
  assert.doesNotMatch(read(path), /HomeLogoButton/);
}

const counselPage = read("src/fsd/pages/counsel/ui/CounselPage.tsx");
const studentHeader = read("src/fsd/widgets/student-header/ui/StudentHeader.tsx");
assert.match(counselPage, /@fsd\/widgets\/student-header/);
assert.match(studentHeader, /href="\/"|href=\{"\/"\}/);
assert.match(studentHeader, /aria-label="상담 대시보드로 이동"/);

console.log("student home logo contract passed");
